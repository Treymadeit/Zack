import time
from datetime import datetime

from config import POLL_SECONDS, RUN_ONCE
from supabase_client import ZackSupabase


def log(message: str) -> None:
    now = datetime.now().strftime("%H:%M:%S")
    print(f"[{now}] {message}")


def process_one_job(db: ZackSupabase) -> bool:
    job = db.fetch_next_queued_video()

    if not job:
        log("No queued jobs found.")
        return False

    job_id = job["id"]
    source_url = job.get("source_url", "")

    log(f"Found queued job: {job_id}")
    log(f"Source URL: {source_url}")

    claimed = db.claim_video_job(job_id)

    if not claimed:
        log("That job was already claimed by another worker.")
        return True

    log(f"Claimed job {job_id}. Status set to 'processing'.")
    log("Stage 3A complete.")
    log("Next step: downloader + transcription + AI ranking.")

    return True


def main() -> None:
    db = ZackSupabase()
    log("Zack worker started.")

    if RUN_ONCE:
        process_one_job(db)
        return

    while True:
        try:
            found_work = process_one_job(db)

            if not found_work:
                time.sleep(POLL_SECONDS)

        except KeyboardInterrupt:
            log("Worker stopped by user.")
            break
        except Exception as exc:
            log(f"Worker error: {exc}")
            time.sleep(POLL_SECONDS)


if __name__ == "__main__":
    main()
