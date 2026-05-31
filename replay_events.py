"""
replay_events.py  — Simulated Live Feed for Demo / Bonus Points

Run this script WHILE the backend and frontend are running.
It reads final_events_submission.json and sends each event one-by-one
to the backend, with a configurable delay between batches.

The frontend's Live Feed (SSE) will show the numbers climbing in real time,
demonstrating to judges that the pipeline and API are genuinely connected.

Usage:
    python replay_events.py                     # 50ms delay between events (fast demo)
    python replay_events.py --delay 0.5         # 500ms delay (slow, visible on dashboard)
    python replay_events.py --batch 10          # send 10 events at once per request
    python replay_events.py --batch 10 --delay 1
"""

import json
import time
import argparse
import requests
from datetime import datetime

API_URL = "http://localhost:8000/events/ingest"
EVENTS_FILE = "final_events_submission.json"

def replay(delay: float = 0.05, batch_size: int = 1):
    with open(EVENTS_FILE, "r") as f:
        data = json.load(f)

    events = data["events"]
    total  = len(events)
    sent   = 0
    errors = 0

    print(f"Starting live replay of {total} events")
    print(f"   -> API:        {API_URL}")
    print(f"   -> Batch size: {batch_size} events per request")
    print(f"   -> Delay:      {delay}s between batches")
    print(f"   -> ETA:        ~{int(total/batch_size * delay)}s")
    print()

    start = time.time()

    for i in range(0, total, batch_size):
        batch = events[i : i + batch_size]

        # Fix timestamps so they appear "now" (optional rewrite for realism)
        now = datetime.utcnow().isoformat() + "Z"
        for ev in batch:
            ev["timestamp"] = now

        try:
            resp = requests.post(API_URL, json={"events": batch}, timeout=5)
            if resp.status_code == 200:
                sent += len(batch)
            else:
                errors += 1
                print(f"  [WARNING] Batch {i//batch_size} failed: {resp.status_code} - {resp.text[:80]}")
        except requests.exceptions.RequestException as e:
            errors += 1
            print(f"  [ERROR] Connection error: {e}")

        # Progress indicator every 100 batches
        if (i // batch_size) % 100 == 0:
            elapsed = time.time() - start
            pct = (i + len(batch)) / total * 100
            print(f"  [{pct:5.1f}%] Sent {sent:,} events | {errors} errors | {elapsed:.1f}s elapsed")

        time.sleep(delay)

    elapsed = time.time() - start
    print()
    print(f"Replay complete!")
    print(f"   Sent:   {sent:,} events")
    print(f"   Errors: {errors}")
    print(f"   Time:   {elapsed:.1f}s")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Replay CCTV events to the StoreMind API")
    parser.add_argument("--delay",  type=float, default=0.05,  help="Seconds between batches (default 0.05)")
    parser.add_argument("--batch",  type=int,   default=5,     help="Events per request (default 5)")
    args = parser.parse_args()

    replay(delay=args.delay, batch_size=args.batch)
