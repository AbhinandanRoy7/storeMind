# System Architecture & Design: StoreMind AI

*Note on Repository Structure: While the rubric suggested placing markdown files in a `docs/` folder and tests in a root `tests/` folder, we chose to place `DESIGN.md` and `CHOICES.md` in the root directory for immediate visibility, and we placed our tests inside `backend/tests/` to keep the FastAPI application modularly self-contained. The computer vision pipeline is housed in `cv/` rather than `pipeline/`.*

StoreMind AI is an end-to-end Store Intelligence Pipeline built to transform raw CCTV footage into actionable business decisions using a containerized API.

## Core Architecture

The system is decoupled into two primary layers to maintain a strict separation between **perception** (Computer Vision) and **business logic** (Backend & API).

### 1. The Perception Layer (Computer Vision Pipeline)
*Location: `/cv` directory*

**Flow:**
1. **YOLOv8 Detection:** Frames are extracted from raw video feeds and processed by YOLOv8s to detect humans (Class 0).
2. **ByteTrack:** Detections are assigned consistent IDs across frames using ByteTrack.
3. **Zone Mapping (Homography/Polygons):** Bounding box feet coordinates (bottom-center) are checked against user-mapped store layout polygons (e.g., "MAYBELLINE", "BILLING").
4. **Behavioral Engines:** We maintain state across multiple cameras to detect:
   - `ENTRY` / `EXIT` events (with 30-second cross-camera re-entry deduplication)
   - `ZONE_ENTER` / `ZONE_EXIT` events (calculating dwell time)
   - `BILLING_QUEUE_JOIN` (triggering checkout delay anomalies if dwell > 90s)
   - Staff Interactions (filtering out static employees based on prolonged multi-zone behavior)
5. **Event Ingestion:** Generated events are streamed via HTTP POST to the backend API.

### 2. The Business Logic & AI Layer (Backend API)
*Location: `/backend` directory*

**Flow:**
1. **FastAPI Ingestion:** Receives real-time JSON event streams from the Perception Layer.
2. **Supabase (PostgreSQL):** Events are stored permanently. The POS Correlation Engine runs here to match `BILLING_VISIT` events with offline POS transaction CSV data (within a 5-minute window) to determine precise conversion rates and revenue.
3. **Qdrant (Vector Database):** Critical store policies, past intelligence reports, and product data are vectorized and stored here for fast semantic retrieval.
4. **Agentic RAG Engine:** When a user queries the Copilot (e.g., "Why is conversion down?"):
   - The system retrieves context from Qdrant.
   - Live metrics are injected directly from Supabase via SQL Tool Calling.
5. **Gemini 2.5 Flash Copilot:** The LLM synthesizes the live Supabase SQL metrics with the RAG context to output a hallucination-free business report.

## Data Schema

The unified JSON event schema connecting the two layers:
```json
{
  "visitor_id": "string",
  "event_type": "ENTRY | ZONE_ENTER | ZONE_EXIT | BILLING_QUEUE_JOIN",
  "timestamp": "ISO8601 string",
  "zone_id": "string (optional)",
  "confidence": "float",
  "metadata": {
      "dwell_time": "integer (ms)",
      "queue_depth": "integer",
      "is_staff": "boolean"
  }
}
```

## Scalability Considerations
- The CV pipeline is designed to be easily offloaded to edge devices (e.g., Jetson Nano) deployed in physical stores.
- The FastAPI backend is fully stateless and Dockerized, allowing it to easily scale horizontally on Cloud Run or Kubernetes.

## AI-Assisted Decisions
As part of our AI Engineering process, the LLM heavily shaped our system architecture. Here are 3 places where the LLM influenced the design:

1. **State Management & Deduplication:** 
   * **LLM Suggestion:** The AI initially suggested using Redis for state management and deduplicating events across cameras using a distributed lock.
   * **Our Decision:** We overrode the AI. We realized that since the CV pipeline runs locally per store, we could simply use in-memory dictionaries (`VisitorRegistry`) for 30-second re-entry deduplication. This removed a massive architectural dependency (Redis) and made the system far more robust for edge deployment.

2. **Database Selection for Metrics:**
   * **LLM Suggestion:** The AI recommended storing all raw JSON events directly into MongoDB, as it is schema-less and naturally fits JSON event streams.
   * **Our Decision:** We agreed partially but overrode the DB choice. We selected Supabase (PostgreSQL). We realized that calculating conversion rates requires joining live `BILLING_VISIT` events with the offline CSV `pos_transactions` data. Relational SQL is far superior to MongoDB for this exact time-window correlation task.

3. **Backend API Framework:**
   * **LLM Suggestion:** The AI recommended FastAPI due to its native asynchronous support, auto-generated Swagger UI, and Pydantic validation.
   * **Our Decision:** We completely agreed. Processing hundreds of JSON events per second requires non-blocking IO, and Pydantic made schema validation trivial.

4. **VLM Evaluation for Zone Classification:**
   * As part of our initial R&D, we attempted to use a Vision Language Model (VLM) for zone classification to avoid training a custom detection model. 
   * **The Prompt Used:** *"Analyze this store CCTV frame. You are an expert retail analyst. Identify if there are any humans present. If a human is present, determine if their bounding box overlaps with the 'Maybelline' or 'Billing' zone based on visual context. Output your response as a strict JSON array of bounding boxes and zone labels."*
   * **Our Evaluation & Critique:** While the VLM correctly identified the zones, we heavily critiqued this approach. It took >4 seconds per frame to process, completely destroying the real-time temporal tracking required for ByteTrack and our Entry/Exit mathematical vectors. We ultimately rejected the VLM for the perception layer and built custom Python polygon mapping over YOLOv8s instead, which runs at 30+ FPS locally.
