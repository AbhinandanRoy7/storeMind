# CHOICES.md — Technical Decision Log

## Why These Technologies?

This document explains every major technology choice in StoreMind AI and why we picked it over alternatives.

---

## 🎯 1. Detection Model Choice

**Options Considered:** Ultralytics YOLOv8n, RT-DETR, YOLOv9, and Vision Language Models (VLMs like GPT-4o / Gemini Pro Vision).
**What AI Suggested:** The AI initially suggested using a VLM to classify the zones and detect staff uniforms by simply prompting the VLM with video frames (e.g., prompt: "Identify if the person in the frame is wearing a black staff uniform").
**What We Chose and Why:** We **overrode** the AI and chose Ultralytics YOLOv8n (nano variant) instead of a VLM or heavier models. 
*Why?* While a VLM could easily identify staff by their uniform without explicit training, passing 30 frames per second to an API is completely unscalable and introduces massive latency. RT-DETR and YOLOv9 require heavy GPUs. YOLOv8n provides real-time performance on standard CPUs, integrates natively with ByteTrack, and handles occlusion brilliantly for dwell-time tracking. We handled the staff detection offline in the event pipeline instead of relying on a slow VLM.

---

## 🔄 ByteTrack & Distance-Based Re-ID

**Choice:** ByteTrack (BYTE association) with Distance-based Bounding Box Trajectories.

**Why ByteTrack over DeepSORT/StrongSORT?**
DeepSORT relies on a heavy appearance feature extractor (Re-ID network) for every single bounding box. This destroys inference speed. ByteTrack is purely motion-based (using IoU and Kalman filters), but uniquely uses *low-confidence* detections for association. If a customer is partially occluded by a shelf (low confidence), ByteTrack still maintains their `visitor_id`, whereas SORT would lose it.

**Re-ID Strategy:**
For intra-camera tracking (within the same video), we use **distance-based trajectory** via ByteTrack. 
To satisfy the rubric's `REENTRY` requirement (where a person leaves and comes back), we would use an **OSNet / torchreid** appearance embedding model, invoked *only* when an `ENTRY` occurs, comparing the new visitor's embedding against a gallery of recent `EXIT` embeddings. This hybrid approach (ByteTrack for continuous tracking + OSNet only at the door) keeps the pipeline blazing fast.

---

## 🗄️ Supabase for Database & Realtime

**Choice:** Supabase (PostgreSQL + Realtime + Auth)

**Why Supabase?**
| Criterion | Supabase | Firebase | MongoDB Atlas | Raw PostgreSQL |
|-----------|----------|----------|---------------|----------------|
| Realtime Sub | 🟢 Built-in | 🟢 Built-in | 🔴 Requires setup | 🔴 Requires setup |
| SQL Support | 🟢 Full SQL | 🔴 NoSQL | 🟡 Partial | 🟢 Full SQL |
| Auth | 🟢 Built-in | 🟢 Built-in | 🔴 External | 🔴 External |
| Free Tier | 🟢 Generous | 🟡 Limited | 🟡 Limited | N/A |
| Row Level Security | 🟢 Yes | 🟡 Rules | 🔴 No | 🟢 Yes |
| Type Safety | 🟢 TypeScript SDK | 🟡 SDK | 🟡 SDK | 🟡 ORM needed |

**Decision Rationale:**
Supabase gives us a powerful PostgreSQL database with **built-in Realtime** subscriptions — essential for our <3 second dashboard update target. The free tier is generous enough for hackathon scale, and we get Auth + Row Level Security for free. Most importantly, SQL lets us do complex analytics queries (GROUP BY zone, time-series) that would require external aggregation with NoSQL solutions.

---

## 🧠 Gemini 2.5 Flash for LLM

**Choice:** Google Gemini 2.5 Flash

**Why Gemini?**
| Criterion | Gemini 2.5 Flash | GPT-4 | Claude 3.5 | Llama 3 (local) |
|-----------|-----------------|--------|------------|-----------------|
| Cost | 🟢 Free quota | 🔴 $0.03/1K tokens | 🔴 $0.015/1K | 🟢 Free |
| Speed | 🟢 Fast | 🟡 Medium | 🟡 Medium | 🔴 Slow (CPU) |
| Context Window | 🟢 1M tokens | 🟡 128K | 🟢 200K | 🟡 8K |
| Structured Data | 🟢 Excellent | 🟢 Excellent | 🟢 Excellent | 🟡 Good |
| API Availability | 🟢 Yes | 🟢 Yes | 🟢 Yes | 🟡 Self-hosted |
| Hallucination Control | 🟢 Good w/ RAG | 🟢 Good | 🟢 Good | 🔴 Unreliable |

**Decision Rationale:**
For a hackathon, cost is critical. Gemini 2.5 Flash's free quota is sufficient for extensive demo use. More importantly, its **1M token context window** means we can eventually pass an entire day's worth of store events as context without chunking complexity. Combined with RAG grounding, hallucinations are minimal.

---

## 🔍 Qdrant for Vector Database

**Choice:** Qdrant Cloud (free tier)

**Why Qdrant?**
| Criterion | Qdrant | Pinecone | Weaviate | Chroma | pgvector |
|-----------|--------|----------|----------|--------|----------|
| Free Cloud Tier | 🟢 Yes (1GB) | 🟡 Very limited | 🔴 No | 🔴 Local only | 🟢 With Supabase |
| Performance | 🟢 Excellent | 🟢 Excellent | 🟡 Good | 🟡 Good | 🟡 Limited |
| Filtering | 🟢 Payload filters | 🟡 Metadata | 🟢 GraphQL | 🟡 Basic | 🟡 SQL |
| gRPC Support | 🟢 Yes | 🟢 Yes | 🟡 Partial | 🔴 No | 🔴 No |
| Self-hostable | 🟢 Yes | 🔴 No | 🟢 Yes | 🟢 Yes | 🟢 Yes |

**Decision Rationale:**
Qdrant's **free 1GB cloud tier** is perfect for our use case. We store ~100 analytics documents per day — vastly within limits. Qdrant's **payload filtering** allows us to retrieve only metrics from the last 7 days, giving the Copilot time-aware context. The Python client is well-documented and integrates cleanly with our FastAPI backend.

---

## 🔀 LangGraph for Agent Routing (Planned)

**Choice:** LangGraph (Phase 3 extension)

**Why LangGraph?**
| Criterion | LangGraph | LangChain | CrewAI | AutoGen |
|-----------|-----------|-----------|--------|---------|
| State Machine | 🟢 First-class | 🟡 Chains | 🟡 Flows | 🟡 Conversations |
| Conditional Routing | 🟢 Built-in | 🔴 Manual | 🟡 Roles | 🟡 Limited |
| Debugging | 🟢 LangSmith | 🟡 Callbacks | 🔴 Limited | 🟡 Logs |
| Production Ready | 🟢 Yes | 🟢 Yes | 🟡 Maturing | 🟡 Maturing |
| Learning Curve | 🟡 Medium | 🟡 Medium | 🟢 Low | 🟡 Medium |

**Decision Rationale:**
LangGraph's **stateful graph architecture** is perfect for routing retail queries to specialized agents. A question about "queue length" should go to the Operations Agent (with queue tools), not the Security Agent. LangGraph's conditional edges make this routing explicit and debuggable. CrewAI is simpler but less flexible for conditional routing logic.

**Routing Logic:**
```
Query → Classifier Node
    ├── "conversion|funnel|zone|sales" → RetailAgent
    ├── "queue|staff|operations" → OperationsAgent  
    ├── "theft|security|risk" → SecurityAgent
    └── "summary|report|performance" → ExecutiveAgent
```

---

## 🏋️ BAAI/bge-small-en-v1.5 for Embeddings

**Choice:** BGE-small embedding model

**Why BGE-small?**
| Criterion | BGE-small | OpenAI Ada v2 | sentence-transformers/all-MiniLM | E5-small |
|-----------|-----------|---------------|----------------------------------|----------|
| Cost | 🟢 Free (local) | 🔴 $0.0001/1K tokens | 🟢 Free | 🟢 Free |
| Dimensions | 384 | 1536 | 384 | 384 |
| MTEB Score | 🟢 62.7 | 🟢 61.0 | 🟡 56.3 | 🟡 59.9 |
| Speed | 🟢 Fast | 🟡 API latency | 🟢 Fast | 🟢 Fast |
| Retail Domain | 🟢 Good | 🟢 Good | 🟡 General | 🟡 General |
| Offline Support | 🟢 Yes | 🔴 No | 🟢 Yes | 🟢 Yes |

**Decision Rationale:**
BGE-small outperforms OpenAI Ada v2 on the MTEB benchmark while being completely **free and local**. The 384-dimensional vectors are small enough for fast retrieval without sacrificing quality. The BGE models specifically benefit from instruction-tuned retrieval prompts (`"Represent this sentence for searching relevant passages: "`), which we use in our pipeline.

---

## 🏗️ 2. API Architecture Choice

**Options Considered:** Express.js (Node), Django (Python), FastAPI (Python).
**What AI Suggested:** The AI suggested using Express.js because our frontend is written in Next.js/React, allowing us to share TypeScript interfaces across the entire stack.
**What We Chose and Why:** We **overrode** the AI and chose **FastAPI**.
*Why?* Computer vision and analytics pipelines rely heavily on Python-native libraries (Pandas, OpenCV, PyTorch). Maintaining a Node.js API would require messy cross-process communication (IPC) to trigger Python scripts. FastAPI natively supports asynchronous execution, uses Pydantic for extremely strict data validation (critical for grading), and keeps our entire backend ecosystem (CV, Analytics, API) in a single unified language.

---

## 📊 3. Event Schema Design Rationale

**Options Considered:** Highly Normalized Relational Schema (separate tables for Visitors, Cameras, Zones) vs. Flat NoSQL-style Wide Table.
**What AI Suggested:** The AI suggested a deeply normalized PostgreSQL schema with 5 tables, using foreign keys to link `visitor_id` to a `visitors` table, and `zone_id` to a `zones` table to ensure referential integrity.
**What We Chose and Why:** We **overrode** the AI's suggestion and chose a **Flat, Wide NoSQL-style Schema** mapped to a single PostgreSQL `events` table with a JSONB `metadata` column.
*Why?* The AI's normalized approach would require 3-4 separate INSERT statements (or complex UPSERTs) for every single video frame event, crippling database write throughput at 30 FPS. By keeping it flat, we can batch-insert events effortlessly. We can still achieve fast analytics by adding standard B-Tree indices on `event_type` and `visitor_id`, while keeping dynamic properties (like `is_staff` or `dwell_ms`) flexibly packed inside the JSONB metadata column.
