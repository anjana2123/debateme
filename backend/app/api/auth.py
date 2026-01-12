from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, EmailStr
from app.config.supabase import supabase, supabase_admin
import traceback

router = APIRouter(prefix="/auth", tags=["auth"])

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    username: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user_id: str
    email: str
    username: str

@router.post("/signup", response_model=AuthResponse)
async def signup(request: SignupRequest):
    """Sign up a new user"""
    try:
        print(f"[SIGNUP] Starting signup for: {request.email}")
        
        # Check if username is taken
        try:
            existing = supabase_admin.table('user_profiles')\
                .select('username')\
                .eq('username', request.username)\
                .execute()
            
            print(f"[SIGNUP] Username check result: {existing}")
            
            if existing.data:
                raise HTTPException(status_code=400, detail="Username already taken")
        except Exception as e:
            print(f"[SIGNUP] Error checking username: {e}")
            if "already taken" in str(e):
                raise
        
        # ===== FIX: Use ADMIN client for signup =====
        print(f"[SIGNUP] Creating auth user with admin client...")
        auth_response = supabase_admin.auth.admin.create_user({
            "email": request.email,
            "password": request.password,
            "email_confirm": True,  # Auto-confirm email
            "user_metadata": {
                "username": request.username
            }
        })
        
        if not auth_response.user:
            print(f"[SIGNUP] Auth creation failed")
            raise HTTPException(status_code=400, detail="Signup failed - could not create user")
        
        user_id = auth_response.user.id
        print(f"[SIGNUP] Auth user created: {user_id}")
        
        # Create profile
        try:
            print(f"[SIGNUP] Creating profile for {user_id}...")
            profile_result = supabase_admin.table('user_profiles').insert({
                'id': user_id,
                'username': request.username
            }).execute()
            print(f"[SIGNUP] Profile created: {profile_result}")
        except Exception as e:
            print(f"[SIGNUP] Profile creation error: {e}")
            traceback.print_exc()
            # Rollback: delete the auth user
            try:
                supabase_admin.auth.admin.delete_user(user_id)
            except:
                pass
            raise HTTPException(status_code=400, detail=f"Failed to create profile: {str(e)}")
        
        # Create stats
        try:
            print(f"[SIGNUP] Creating stats for {user_id}...")
            stats_result = supabase_admin.table('user_stats').insert({
                'user_id': user_id
            }).execute()
            print(f"[SIGNUP] Stats created: {stats_result}")
        except Exception as e:
            print(f"[SIGNUP] Stats creation error: {e}")
            # Don't fail signup if stats fail
        
        # Generate session for the new user
        print(f"[SIGNUP] Generating session...")
        session_response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        
        if not session_response.session:
            raise HTTPException(
                status_code=400, 
                detail="Account created but login failed. Please try logging in."
            )
        
        print(f"[SIGNUP] Signup complete for {user_id}")
        
        return AuthResponse(
            access_token=session_response.session.access_token,
            refresh_token=session_response.session.refresh_token,
            user_id=user_id,
            email=request.email,
            username=request.username
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[SIGNUP] Unexpected error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """Login an existing user"""
    try:
        print(f"[LOGIN] Attempting login for: {request.email}")
        
        auth_response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        
        if not auth_response.user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        user_id = auth_response.user.id
        print(f"[LOGIN] User authenticated: {user_id}")
        
        # Get username from profile
        try:
            profile = supabase_admin.table('user_profiles')\
                .select('username')\
                .eq('id', user_id)\
                .single()\
                .execute()
            
            username = profile.data['username']
            print(f"[LOGIN] Username retrieved: {username}")
        except Exception as e:
            print(f"[LOGIN] Error getting username: {e}")
            username = "User"  # Fallback
        
        return AuthResponse(
            access_token=auth_response.session.access_token,
            refresh_token=auth_response.session.refresh_token,
            user_id=user_id,
            email=auth_response.user.email,
            username=username
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[LOGIN] Error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=401, detail="Invalid credentials")

@router.post("/logout")
async def logout():
    """Logout user"""
    try:
        supabase.auth.sign_out()
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me")
async def get_current_user(authorization: str = Header(None)):
    """Get current user info"""
    try:
        if not authorization or not authorization.startswith('Bearer '):
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        token = authorization.split(' ')[1]
        user = supabase.auth.get_user(token)
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Get username
        profile = supabase_admin.table('user_profiles')\
            .select('username')\
            .eq('id', user.user.id)\
            .single()\
            .execute()
        
        return {
            "user_id": user.user.id,
            "email": user.user.email,
            "username": profile.data['username']
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))