from fastapi import APIRouter, HTTPException, Header
from app.models.schemas import DebateRequest, DebateResponse
from app.services import DebateService
from typing import Dict, Optional
from app.services.gamification_service import gamification_service
from app.models.gamification import UserStats, LeaderboardEntry
from typing import List

router = APIRouter()
debate_service = DebateService()

def get_user_id_from_header(authorization: Optional[str] = None) -> str:
    """Extract user ID from auth header or return guest"""
    if authorization and authorization.startswith('Bearer '):
        try:
            from app.config.supabase import supabase
            token = authorization.split(' ')[1]
            user = supabase.auth.get_user(token)
            if user and user.user:
                return user.user.id
        except Exception as e:
            print(f"[AUTH] Token validation failed: {e}")
    return "guest"

@router.post("/start-debate", response_model=DebateResponse)
async def start_debate(request: DebateRequest, authorization: str = Header(None)):
    """Start a new debate"""
    try:
        user_id = get_user_id_from_header(authorization)
        print(f"[DEBATE] Starting debate for user: {user_id}")
        
        response = await debate_service.start_debate(
            topic=request.topic,
            user_stance=request.user_stance,
            mode=request.mode,
            max_rounds=request.max_rounds,
            user_id=user_id
        )
        return response
    except Exception as e:
        print(f"[DEBATE] Error starting debate: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/continue-debate", response_model=DebateResponse)
async def continue_debate(request: Dict[str, str], authorization: str = Header(None)):
    """Continue an existing debate"""
    try:
        user_id = get_user_id_from_header(authorization)
        
        response = await debate_service.continue_debate(
            debate_id=request.get("debate_id", ""),
            user_argument=request.get("user_argument", "")
        )
        return response
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"[DEBATE] Error continuing debate: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/debate/{debate_id}")
async def get_debate(debate_id: str):
    """Get debate details"""
    if debate_id not in debate_service.debates:
        raise HTTPException(status_code=404, detail="Debate not found")
    return debate_service.debates[debate_id]

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "DebateMe API"}

@router.get("/stats/{user_id}", response_model=UserStats)
def get_user_stats(user_id: str):
    """Get user statistics and achievements"""
    stats = gamification_service.get_or_create_stats(user_id)
    return stats

@router.get("/leaderboard", response_model=List[LeaderboardEntry])
def get_leaderboard(limit: int = 10):
    """Get top players leaderboard"""
    return gamification_service.get_leaderboard(limit)