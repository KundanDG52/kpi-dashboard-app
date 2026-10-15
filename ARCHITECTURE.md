# 📊 KPI Dashboard System Architecture

## Overview

This document outlines the architecture, data flow, and optimization strategies for the full-stack KPI Dashboard. The application is designed to handle heavy analytical computations while maintaining sub-second response times through a multi-tiered caching strategy and concurrent database querying.

## 🛠️ Technology Stack

- **Frontend Client:** React (Vite), Tailwind CSS
- **State & Data Fetching:** TanStack Query (React Query)
- **Data Visualization:** Recharts
- **Backend Server:** Node.js, Express.js
- **Primary Database:** MongoDB (Mongoose)
- **Caching Layer:** Redis (Upstash)

---

## 🏗️ System Architecture

### 1. The Presentation Layer (Frontend)

The React frontend is heavily modularized to separate concerns and ensure maintainability:

- **`App.jsx`**: Acts as the orchestrator. It holds the global date state and manages the TanStack Query data fetching lifecycle.
- **`DashboardHeader.jsx`**: Manages user input, specifically the `startDate` and `endDate` parameters that drive the analytical queries.
- **`KpiCard.jsx`**: A reusable, stateless component that renders top-line metrics and conditionally computes directional color-coded period-over-period (PoP) growth badges.
- **`RevenueChart.jsx`**: Encapsulates the Recharts logic, parsing the `dailyTrend` time-series data into a responsive area chart.

### 2. The Application Layer (Backend Express Controller)

The API layer is built to minimize database bottlenecking and maximize parallel processing.

- **Dynamic Query Parsing:** Extracts date boundaries from the requested URL and computes the exact previous period required for comparative MoM (Month-over-Month) growth analysis.
- **Cache-Aside Implementation:** Intercepts incoming requests to check the Redis memory store before allocating CPU cycles to MongoDB.
- **Concurrent Execution:** Utilizes `Promise.all` to execute the current-period and previous-period database aggregations simultaneously, effectively cutting database wait times in half.

### 3. The Data & Caching Layer

- **MongoDB Aggregation Pipeline:** Utilizes `$match` for indexing, and `$facet` to process multiple analytical operations (summary totals and daily grouping) within a single database scan.
- **Redis Caching:** Stores highly specific key-value pairs (e.g., `kpi:overview:v2:2026-09-26:2026-10-15`) with a 60-second Time-To-Live (TTL).

---

## 🔄 Lifecycle Data Flow

When a user interacts with the date picker on the dashboard, the following data flow is triggered:

1.  **User Action:** The user updates the `startDate` or `endDate` in the `DashboardHeader`.
2.  **Browser Cache Check:** TanStack Query intercepts the state change. It checks its internal browser cache. If the exact date combination was queried within the last 60 seconds (`staleTime`), it renders instantly without hitting the network.
3.  **Network Request:** If there is a browser cache miss, an HTTP GET request is dispatched to `/api/kpis/overview?startDate=...&endDate=...`.
4.  **Redis Cache Check:** The Express controller constructs a dynamic cache key using the exact dates. It queries Upstash Redis.
    - **Cache Hit:** Redis returns the pre-computed JSON payload. Express immediately sends a `200 OK` response to the client.
    - **Cache Miss:** Express proceeds to query the primary database.
5.  **Concurrent Database Aggregation:**
    - Express dispatches two simultaneous MongoDB queries via `Promise.all` (Current Period + Previous Period).
    - MongoDB executes the `$facet` and `$group` aggregations.
6.  **Data Transformation:** Express calculates the percentage changes between the two periods and formats the exact JSON payload required by the React components.
7.  **Cache Write & Response:** Express writes this finalized payload to Redis with a 60-second expiration (`setEx`), and then transmits it back to the client.
8.  **UI Paint:** TanStack Query resolves the loading state and passes the fresh data into the components, triggering a re-render of the KPI Cards and Recharts visualization.

---

## 🚀 Key Engineering Patterns Applied

- **Avoiding Waterfall Requests:** By using `Promise.all` for historical comparisons rather than awaiting them sequentially.
- **Protecting Database Compute:** Implementing Redis caching prevents expensive `$facet` aggregations from executing on every page load during high-traffic bursts.
- **Decoupled State Management:** Shifting API lifecycle management from manual `useEffect`/`useState` hooks into TanStack Query reduces boilerplate and standardizes error/loading states.
