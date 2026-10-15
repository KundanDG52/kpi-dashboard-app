// import React from "react";

// // Notice "export const" here
// export const KpiCard = ({ title, value, prefix = "" }) => {
//   return (
//     <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
//       <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
//         {title}
//       </h3>
//       <p className="mt-2 text-3xl font-bold text-gray-900">
//         {prefix}
//         {typeof value === "number"
//           ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
//           : value}
//       </p>
//     </div>
//   );
// };

import React from "react";

export const KpiCard = ({ title, value, prefix = "", change }) => {
  const isPositive = change >= 0;

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          {title}
        </h3>

        {/* Render the change pill if the data exists */}
        {typeof change === "number" && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              isPositive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isPositive ? "↑" : "↓"} {Math.abs(change)}%
          </span>
        )}
      </div>

      <p className="mt-4 text-3xl font-bold text-gray-900">
        {prefix}
        {typeof value === "number"
          ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
          : value}
      </p>
    </div>
  );
};
