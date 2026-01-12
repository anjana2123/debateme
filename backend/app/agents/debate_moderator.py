from typing import Dict, Any
from .base_agent import BaseAgent
import json

class DebateModeratorAgent(BaseAgent):
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Moderate debate, decide if it should end, provide scores and feedback"""
        
        topic = input_data.get("topic")
        debate_history = input_data.get("debate_history", [])
        round_number = input_data.get("round_number")
        max_rounds = input_data.get("max_rounds", 10)
        
        # Build debate summary
        debate_summary = f"Topic: {topic}\n\n"
        for h in debate_history:
            debate_summary += f"Round {h['round']}:\n"
            debate_summary += f"User: {h['user'][:150]}...\n"
            debate_summary += f"AI: {h['ai'][:150]}...\n\n"
        
        prompt = f"""You are a debate moderator. Analyze this debate and provide scores and feedback.

{debate_summary}

Current Round: {round_number}/{max_rounds}

Evaluate and return ONLY valid JSON:
{{
    "should_end": boolean (true if debate is getting repetitive, going in circles, or max rounds reached),
    "user_score": number (0-100, based on logic, evidence, and argument quality),
    "ai_score": number (0-100),
    "user_strengths": ["strength1", "strength2"],
    "user_weaknesses": ["weakness1", "weakness2"],
    "suggestions": "Brief suggestion for user's next argument (if debate continues)",
    "final_feedback": "Overall feedback (if debate ending)"
}}"""

        response = await self.llm.ainvoke(prompt)
        
        try:
            content = response.content.strip()
            if content.startswith("```json"):
                content = content.split("```json")[1].split("```")[0].strip()
            elif content.startswith("```"):
                content = content.split("```")[1].split("```")[0].strip()
            
            result = json.loads(content)
            
            # Force end if max rounds reached
            if round_number >= max_rounds:
                result["should_end"] = True
            
            return result
            
        except json.JSONDecodeError:
            return {
                "should_end": round_number >= max_rounds,
                "user_score": 50,
                "ai_score": 50,
                "user_strengths": ["Engagement"],
                "user_weaknesses": ["Could provide more evidence"],
                "suggestions": "Try to support your points with specific examples.",
                "final_feedback": "Good debate!"
            }