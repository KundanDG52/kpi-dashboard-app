import React, { useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { KpiCard } from "./components/KpiCard";
import { DashboardHeader } from "./components/DashboardHeader";
import { RevenueChart } from "./components/RevenueChart";

function App() {
  const defaultEnd = new Date().toISOString().split("T")[0];
  const defaultStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);

  const fetchDashboardData = async () => {
    const response = await axios.get(
      `http://localhost:5000/api/kpis/overview?startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data.data;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboardKpis", startDate, endDate],
    queryFn: fetchDashboardData,
    staleTime: 60000,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <DashboardHeader
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
        />

        {isLoading && (
          <div className="p-10 text-center text-gray-500">
            Updating dashboard...
          </div>
        )}
        {isError && (
          <div className="p-10 text-center text-red-500">
            Failed to load metrics.
          </div>
        )}

        {data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <KpiCard
                title="Total Revenue"
                value={data.summary.totalRevenue}
                change={data.summary.revenueChange}
                prefix="$"
              />
              <KpiCard
                title="Total Orders"
                value={data.summary.totalOrders}
                change={data.summary.ordersChange}
              />
              <KpiCard
                title="Avg Order Value"
                value={data.summary.avgOrderValue}
                change={data.summary.aovChange}
                prefix="$"
              />
            </div>

            <RevenueChart data={data.dailyTrend} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
