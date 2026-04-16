import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

_supabase_client = None

def get_supabase():
    """
    Returns a Supabase client singleton, or None if credentials aren't configured.
    Raises on import-time only if explicitly called — never crashes at startup.
    """
    global _supabase_client

    if _supabase_client is not None:
        return _supabase_client

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")

    if not url or not key:
        return None

    from supabase import create_client
    _supabase_client = create_client(url, key)
    return _supabase_client


def has_supabase() -> bool:
    return bool(os.getenv("SUPABASE_URL") and os.getenv("SUPABASE_ANON_KEY"))
