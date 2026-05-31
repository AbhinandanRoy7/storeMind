# DESIGN.md — StoreMind AI System Design

> **Note on Repository Structure:** I deviated slightly from the rubric's suggested flat layout because my architecture includes a dedicated Next.js web application. My monorepo is split logically into `/frontend` (React/Next.js dashboard), `/backend` (FastAPI + Tests), and `/cv` (YOLOv8 Detection Pipeline). The `DESIGN.md` and `CHOICES.md` documents are kept at the root for immediate visibility.

## 1. Data Flow

```
CCTV Camera (30 FPS)
    ↓
Frame Sampling (every Nth frame for performance)
    ↓
YOLOv8n Inference → Bounding Boxes + Class Labels
    ↓
ByteTrack → Persistent Track IDs per visitor/employee
    ↓
Event Engine (pipeline.py)
    ↓  ← Zone boundary intersection logic
Events: ENTRY, EXIT, ZONE_VISIT, BILLING_JOIN, PURCHASE
    ↓
POST /api/v1/events/ingest (FastAPI)
    ↓
Supabase PostgreSQL → `events` table
    ↓
Analytics Services → Aggregated metrics on read
    ↓
RAG Pipeline (daily)
    ↓
Qdrant Vector Store → Embedded analytics documents
    ↓
AI Copilot (Gemini 2.5 Flash)
    ↓
Grounded Business Answers
```

---

## 2. Zone Mapping — Brigade Road Layout (`Brigade Road - Store layoutc5f5d56.xlsx`)

I directly utilized the provided physical store layout to define my analytics zones. The layout defines specific product gondolas along the walls and center units.

### Physical to Digital Mapping
Because CCTV cameras provide a 2D perspective view of a 3D space, I map the physical zones from the Excel sheet into **pixel coordinate polygons** on the respective camera feeds. 

**Zone Definitions based on Layout:**
*   **Top Wall Gondolas:** EB, TFS, GV, DermDoc, Minimalist, Aqualogica, Pilgrim, D&K
*   **Bottom Wall Gondolas:** Maybelline, Faces, Lakme, Swiss+, Mars+Nybae, Alps, L'oreal, Beauty
*   **Center Floor:** Fragrance Nail Unit, F.O.H (Makeup Unit)
*   **Right Side:** CASH COUNTER (Billing)

When a camera covers a specific section (e.g., CAM3 covers the top-left section with `DermDoc`), I draw an invisible digital polygon over that area in the video frame.

#### AI-Assisted Zone Classification (VLM Prompting)
To accurately map the Excel sheet's physical layout to the 2D pixel coordinates of the camera feeds, I used a Vision Language Model (Gemini 1.5 Pro Vision) during the development phase. I passed a static frame from each camera to the VLM with the following prompt:

**VLM Prompt:** 
> "Attached is a frame from CCTV Camera 3, along with the store's physical floor plan (Excel layout). Identify the exact pixel bounding boxes (x_min, y_min, x_max, y_max) for the 'Maybelline', 'DermDoc', and 'Billing Queue' zones visible in this frame. Output only the JSON mapping."

**Evaluation:** The VLM was remarkably accurate at identifying the major visual landmarks (like the cash register for the billing queue), giving me a baseline pixel mapping. However, I had to manually tweak the YOLOv8 intersection polygons slightly outward to account for perspective distortion at the edges of the camera lens. This VLM-assisted mapping saved hours of manual pixel-hunting.

### Zone Detection Method
When a visitor's bounding box centroid (their feet) crosses into a mapped zone polygon for >3 seconds, a `ZONE_VISIT` event is fired for that specific SKU zone.

```python
# Example mapping of camera pixel boundaries to physical layout zones
ZONE_BOUNDARIES = {
    "ENTRY":                {"x": (0, 640), "y": (0, 150)},  # Left side door ("Existing Glass")
    "MAYBELLINE":           {"x": (0, 320), "y": (150, 350)}, # Bottom-left gondola
    "DERMDOC":              {"x": (320, 640), "y": (150, 350)}, # Top-middle gondola
    "FOH_MAKEUP_UNIT":      {"x": (200, 400), "y": (200, 400)}, # Center island
    "BILLING_QUEUE_JOIN":   {"x": (400, 640), "y": (350, 480)}, # Right side Cash Counter
}
```

---

## 3. Agent Design

### Copilot Query Flow

```
User Query: "Why is conversion down?"
    ↓
EmbeddingPipeline.generate_query_embedding(query)
    ↓  BGE instruction: "Represent this sentence for searching..."
384-dimensional vector
    ↓
Qdrant.query_points(collection="store_metrics", limit=5)
    ↓
Top 5 semantically similar metric documents (past days/hours)
    ↓
Context string assembled:
  "Date: 2026-05-31
   Footfall: 147
   Purchases: 31
   Conversion: 21.1%
   Top Zone: Maybelline
   ..."
    ↓
Gemini 2.5 Flash with system instruction:
  "You are StoreMind AI Copilot. Answer based on data only."
    ↓
Grounded answer with specific numbers
```

### Tool Architecture
The AI tools are pure Python functions that query Supabase directly. This prevents LLM hallucination by keeping the data grounding deterministic:

- `footfall_tool.get_footfall_stats()` → COUNT events WHERE type = ENTRY
- `funnel_tool.get_funnel_stats()` → Aggregate ENTRY → ZONE → BILLING → PURCHASE
- `heatmap_tool.get_zone_engagement()` → GROUP BY zone, COUNT visits, AVG dwell
- `anomaly_tool.get_active_anomalies()` → SELECT unresolved anomalies

---

## 4. RAG Architecture — Why Not PDFs?

Most RAG systems embed static PDF documents. My system embeds **live analytics** — this is the key innovation:

**Traditional RAG:**
```
PDF → Text → Embed → Store → Retrieve → Answer
```

**StoreMind RAG:**
```
Live Supabase Analytics → Text Document → Embed → Qdrant → Retrieve → Answer
```

The `document_builder.py` runs daily (or on-demand) to convert the current day's metrics into a richly structured text document and upsert it into Qdrant. This means the copilot's "knowledge" is always current.

---

## 5. Tradeoffs

### YOLOv8n vs YOLOv8x
- Chose `yolov8n` (nano) for real-time performance on standard hardware
- `yolov8x` would give ~2% better mAP but requires GPU and is 3x slower
- For demo: nano is sufficient. For production: upgrade to `yolov8s` on GPU hardware.

### Supabase vs Raw PostgreSQL
- Supabase gives me free Realtime subscriptions, Auth, and Row Level Security out of the box
- Raw PostgreSQL would require setting up my own Realtime infrastructure
- Tradeoff: Supabase's free tier limits (500MB DB, 2GB bandwidth) — acceptable for hackathon

### Gemini 2.5 Flash vs GPT-4
- Gemini 2.5 Flash: Free quota, 1M token context, faster responses
- GPT-4: Better reasoning but $0.03/1K tokens — prohibitive for demo
- Gemini is sufficient for structured data Q&A

### Qdrant Cloud vs Chroma/Pinecone
- Qdrant: Free cloud tier, gRPC support, excellent performance
- Chroma: Local only, no cloud tier
- Pinecone: Limited free tier
- Qdrant wins for my use case

### Embedding Model: BAAI/bge-small-en-v1.5 vs OpenAI Ada
- BGE-small: Free, runs locally, 384 dims, excellent for semantic search
- OpenAI Ada: $0.0001/1K tokens, requires API call
- BGE-small gives 95% of the quality at 0% of the cost

---

## 6. Future Improvements

### Short-term (1-2 weeks)
- [ ] LangGraph router for multi-agent query classification
- [ ] CrewAI agents: RetailAgent, SecurityAgent, ExecutiveAgent
- [ ] WhatsApp alerts via Twilio for critical events
- [ ] Multi-store support

### Medium-term (1 month)
- [ ] Re-ID system to track customers across camera blind spots
- [ ] Gender/age estimation for demographic analytics
- [ ] Product-level heatmaps using SKU detection
- [ ] Integration with Purplle's loyalty program

### Long-term (3 months)
- [ ] Predictive analytics: "Conversion will drop tomorrow due to forecast rain"
- [ ] Automated A/B testing of store layouts
- [ ] Integration with POS systems for ground-truth purchase data
- [ ] Edge deployment using ONNX runtime on Raspberry Pi

---

## 7. AI-Assisted Decisions

This project heavily utilized AI assistance throughout its development, specifically in shaping the architectural and algorithmic choices. Here are key areas where an LLM shaped the design:

### 1. The Detection Pipeline Architecture
Initially, the plan was to write a custom object tracking loop using Euclidean distance between frame detections. AI analysis highlighted the severe limitations of this approach (frequent ID switches on occlusion) and recommended integrating **ByteTrack**. The AI explained how ByteTrack's use of low-confidence bounding boxes for association prevents ID loss when a customer walks behind a shelf, which is critical for accurate dwell-time metrics. 
**Decision:** I **agreed** with this assessment and overrode my custom distance-tracker in favor of implementing ByteTrack natively in `cv/yolov8_pipeline.py`.

### 2. Event Driven Data Model
When designing the database schema, the initial thought was to continuously store a visitor's X/Y coordinates every second to track their path. AI assistance pointed out that this would quickly overwhelm the free-tier Supabase database (30 frames * 5 cameras * 10 hours * 100 people = millions of rows daily). Instead, the AI suggested an **Event-Driven Architecture** where I only emit discrete business events (`ZONE_ENTER`, `ZONE_EXIT`, `PURCHASE`). 
**Decision:** I **agreed** with the AI's logic. I overrode my initial continuous-polling schema and implemented the highly efficient discrete event schema, reducing database writes by >99%.

### 3. RAG over Structured Analytics
The prompt for the AI Copilot required it to answer questions like "Why is conversion down?". The first approach considered was passing raw JSON API responses to the LLM. The AI guided the design toward a more scalable **Semantic Search (RAG)** approach. It recommended a daily cron job that summarizes metrics into natural language "analytics documents" and embeds them into Qdrant using the `BGE-small` model. 
**Decision:** I partially **agreed**, but **overrode** the daily cron job suggestion. Because a hackathon requires real-time demo capabilities, I opted to embed analytics documents on-the-fly when the copilot endpoint is called, rather than waiting for a midnight cron job.
