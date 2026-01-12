from typing import Dict, Any, List
import uuid
from datetime import datetime
from app.agents import (
    StanceDetectorAgent,
    EvidenceRetrieverAgent,
    FallacyDetectorAgent,
    ArgumentGeneratorAgent,
    DebateModeratorAgent
)
from app.models.schemas import DebateResponse, Evidence, Fallacy
from app.core.config import settings
from app.services.gamification_service import gamification_service

class DebateService:
    def __init__(self):
        self.stance_detector = StanceDetectorAgent()
        self.evidence_retriever = EvidenceRetrieverAgent()
        self.fallacy_detector = FallacyDetectorAgent()
        self.argument_generator = ArgumentGeneratorAgent()
        self.moderator = DebateModeratorAgent()
        
        # In-memory storage
        self.debates: Dict[str, Dict] = {}
    
    def _detect_concession(self, text: str) -> bool:
        """Detect if user is conceding"""
        text_lower = text.lower().strip()
        
        concession_phrases = [
            "i agree", "you're right", "you win", "i concede",
            "fair point", "i give up", "you've convinced me",
            "that's true", "i see your point", "valid point",
            "good point", "touché", "you got me"
        ]
        
        short_agreements = ["yeah", "yep", "ok", "fine", "true", "agreed"]
        
        if any(phrase in text_lower for phrase in concession_phrases):
            return True
        
        if len(text.split()) <= 10 and any(word in text_lower for word in short_agreements):
            return True
        
        return False
    
    async def start_debate(self, topic: str, user_stance: str, mode: str = "normal", max_rounds: int = 10, user_id: str = "guest") -> DebateResponse:
        """Start a new debate"""
        
        debate_id = str(uuid.uuid4())
        
        # Detect user's stance
        stance_data = await self.stance_detector.execute({
            "topic": topic,
            "user_argument": user_stance
        })
        
        # Determine counter stance
        counter_stance = "against" if "for" in stance_data.get("stance", "").lower() else "for"
        
        # Retrieve evidence for counter-argument
        evidence_data = await self.evidence_retriever.execute({
            "topic": topic,
            "counter_stance": f"{counter_stance} {topic}"
        })
        
        # Generate counter-argument
        argument_data = await self.argument_generator.execute({
            "topic": topic,
            "user_stance": stance_data.get("stance"),
            "user_argument": user_stance,
            "evidence": evidence_data.get("evidence", []),
            "mode": mode,
            "round_number": 1,
            "debate_history": []
        })
        
        # Detect fallacies in user's argument
        fallacy_data = await self.fallacy_detector.execute({
            "argument": user_stance
        })
        
        # Store debate with user_id
        self.debates[debate_id] = {
            "id": debate_id,
            "user_id": user_id,
            "topic": topic,
            "mode": mode,
            "max_rounds": max_rounds,
            "started_at": datetime.utcnow(),
            "rounds": [
                {
                    "round": 1,
                    "user": user_stance,
                    "ai": argument_data.get("counter_argument"),
                    "user_fallacies": fallacy_data.get("fallacies", []),
                    "evidence": evidence_data.get("evidence", [])
                }
            ],
            "user_score": 50,
            "ai_score": 50
        }
        
        return DebateResponse(
            debate_id=debate_id,
            ai_counter_argument=argument_data.get("counter_argument"),
            evidence=[Evidence(**e) for e in evidence_data.get("evidence", [])],
            fallacies_detected=[Fallacy(**f) for f in fallacy_data.get("fallacies", [])],
            round_number=1,
            is_debate_ended=False,
            ai_score=50,
            user_score=50,
            suggestions="Make your next argument stronger with specific evidence!"
        )
    
    async def continue_debate(self, debate_id: str, user_argument: str) -> DebateResponse:
        """Continue an existing debate"""
        
        if debate_id not in self.debates:
            raise ValueError("Debate not found")
        
        debate = self.debates[debate_id]
        current_round = len(debate["rounds"]) + 1
        max_rounds = debate.get("max_rounds", 10)
        
        # Check for concession
        if self._detect_concession(user_argument):
            debate["rounds"].append({
                "round": current_round,
                "user": user_argument,
                "ai": "You've conceded the point. Excellent debate - knowing when to acknowledge a strong argument is a sign of intellectual maturity.",
                "user_fallacies": [],
                "evidence": []
            })
            return await self._end_debate(debate_id, user_conceded=True)
        
        # Check if max rounds reached
        if current_round > max_rounds:
            return await self._end_debate(debate_id)
        
        # Retrieve evidence
        evidence_data = await self.evidence_retriever.execute({
            "topic": debate["topic"],
            "counter_stance": user_argument
        })
        
        # Generate counter-argument
        argument_data = await self.argument_generator.execute({
            "topic": debate["topic"],
            "user_stance": "counter",
            "user_argument": user_argument,
            "evidence": evidence_data.get("evidence", []),
            "mode": debate["mode"],
            "round_number": current_round,
            "debate_history": debate["rounds"]
        })
        
        # Detect fallacies
        fallacy_data = await self.fallacy_detector.execute({
            "argument": user_argument
        })
        
        # Get moderation
        moderation = await self.moderator.execute({
            "topic": debate["topic"],
            "debate_history": debate["rounds"],
            "round_number": current_round,
            "max_rounds": max_rounds
        })
        
        # Update scores
        debate["user_score"] = moderation.get("user_score", 50)
        debate["ai_score"] = moderation.get("ai_score", 50)
        
        # Add new round
        debate["rounds"].append({
            "round": current_round,
            "user": user_argument,
            "ai": argument_data.get("counter_argument"),
            "user_fallacies": fallacy_data.get("fallacies", []),
            "evidence": evidence_data.get("evidence", [])
        })
        
        # Check if debate should end
        if moderation.get("should_end"):
            return await self._end_debate(debate_id)
        
        return DebateResponse(
            debate_id=debate_id,
            ai_counter_argument=argument_data.get("counter_argument"),
            evidence=[Evidence(**e) for e in evidence_data.get("evidence", [])],
            fallacies_detected=[Fallacy(**f) for f in fallacy_data.get("fallacies", [])],
            round_number=current_round,
            is_debate_ended=False,
            ai_score=debate["ai_score"],
            user_score=debate["user_score"],
            suggestions=moderation.get("suggestions")
        )
    
    async def _end_debate(self, debate_id: str, user_conceded: bool = False) -> DebateResponse:
        """End debate and provide summary"""
        
        debate = self.debates[debate_id]
        
        moderation = await self.moderator.execute({
            "topic": debate["topic"],
            "debate_history": debate["rounds"],
            "round_number": len(debate["rounds"]),
            "max_rounds": debate.get("max_rounds", 10)
        })
        
        # Get user_id from debate
        user_id = debate.get("user_id", "guest")
        
        # Only update stats if logged in (not guest)
        if user_id != "guest":
            try:
                print(f"[GAMIFICATION] Updating stats for logged-in user: {user_id}")
                
                user_won = moderation.get("user_score", 50) > moderation.get("ai_score", 50)
                evidence_count = sum(len(r.get("evidence", [])) for r in debate["rounds"])
                fallacy_count = sum(len(r.get("user_fallacies", [])) for r in debate["rounds"])
                
                gamification_service.update_stats_after_debate(
                    user_id=user_id,
                    won=user_won,
                    rounds=len(debate["rounds"]),
                    evidence_count=evidence_count,
                    fallacy_count=fallacy_count,
                    conceded=user_conceded
                )
                print(f"[GAMIFICATION] ✅ Stats updated successfully!")
            except Exception as e:
                print(f"[ERROR] Gamification failed: {e}")
                import traceback
                traceback.print_exc()
        else:
            print(f"[GAMIFICATION] Skipping stats for guest user")
        
        if user_conceded:
            feedback = "You conceded, showing intellectual honesty. Great debate!"
        else:
            feedback = moderation.get('final_feedback', 'You argued well!')
        
        return DebateResponse(
            debate_id=debate_id,
            ai_counter_argument=f"Debate concluded. {feedback}",
            evidence=[],
            fallacies_detected=[],
            round_number=len(debate["rounds"]),
            is_debate_ended=True,
            ai_score=moderation.get("ai_score", debate.get("ai_score", 50)),
            user_score=moderation.get("user_score", debate.get("user_score", 50)),
            suggestions=feedback
        )