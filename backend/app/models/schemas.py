from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
from enum import Enum

class ArgumentType(str, Enum):
    USER = "user"
    AI = "ai"

class FallacyType(str, Enum):
    AD_HOMINEM = "ad_hominem"
    STRAWMAN = "strawman"
    FALSE_DILEMMA = "false_dilemma"
    SLIPPERY_SLOPE = "slippery_slope"
    APPEAL_TO_AUTHORITY = "appeal_to_authority"
    HASTY_GENERALIZATION = "hasty_generalization"
    NONE = "none"

class Evidence(BaseModel):
    source: str
    url: str
    snippet: str
    credibility_score: float = Field(ge=0, le=1)

class Fallacy(BaseModel):
    type: FallacyType
    explanation: str
    severity: Literal["low", "medium", "high"]

class Argument(BaseModel):
    id: str
    round_number: int
    argument_type: ArgumentType
    content: str
    evidence: List[Evidence] = []
    fallacies: List[Fallacy] = []
    quality_score: float = Field(ge=0, le=100)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class DebateRequest(BaseModel):
    topic: str = Field(..., min_length=10, max_length=500)
    user_stance: str = Field(..., min_length=20, max_length=1000)
    mode: Literal["normal", "roast"] = "normal"
    max_rounds: int = Field(default=5, ge=3, le=15) 

class DebateResponse(BaseModel):
    debate_id: str
    ai_counter_argument: str
    evidence: List[Evidence]
    fallacies_detected: List[Fallacy]
    round_number: int
    is_debate_ended: bool
    ai_score: int
    user_score: int
    suggestions: Optional[str] = None

class DebateSummary(BaseModel):
    debate_id: str
    topic: str
    total_rounds: int
    winner: Literal["user", "ai", "draw"]
    user_final_score: int
    ai_final_score: int
    key_arguments: List[str]
    user_strengths: List[str]
    user_weaknesses: List[str]
    overall_feedback: str