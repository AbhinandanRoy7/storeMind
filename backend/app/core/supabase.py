from supabase import create_client, Client
from app.core.config import settings

url: str = settings.SUPABASE_URL
key: str = settings.SUPABASE_KEY

# Using the anon key or service key depending on what is available/needed
supabase: Client = create_client(url, key)

def get_supabase() -> Client:
    return supabase
