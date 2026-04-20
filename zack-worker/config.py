import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()

SUPABASE_SERVER_KEY = (
    os.getenv("SUPABASE_SECRET_KEY", "").strip()
    or os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
)

POLL_SECONDS = int(os.getenv("POLL_SECONDS", "10"))
RUN_ONCE = os.getenv("RUN_ONCE", "true").strip().lower() in {"1", "true", "yes", "y"}


def validate_config() -> None:
    missing = []

    if not SUPABASE_URL:
        missing.append("SUPABASE_URL")

    if not SUPABASE_SERVER_KEY:
        missing.append("SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY")

    if missing:
        raise RuntimeError(
            "Missing environment variable(s): " + ", ".join(missing)
        )
