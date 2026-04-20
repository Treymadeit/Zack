from typing import Any, Dict, Optional

from supabase import Client, create_client

from config import SUPABASE_SERVER_KEY, SUPABASE_URL, validate_config


class ZackSupabase:
    def __init__(self) -> None:
        validate_config()
        self.client: Client = create_client(SUPABASE_URL, SUPABASE_SERVER_KEY)

    def fetch_next_queued_video(self) -> Optional[Dict[str, Any]]:
        response = (
            self.client
            .table("videos")
            .select("*")
            .eq("status", "queued")
            .order("created_at")
            .limit(1)
            .execute()
        )

        rows = response.data or []
        return rows[0] if rows else None

    def claim_video_job(self, video_id: str) -> Optional[Dict[str, Any]]:
        response = (
            self.client
            .table("videos")
            .update({"status": "processing"})
            .eq("id", video_id)
            .eq("status", "queued")
            .select("*")
            .execute()
        )

        rows = response.data or []
        return rows[0] if rows else None

    def set_video_status(self, video_id: str, status: str) -> Optional[Dict[str, Any]]:
        response = (
            self.client
            .table("videos")
            .update({"status": status})
            .eq("id", video_id)
            .select("*")
            .execute()
        )

        rows = response.data or []
        return rows[0] if rows else None
