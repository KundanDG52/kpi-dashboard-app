# 📊 MERN KPI Dashboard

A high-performance full-stack analytics dashboard built to handle heavy metric computations with sub-second response times. The application leverages a multi-tiered caching strategy, concurrent database querying, and optimized aggregation pipelines to deliver responsive, real-time data visualization.

## ✨ Features

- **Interactive Analytics:** Filter metrics dynamically with a responsive date picker.
- **Comparative Insights:** Automated Period-over-Period (PoP) and Month-over-Month (MoM) growth calculations.
- **Multi-Tier Caching:** Browser-level caching via TanStack Query and server-side in-memory caching via Upstash Redis to protect database compute.
- **Concurrent Processing:** Parallel execution of historical and current database aggregations using `Promise.all` to eliminate waterfall network requests.
- **Interactive Visualizations:** Time-series area charts rendered smoothly via Recharts.

## 🛠️ Technology Stack

- **Frontend:** React (Vite), Tailwind CSS, TanStack Query, Recharts
- **Backend:** Node.js, Express.js
- **Database & ODM:** MongoDB, Mongoose
- **Caching Layer:** Redis (Upstash)

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/kpi-dashboard.git](https://github.com/yourusername/kpi-dashboard.git)
   cd kpi-dashboard
   ```

## Install dependencies:

cd backend && npm install
cd ../frontend && npm install

## Configure Environment Variables:

### Create a .env file in the backend directory

PORT=your_port

MONGO_URI=your_mongo_uri

REDIS_URL=your_upstash_redis_url

## Seed the Database & Run:

### cd backend

 => node seed.js

 => npm run dev

### In a new terminal:

 => cd frontend

 => npm run dev
