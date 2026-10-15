import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  status: {
    type: String,
    enum: ["completed", "pending", "refunded"],
    default: "completed",
  },
  timestamp: { type: Date, default: Date.now },
});

// Index for faster queries on date ranges and statuses
transactionSchema.index({ timestamp: -1, status: 1 });

export const Transaction = mongoose.model("Transaction", transactionSchema);
