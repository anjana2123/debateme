from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Achievement(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    condition: str
    points: int
    unlocked: bool = False
    unlocked_at: Optional[datetime] = None

class UserStats(BaseModel):
    user_id: str
    total_debates: int = 0
    debates_won: int = 0
    debates_lost: int = 0
    debates_drawn: int = 0
    total_rounds: int = 0
    fallacies_caught: int = 0
    evidence_cited: int = 0
    concessions: int = 0
    current_streak: int = 0
    longest_streak: int = 0
    total_points: int = 0
    level: int = 1
    achievements: List[Achievement] = []

class LeaderboardEntry(BaseModel):
    rank: int
    user_id: str
    username: str
    total_points: int
    debates_won: int
    level: int
    achievements_count: int