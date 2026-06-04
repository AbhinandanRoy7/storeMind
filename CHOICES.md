# Technical Choices & Justifications

This document explains the reasoning behind the specific tools and frameworks selected to build the Store Intelligence API, specifically addressing the AI Engineering requirements.

## 1. Detection Model Choice

*   **Options Considered:** YOLOv8s, YOLOv8x, RT-DETR, MediaPipe, and Vision Language Models (VLMs like GPT-4o for frame-by-frame analysis).
*   **What AI Suggested:** The AI strongly suggested using a VLM (GPT-4 Vision) to process frames once every 5 seconds to perform zone classification and staff detection, arguing it would require zero training.
*   **What We Chose and Why:** We explicitly **overrode** the AI and chose **YOLOv8s** paired with ByteTrack. We did not use a VLM for the detection pipeline. 
    *   **Evaluation:** The VLM approach completely failed during our prototyping. Processing 5 video feeds concurrently via a cloud VLM introduced massive latency (4+ seconds per frame) and completely broke ByteTrack's temporal consistency, making it impossible to track `visitor_id` across frames or calculate accurate `dwell_ms`. YOLOv8s runs natively at 30+ FPS, providing the bounding-box continuity required for accurate entry/exit math.

## 2. Event Schema Design Rationale

*   **Options Considered:** Deep hierarchical nested JSON vs. Flat event-based tabular structure.
*   **What AI Suggested:** The AI suggested a highly nested schema grouped by `visitor_id` (e.g., passing the entire visitor's session history in a single JSON blob every time they moved).
*   **What We Chose and Why:** We **overrode** the AI and chose a **flat, atomic event-based schema**. A deeply nested schema is extremely difficult to query in SQL databases (like Supabase) for time-series analytics. By emitting atomic events (`ENTRY`, `ZONE_DWELL`, `BILLING_QUEUE_JOIN`) with a flat `metadata` dictionary, we ensured the API ingest endpoint could process batches idempotently, and the backend could run lightning-fast `GROUP BY` aggregations on the `event_type` column for the live dashboard.

## 3. API Architecture Choice (State Management)

*   **Options Considered:** Redis (Distributed caching) vs. PostgreSQL (Supabase) vs. In-Memory Dictionaries.
*   **What AI Suggested:** The AI recommended using Redis to cache active sessions and handle cross-camera deduplication before writing to PostgreSQL.
*   **What We Chose and Why:** We **overrode** the AI to use **In-Memory Dictionaries** for the Computer Vision `VisitorRegistry` layer, and direct **Supabase SQL** for the backend API. Since the CV pipeline processes all local store cameras concurrently on the same machine, adding Redis was an unnecessary network hop that introduced failure points. We let the CV pipeline handle 30-second deduplication in RAM, and emit clean events directly to the Supabase-backed FastAPI ingest route.

## LLM Copilot: Gemini 2.5 Flash
While we rejected VLMs for the perception layer, we successfully utilized **Gemini 2.5 Flash** for the Intelligence API backend. It acts as an Agentic RAG engine, translating the hard SQL metrics from Supabase into plain-English store performance reports without hallucinations.
