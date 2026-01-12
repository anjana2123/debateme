from typing import Dict, Any, List
from .base_agent import BaseAgent
from app.models.schemas import Fallacy, FallacyType
import json

class FallacyDetectorAgent(BaseAgent):
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Detect logical fallacies in argument"""
        
        argument = input_data.get("argument")
        
        prompt = f"""Analyze this argument for logical fallacies:

Argument: {argument}

Identify any logical fallacies from these types:
- ad_hominem: Attacking the person instead of the argument
- strawman: Misrepresenting opponent's argument
- false_dilemma: Presenting only two options when more exist
- slippery_slope: Claiming one thing will lead to extreme consequences
- appeal_to_authority: Relying on authority instead of evidence
- hasty_generalization: Drawing conclusions from insufficient evidence

Return ONLY valid JSON array, no other text:
[
    {{
        "type": "fallacy_type",
        "explanation": "why this is a fallacy",
        "severity": "low/medium/high"
    }}
]

If NO fallacies found, return empty array: []
"""

        response = await self.llm.ainvoke(prompt)
        
        try:
            content = response.content.strip()
            if content.startswith("```json"):
                content = content.split("```json")[1].split("```")[0].strip()
            elif content.startswith("```"):
                content = content.split("```")[1].split("```")[0].strip()
            
            fallacies_data = json.loads(content)
            
            fallacies = []
            for f in fallacies_data:
                fallacy = Fallacy(
                    type=FallacyType(f.get("type", "none")),
                    explanation=f.get("explanation", ""),
                    severity=f.get("severity", "low")
                )
                fallacies.append(fallacy.dict())
            
            return {"fallacies": fallacies}
            
        except (json.JSONDecodeError, ValueError):
            return {"fallacies": []}