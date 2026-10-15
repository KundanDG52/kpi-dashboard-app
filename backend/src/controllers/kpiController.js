// import { Transaction } from "../models/Transaction.js";
// import redisClient from "../redisClient.js";

// export const getDashboardKpis = async (req, res) => {
//   try {
//     // Check for dates in the URL query, otherwise default to last 30 days
//     const { startDate, endDate } = req.query;
//     const end = endDate ? new Date(endDate) : new Date();
//     const start = startDate
//       ? new Date(startDate)
//       : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

//     // Create a dynamic cache key
//     const dateStringStart = start.toISOString().split("T")[0];
//     const dateStringEnd = end.toISOString().split("T")[0];
//     const cacheKey = `kpi:overview:${dateStringStart}:${dateStringEnd}`;

//     // Check if the data exists in Redis
//     const cachedData = await redisClient.get(cacheKey);

//     if (cachedData) {
//       console.log("Serving from Redis cache");
//       return res.status(200).json(JSON.parse(cachedData));
//     }
//     console.log("Cache miss. Querying MongoDB...");

//     const [results] = await Transaction.aggregate([
//       {
//         $match: {
//           timestamp: { $gte: start, $lte: end },
//           status: "completed",
//         },
//       },

//       {
//         $facet: {
//           summary: [
//             {
//               $group: {
//                 _id: null,
//                 totalRevenue: { $sum: "$amount" },
//                 totalOrders: { $sum: 1 },
//                 avgOrderValue: { $avg: "$amount" },
//               },
//             },
//           ],
//           dailyRevenue: [
//             {
//               $group: {
//                 _id: {
//                   $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
//                 },
//                 revenue: { $sum: "$amount" },
//               },
//             },
//             {
//               $sort: { _id: 1 },
//             },
//           ],
//         },
//       },
//     ]);
//     // Format the response
//     const summary = results.summary[0] || {
//       totalRevenue: 0,
//       totalOrders: 0,
//       avgOrderValue: 0,
//     };

//     // Store the exact JSON payload in a variable first
//     const responsePayload = {
//       success: true,
//       data: {
//         summary,
//         dailyTrend: results.dailyRevenue.map((d) => ({
//           date: d._id,
//           revenue: d.revenue,
//         })),
//       },
//     };

//     // Store the data in Redis for future requests
//     await redisClient.setEx(cacheKey, 60, JSON.stringify(responsePayload)); // Cache for 60 seconds

//     // Send the response to frontend
//     res.status(200).json(responsePayload);
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

import { Transaction } from "../models/Transaction.js";
import redisClient from "../redisClient.js";

export const getDashboardKpis = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const dateStringStart = start.toISOString().split("T")[0];
    const dateStringEnd = end.toISOString().split("T")[0];
    const cacheKey = `kpi:overview:v2:${dateStringStart}:${dateStringEnd}`; // Updated cache key

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log(`⚡ Serving from Redis cache: ${cacheKey}`);
      return res.status(200).json(JSON.parse(cachedData));
    }

    console.log(`🗄️ Cache miss for ${cacheKey}. Querying MongoDB...`);

    // Calculate the exact previous period for comparison
    const duration = end.getTime() - start.getTime();
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(start.getTime() - duration);

    // Run both database queries concurrently for maximum performance
    const [currentResults, prevResults] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            timestamp: { $gte: start, $lte: end },
            status: "completed",
          },
        },
        {
          $facet: {
            summary: [
              {
                $group: {
                  _id: null,
                  totalRevenue: { $sum: "$amount" },
                  totalOrders: { $sum: 1 },
                  avgOrderValue: { $avg: "$amount" },
                },
              },
            ],
            dailyRevenue: [
              {
                $group: {
                  _id: {
                    $dateToString: {
                      format: "\%Y-\%m-\%d",
                      date: "$timestamp",
                    },
                  },
                  revenue: { $sum: "$amount" },
                },
              },
              { $sort: { _id: 1 } },
            ],
          },
        },
      ]),
      Transaction.aggregate([
        {
          $match: {
            timestamp: { $gte: prevStart, $lte: prevEnd },
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amount" },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: "$amount" },
          },
        },
      ]),
    ]);

    const currentSummary = currentResults[0]?.summary?.[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
    };
    const prevSummary = prevResults[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
    };

    // Calculate percentage changes (protecting against division by zero)
    const calcChange = (curr, prev) =>
      prev === 0 ? 0 : Number((((curr - prev) / prev) * 100).toFixed(1));

    const responsePayload = {
      success: true,
      data: {
        summary: {
          totalRevenue: currentSummary.totalRevenue,
          revenueChange: calcChange(
            currentSummary.totalRevenue,
            prevSummary.totalRevenue,
          ),
          totalOrders: currentSummary.totalOrders,
          ordersChange: calcChange(
            currentSummary.totalOrders,
            prevSummary.totalOrders,
          ),
          avgOrderValue: currentSummary.avgOrderValue,
          aovChange: calcChange(
            currentSummary.avgOrderValue,
            prevSummary.avgOrderValue,
          ),
        },
        dailyTrend: (currentResults[0]?.dailyRevenue || []).map((d) => ({
          date: d._id,
          revenue: d.revenue,
        })),
      },
    };

    await redisClient.setEx(cacheKey, 60, JSON.stringify(responsePayload));
    res.status(200).json(responsePayload);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
