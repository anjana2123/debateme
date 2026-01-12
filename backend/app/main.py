from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router
from app.core.config import settings
from app.api.auth import router as auth_router


app = FastAPI(
    title="DebateMe API",
    description="AI-powered debate platform",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router, tags=["debate"],prefix="/api/v1")
app.include_router(auth_router,prefix="/api/v1",tags=["auth"])


@app.get("/")
async def root():
    return {
        "message": "Welcome to DebateMe API",
        "docs": "/docs",
        "health": "/api/v1/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)