from typing import Dict, Any
from .base_agent import BaseAgent

class ConcessionDetectorAgent(BaseAgent):
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Detect if user is conceding/agreeing"""
        
        user_argument = input_data.get("user_argument", "").lower()
        
        # Concession phrases
        concession_phrases = [
            "i agree", "you're right", "you win", "i concede",
            "fair point", "i give up", "you've convinced me",
            "that's true", "valid point", "ok you're right", "fine you win"
        ]
        
        # Check if any concession phrase is in the argument
        is_conceding = any(phrase in user_argument for phrase in concession_phrases)
        
        # Also check if argument is too short (likely agreement)
        if len(user_argument.strip().split()) <= 5 and is_conceding:
            is_conceding = True
        
        return {
            "is_conceding": is_conceding,
            "confidence": 0.9 if is_conceding else 0.1
        }