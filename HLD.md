# 🗺️ High-Level Design (HLD): MERN KPI Dashboard

## System Architecture

The system follows a modernized Client-Server architecture optimized for heavy analytical read operations. It introduces an in-memory caching layer to protect the primary database from redundant compute-heavy aggregation pipelines during traffic spikes.

- **Presentation Tier (Client):** A React SPA built with Vite. It handles date-range state management, browser-level query caching (TanStack Query), and rendering time-series visualizations (Recharts).
- **Application Tier (Server):** A Node.js/Express.js REST API. It acts as the orchestrator, computing date boundaries for historical comparisons, managing cache hits/misses, and executing concurrent database queries.
- **Caching Tier (In-Memory Store):** An Upstash Redis instance sitting in front of the database. It stores pre-computed JSON metric payloads with a 60-second Time-To-Live (TTL).
- **Data Tier (Database):** A MongoDB instance (local or Atlas) storing raw time-series transaction data.

## High-Level Data Flow (Request Lifecycle)

1.  **Client Initiation:** User selects a `startDate` and `endDate` via the `DashboardHeader` component.
2.  **Client Cache Evaluation:** TanStack Query intercepts the request. If the exact date combination was fetched within the `staleTime` window, it renders instantly from browser memory.
3.  **Network Request:** On a browser cache miss, an HTTP GET request is sent to the Express API.
4.  **Server Cache Evaluation (Cache-Aside):** Express constructs a deterministic Redis key (e.g., `kpi:overview:2026-09-01:2026-09-30`).
    - _Cache Hit:_ Redis returns the payload; Express immediately sends a 200 OK to the client.
    - _Cache Miss:_ Express proceeds to the Data Tier.
5.  **Concurrent Database Execution:** Express uses `Promise.all` to dispatch two parallel MongoDB aggregation pipelines (one for the current period, one for the previous period to calculate Month-over-Month growth).
6.  **Transformation & Storage:** Express formats the MongoDB output into the final JSON structure, writes it back to Redis with a `setEx` 60-second TTL, and returns the response to the client.
