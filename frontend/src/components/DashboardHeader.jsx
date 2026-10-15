import React from "react";

export const DashboardHeader = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}) => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Business Overview</h1>
        <p className="text-gray-500 mt-1">Operational Performance</p>
      </div>

      <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="text-sm border-none focus:ring-0 text-gray-600 cursor-pointer"
        />
        <span className="text-gray-300">→</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="text-sm border-none focus:ring-0 text-gray-600 cursor-pointer"
        />
      </div>
    </header>
  );
};
