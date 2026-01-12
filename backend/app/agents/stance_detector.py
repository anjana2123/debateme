from typing import Dict, Any
from .base_agent import BaseAgent
import json

class StanceDetectorAgent(BaseAgent):
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Detect user's stance and extract key claims"""
        
        topic = input_data.get("topic")
        user_argument = input_data.get("user_argument")
        
        prompt = f"""You are analyzing a debate argument. Extract the following in JSON format:

Topic: {topic}
User's Argument: {user_argument}

Extract:
1. "stance": The user's clear position (for/against/neutral)
2. "key_claims": List of 3-5 main claims the user is making
3. "argument_structure": How the argument is structured (logical/emotional/mixed)
4. "strength": Rate argument strength (1-10)

Return ONLY valid JSON, no other text:
{{
    "stance": "string",
    "key_claims": ["claim1", "claim2"],
    "argument_structure": "string",
    "strength": number
}}"""

        response = await self.llm.ainvoke(prompt)
        
        try:
            # Clean response and parse JSON
            content = response.content.strip()
            if content.startswith("```json"):
                content = content.split("```json")[1].split("```")[0].strip()
            elif content.startswith("```"):
                content = content.split("```")[1].split("```")[0].strip()
            
            result = json.loads(content)
            return result
        except json.JSONDecodeError:
            # Fallback
            return {
                "stance": "unclear",
                "key_claims": [user_argument[:200]],
                "argument_structure": "mixed",
                "strength": 5
            }