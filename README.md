# StoreMind AI - Production Ready Setup

StoreMind AI analyzes CCTV footage and generates live metrics for your store.

## Quickstart Setup (5 Commands)

To run the entire platform (Frontend, Backend, Postgres/Supabase locally, Redis, Grafana), simply use Docker Compose:

```bash
# 1. Clone the repository
git clone https://github.com/your-org/StoreMind-AI.git
cd StoreMind-AI

# 2. Start the entire stack
docker compose up -d

# 3. Access the Live Dashboard
# Open your browser and navigate to: http://localhost:3000

# 4. Run the detection pipeline to generate events from the CCTV clip
python cv/yolov8_pipeline.py --input "CCTV Footage/clip.mp4" --output final_events_submission.json

# 5. Feed the detection pipeline output live into the API
python replay_events.py --batch 5 --delay 0.2
```

## Running the Detection Pipeline
The pipeline uses YOLOv8 to process raw MP4 files. The output is a JSON array of raw events.
```bash
python cv/yolov8_pipeline.py --input "path/to/cctv.mp4" --output final_events_submission.json
```

## Replaying into the Live API
To simulate a real-time CCTV stream to the API (required for live dashboards), run:
```bash
python replay_events.py --batch 5 --delay 0.2
```
This pushes the events into the `POST /events/ingest` endpoint.

## Automated Tests (Pytest)
To run the automated tests locally with `>70% statement coverage` explicitly verifying idempotency and edge cases (staff clips, empty stores):
```bash
cd backend
PYTHONPATH=. pytest tests/ --cov=app
```
