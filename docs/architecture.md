# Architecture Overview

## Guiding principle

Computer vision, functional testing, market data, price ML, and GenAI are
**separate systems with separate responsibilities**. None of them is
allowed to silently stand in for another. A component's visual identity
(CV), its actual working condition (testing), its market price (market
data + ML), and its explanation to the user (GenAI) are four different
questions with four different sources of truth.

## High-level data flow

```
USER
 |
 v
Login / Register --------------------------> [Phase 1]
 |
 v
Add Device (manual details) ----------------> [Phase 2]
 |
 v
Upload Images
 |
 v
Computer Vision (component identification) --> [Phase 6]
      | (or: user manually selects components if CV unavailable)
 v
User confirms component list
 |
 v
Functional Testing (per component) ---------> [Phase 3]
      records: VERIFIED_WORKING / LIKELY_WORKING / NOT_WORKING / NOT_TESTED
 |
 v
Market Data retrieval ------------------------> [Phase 7]
      (live source, or admin/historical fallback with a date shown)
 |
 v
Price ML Prediction --------------------------> [Phase 5]
 |
 v
Valuation Engine (combines testing + market + ML) --> [Phase 8]
 |
 v
"Why this price?" explanation ----------------> [Phase 9]
 |
 v
GenAI Chatbot (explains, does not invent prices) --> [Phase 11]
 |
 v
User decision: Reuse / Sell / Donate / Recycle
      |                              |
      v                              v
 Marketplace [Phase 12]      Recycling guidance [Phase 13]
```

## Service boundaries

| Service        | Language | Responsibility                                   | Phase |
|-----------------|----------|---------------------------------------------------|-------|
| frontend        | React/JS | UI only. Never talks to Mongo or AI services directly. | 0+ |
| backend         | Node/Express | REST API, auth, orchestration, MongoDB access | 0+ |
| ml-service      | Python   | Price prediction model (training + inference)    | 5 |
| cv-service      | Python   | Component detection from images                  | 6 |
| Market Data Service | Node (inside backend, or its own module) | Fetches/normalizes market pricing | 7 |
| GenAI integration | Node (backend) | Calls LLM API with structured app data as context | 11 |

The frontend **never** calls ml-service, cv-service, or any AI provider
directly. Everything goes through the backend, so credentials and business
logic stay server-side (see master prompt section 40).

## Why Node/Express talks to Python services over HTTP

Node.js is good at I/O-bound API orchestration; Python has the ML/CV
ecosystem (scikit-learn, PyTorch, OpenCV, YOLO). Rather than trying to run
Python inside Node, the backend calls small internal HTTP APIs exposed by
ml-service and cv-service. This keeps each service independently
testable, replaceable, and it means a Python service crashing doesn't
crash the whole app (see Fallback Modes, section 41).

## Phase 0 status

As of this phase, only `frontend <-> backend <-> MongoDB` exists.
ml-service and cv-service are empty placeholders. This is intentional -
see the MVP-first requirement in the master prompt (section 5).
