import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Client for regular operations
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Admin client for service operations
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)