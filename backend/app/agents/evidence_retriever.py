from typing import Dict, Any, List
from .base_agent import BaseAgent
from tavily import TavilyClient
from app.core.config import settings
from app.models.schemas import Evidence

class EvidenceRetrieverAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.tavily_client = TavilyClient(api_key=settings.TAVILY_API_KEY)
    
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Retrieve evidence for counter-argument"""
        
        topic = input_data.get("topic")
        counter_stance = input_data.get("counter_stance")
        
        # Search for evidence
        try:
            search_query = f"{topic} {counter_stance} evidence research facts"
            search_results = self.tavily_client.search(
                query=search_query,
                search_depth="advanced",
                max_results=settings.EVIDENCE_SOURCES_LIMIT
            )
            
            evidence_list = []
            for result in search_results.get("results", [])[:settings.EVIDENCE_SOURCES_LIMIT]:
                evidence = Evidence(
                    source=result.get("title", "Unknown Source"),
                    url=result.get("url", ""),
                    snippet=result.get("content", "")[:300],
                    credibility_score=result.get("score", 0.5)
                )
                evidence_list.append(evidence.dict())
            
            return {"evidence": evidence_list}
            
        except Exception as e:
            print(f"Evidence retrieval error: {e}")
            # Return empty evidence if search fails
            return {"evidence": []}