# ⚙️ Low-Level Design (LLD): MERN KPI Dashboard

## 1. Database Schema (Mongoose)

The primary collection stores individual financial transactions. The schema is kept flat to optimize aggregation speed.

```javascript
const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ["Sales", "Subscriptions", "Services", "Refunds"],
      required: true,
    },
    date: {
      type: Date,
      required: true,
      index: true, // Critical for $match performance in date-range queries
    },
    status: {
      type: String,
      enum: ["Completed", "Pending", "Failed"],
      default: "Completed",
    },
  },
  { timestamps: true },
);
```

## 2. API Contracts
Endpoint: Fetch Overview KPIs

### Route: GET /api/kpis/overview

### Query Parameters:
startDate (ISO 8601 String)
endDate (ISO 8601 String)

# Response (200 OK):

### JSON
```
{
  "success": true,
  "source": "redis", // or "mongodb"
  "metrics": {
    "totalRevenue": {
      "current": 125000,
      "previous": 110000,
      "growthPercentage": 13.6
    },
    "transactionCount": {
      "current": 1050,
      "previous": 980,
      "growthPercentage": 7.1
    }
  },
  "dailyTrend": [
    { "date": "2026-09-01", "revenue": 4500 },
    { "date": "2026-09-02", "revenue": 5100 }
  ]
}
```

## 3. Caching Strategy Implementation
### 1. Key Convention:
 namespace:resource:startDate:endDate (e.g., kpi:overview:2026-09-01:2026-09-30)

### 2. TTL Configuration: 
 60 seconds. This allows real-time dashboards to feel snappy while ensuring data is never more than a minute stale.

### 3. Invalidation:
 Passive (TTL expiration). No active cache invalidation is required due to the short TTL window and append-only nature of historical reporting.


## 4. Frontend Component Tree
#### App.jsx (Global Provider Wrapper: QueryClientProvider)

    DashboardLayout.jsx (Grid structure)
        DashboardHeader.jsx (State: startDate, endDate)
        KpiGrid.jsx (Consumes TanStack Query data)
            KpiCard.jsx (Props: title, currentValue, growthPercentage) - Renders green/red PoP badges.

    ChartContainer.jsx
        RevenueChart.jsx (Recharts <AreaChart /> consuming dailyTrend array)
 