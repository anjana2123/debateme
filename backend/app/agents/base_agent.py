from abc import ABC, abstractmethod
from typing import Any, Dict
from langchain_groq import ChatGroq
from app.core.config import settings

class BaseAgent(ABC):
    def __init__(self):
        self.llm = ChatGroq(
            groq_api_key=settings.GROQ_API_KEY,
            model_name="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=2048
        )
    
    @abstractmethod
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the agent's main task"""
        pass