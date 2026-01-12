from typing import Dict, List, Optional
from datetime import datetime
from app.models.gamification import Achievement, UserStats, LeaderboardEntry
from app.config.supabase import supabase_admin

class GamificationService:
    def __init__(self):
        # Achievement definitions (same as before)
        self.achievement_definitions = [
            {
                "id": "first_blood",
                "name": "First Blood",
                "description": "Win your first debate",
                "icon": "trophy",
                "condition": "debates_won >= 1",
                "points": 50
            },
            {
                "id": "evidence_master",
                "name": "Evidence Master",
                "description": "Cite 10+ evidence sources",
                "icon": "book",
                "condition": "evidence_cited >= 10",
                "points": 100
            },
            {
                "id": "fallacy_hunter",
                "name": "Fallacy Hunter",
                "description": "Get 5 fallacies detected in your arguments",
                "icon": "target",
                "condition": "fallacies_caught >= 5",
                "points": 75
            },
            {
                "id": "marathon_debater",
                "name": "Marathon Debater",
                "description": "Complete 10 debates",
                "icon": "flame",
                "condition": "total_debates >= 10",
                "points": 150
            },
            {
                "id": "graceful_concession",
                "name": "Graceful Concession",
                "description": "Concede with honor 3 times",
                "icon": "handshake",
                "condition": "concessions >= 3",
                "points": 100
            },
            {
                "id": "winning_streak",
                "name": "Winning Streak",
                "description": "Win 5 debates in a row",
                "icon": "fire",
                "condition": "current_streak >= 5",
                "points": 200
            },
            {
                "id": "debate_veteran",
                "name": "Debate Veteran",
                "description": "Complete 50 rounds across all debates",
                "icon": "star",
                "condition": "total_rounds >= 50",
                "points": 250
            },
            {
                "id": "perfectionist",
                "name": "Perfectionist",
                "description": "Win a debate with no fallacies detected",
                "icon": "gem",
                "condition": "custom",
                "points": 150
            }
        ]
    
    def get_or_create_stats(self, user_id: str) -> UserStats:
        """Get user stats from Supabase or create if not exists"""
        try:
            # Get stats from database
            response = supabase_admin.table('user_stats').select('*').eq('user_id', user_id).execute()
            
            if not response.data:
                # Create default stats
                new_stats = {
                    'user_id': user_id,
                    'total_debates': 0,
                    'debates_won': 0,
                    'debates_lost': 0,
                    'debates_drawn': 0,
                    'total_rounds': 0,
                    'fallacies_caught': 0,
                    'evidence_cited': 0,
                    'concessions': 0,
                    'current_streak': 0,
                    'longest_streak': 0,
                    'total_points': 0,
                    'level': 1
                }
                supabase_admin.table('user_stats').insert(new_stats).execute()
                stats_data = new_stats
            else:
                stats_data = response.data[0]
            
            # Get user's unlocked achievements
            achievements_response = supabase_admin.table('user_achievements')\
                .select('achievement_id, unlocked_at')\
                .eq('user_id', user_id)\
                .execute()
            
            unlocked_ids = {a['achievement_id']: a['unlocked_at'] for a in achievements_response.data}
            
            # Build achievement list
            achievements = []
            for ach_def in self.achievement_definitions:
                achievements.append(Achievement(
                    id=ach_def['id'],
                    name=ach_def['name'],
                    description=ach_def['description'],
                    icon=ach_def['icon'],
                    condition=ach_def['condition'],
                    points=ach_def['points'],
                    unlocked=ach_def['id'] in unlocked_ids,
                    unlocked_at=unlocked_ids.get(ach_def['id'])
                ))
            
            return UserStats(
                user_id=stats_data['user_id'],
                total_debates=stats_data['total_debates'],
                debates_won=stats_data['debates_won'],
                debates_lost=stats_data['debates_lost'],
                debates_drawn=stats_data['debates_drawn'],
                total_rounds=stats_data['total_rounds'],
                fallacies_caught=stats_data['fallacies_caught'],
                evidence_cited=stats_data['evidence_cited'],
                concessions=stats_data['concessions'],
                current_streak=stats_data['current_streak'],
                longest_streak=stats_data['longest_streak'],
                total_points=stats_data['total_points'],
                level=stats_data['level'],
                achievements=achievements
            )
            
        except Exception as e:
            print(f"Error getting stats: {e}")
            raise
    
    def update_stats_after_debate(
        self, 
        user_id: str, 
        won: bool, 
        rounds: int, 
        evidence_count: int,
        fallacy_count: int,
        conceded: bool
    ) -> UserStats:
        """Update user stats after a debate - SAVES TO DATABASE"""
        
        print(f"[GAMIFICATION] Updating stats for user: {user_id}")
        print(f"[GAMIFICATION] Won: {won}, Rounds: {rounds}, Evidence: {evidence_count}, Fallacies: {fallacy_count}, Conceded: {conceded}")
        
        stats = self.get_or_create_stats(user_id)
        
        # Calculate new values
        new_total_debates = stats.total_debates + 1
        new_total_rounds = stats.total_rounds + rounds
        new_evidence_cited = stats.evidence_cited + evidence_count
        new_fallacies_caught = stats.fallacies_caught + fallacy_count
        
        if won:
            new_debates_won = stats.debates_won + 1
            new_current_streak = stats.current_streak + 1
            new_longest_streak = max(stats.longest_streak, new_current_streak)
            new_debates_lost = stats.debates_lost
            new_concessions = stats.concessions
        elif conceded:
            new_debates_lost = stats.debates_lost + 1
            new_concessions = stats.concessions + 1
            new_current_streak = 0
            new_longest_streak = stats.longest_streak
            new_debates_won = stats.debates_won
        else:
            new_debates_lost = stats.debates_lost + 1
            new_current_streak = 0
            new_longest_streak = stats.longest_streak
            new_debates_won = stats.debates_won
            new_concessions = stats.concessions
        
        # Calculate points
        points_earned = self._calculate_points(won, rounds, evidence_count, fallacy_count)
        new_total_points = stats.total_points + points_earned
        new_level = (new_total_points // 500) + 1
        
        print(f"[GAMIFICATION] New stats - Debates: {new_total_debates}, Won: {new_debates_won}, Concessions: {new_concessions}, Points: {new_total_points}")
        
        # Update in database
        supabase_admin.table('user_stats').update({
            'total_debates': new_total_debates,
            'debates_won': new_debates_won,
            'debates_lost': new_debates_lost,
            'total_rounds': new_total_rounds,
            'evidence_cited': new_evidence_cited,
            'fallacies_caught': new_fallacies_caught,
            'concessions': new_concessions,
            'current_streak': new_current_streak,
            'longest_streak': new_longest_streak,
            'total_points': new_total_points,
            'level': new_level,
            'updated_at': datetime.utcnow().isoformat()
        }).eq('user_id', user_id).execute()
        
        print(f"[GAMIFICATION] Stats saved to database!")
        
        # Check achievements
        self._check_and_unlock_achievements(user_id, {
            'total_debates': new_total_debates,
            'debates_won': new_debates_won,
            'total_rounds': new_total_rounds,
            'evidence_cited': new_evidence_cited,
            'fallacies_caught': new_fallacies_caught,
            'concessions': new_concessions,
            'current_streak': new_current_streak,
            'perfect_game': fallacy_count == 0 and won
        })
        
        return self.get_or_create_stats(user_id)
    
    def _calculate_points(self, won: bool, rounds: int, evidence_count: int, fallacy_count: int) -> int:
        """Calculate points earned"""
        points = 0
        
        if won:
            points += 100
            points += rounds * 10
        else:
            points += 25
        
        points += evidence_count * 5
        points -= fallacy_count * 10
        
        return max(points, 0)
    
    def _check_and_unlock_achievements(self, user_id: str, stats: dict):
        """Check and unlock achievements - SAVES TO DATABASE"""
        
        print(f"[GAMIFICATION] Checking achievements for user: {user_id}")
        
        # Get currently unlocked achievements
        unlocked_response = supabase_admin.table('user_achievements')\
            .select('achievement_id')\
            .eq('user_id', user_id)\
            .execute()
        
        unlocked_ids = {a['achievement_id'] for a in unlocked_response.data}
        
        for ach_def in self.achievement_definitions:
            if ach_def['id'] in unlocked_ids:
                continue
            
            # Check condition
            should_unlock = False
            
            if ach_def['id'] == 'perfectionist' and stats.get('perfect_game'):
                should_unlock = True
            elif ach_def['condition'] != 'custom':
                try:
                    should_unlock = eval(ach_def['condition'], {"__builtins__": {}}, stats)
                except:
                    pass
            
            if should_unlock:
                print(f"[GAMIFICATION] 🎉 Unlocking achievement: {ach_def['name']}")
                
                # Unlock achievement in database
                supabase_admin.table('user_achievements').insert({
                    'user_id': user_id,
                    'achievement_id': ach_def['id'],
                    'unlocked_at': datetime.utcnow().isoformat()
                }).execute()
                
                # Add points to user stats
                current_stats = supabase_admin.table('user_stats')\
                    .select('total_points')\
                    .eq('user_id', user_id)\
                    .single()\
                    .execute()
                
                new_points = current_stats.data['total_points'] + ach_def['points']
                new_level = (new_points // 500) + 1
                
                supabase_admin.table('user_stats').update({
                    'total_points': new_points,
                    'level': new_level
                }).eq('user_id', user_id).execute()
                
                print(f"[GAMIFICATION] Achievement unlocked! +{ach_def['points']} points")
    
    def get_leaderboard(self, limit: int = 10) -> List[LeaderboardEntry]:
        """Get top players from database"""
        try:
            response = supabase_admin.table('user_stats')\
                .select('user_id, total_points, debates_won, level')\
                .order('total_points', desc=True)\
                .limit(limit)\
                .execute()
            
            leaderboard = []
            for idx, entry in enumerate(response.data):
                # Get username
                profile = supabase_admin.table('user_profiles')\
                    .select('username')\
                    .eq('id', entry['user_id'])\
                    .single()\
                    .execute()
                
                # Get achievement count
                ach_response = supabase_admin.table('user_achievements')\
                    .select('achievement_id', count='exact')\
                    .eq('user_id', entry['user_id'])\
                    .execute()
                
                leaderboard.append(LeaderboardEntry(
                    rank=idx + 1,
                    user_id=entry['user_id'],
                    username=profile.data['username'],
                    total_points=entry['total_points'],
                    debates_won=entry['debates_won'],
                    level=entry['level'],
                    achievements_count=len(ach_response.data) if ach_response.data else 0
                ))
            
            return leaderboard
            
        except Exception as e:
            print(f"Error getting leaderboard: {e}")
            return []

# Global instance
gamification_service = GamificationService()