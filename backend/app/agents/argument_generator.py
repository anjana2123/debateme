from typing import Dict, Any, List
from .base_agent import BaseAgent
import json

class ArgumentGeneratorAgent(BaseAgent):
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate counter-argument with evidence"""
        
        topic = input_data.get("topic")
        user_stance = input_data.get("user_stance")
        user_argument = input_data.get("user_argument")
        evidence = input_data.get("evidence", [])
        mode = input_data.get("mode", "normal")
        round_number = input_data.get("round_number", 1)
        debate_history = input_data.get("debate_history", [])
        
        # Build evidence context
        evidence_text = ""
        if evidence:
            evidence_text = "\n\nEvidence to support your argument:\n"
            for idx, ev in enumerate(evidence, 1):
                evidence_text += f"{idx}. {ev.get('snippet')} (Source: {ev.get('source')})\n"
        
        # Build debate history context
        history_text = ""
        if debate_history:
            history_text = "\n\nPrevious debate rounds:\n"
            for h in debate_history[-3:]:  # Last 3 rounds for context
                history_text += f"Round {h['round']}: User said: {h['user'][:100]}...\n"
                history_text += f"You responded: {h['ai'][:100]}...\n"
        
        if mode == "roast":
            prompt = f"""You are a witty but respectful debate opponent in ROAST MODE. 

Topic: {topic}
User's Position: {user_stance}
User's Latest Argument: {user_argument}
Round: {round_number}
{history_text}
{evidence_text}

Create a counter-argument that:
1. Is playfully sarcastic but NEVER rude or offensive
2. Points out flaws with clever humor
3. Uses evidence to support your points
4. Stays respectful and fun
5. Is 150-250 words

Example tone: "Oh, interesting point! Though I must say, claiming [X] while ignoring [Y] is quite the creative interpretation of reality..."

Generate your counter-argument (NO JSON, just the argument text):"""
        else:
            prompt = f"""You are a skilled debater taking the opposing position.

Topic: {topic}
User's Position: {user_stance}
User's Latest Argument: {user_argument}
Round: {round_number}
{history_text}
{evidence_text}

Create a strong counter-argument that:
1. Directly addresses the user's points
2. Uses evidence from sources provided
3. Presents logical reasoning
4. Acknowledges valid points but shows flaws
5. Introduces new perspectives
6. Is respectful and constructive
7. Is 100-150 words

Generate your counter-argument (NO JSON, just the argument text):"""

        response = await self.llm.ainvoke(prompt)
        
        return {
            "counter_argument": response.content.strip(),
            "round_number": round_number
        }