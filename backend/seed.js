import mongoose from "mongoose";
import dotenv from "dotenv";
import { Transaction } from "./src/models/Transaction.js";

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await Transaction.deleteMany();

    const categories = ["Electronics", "Clothing", "Software", "Consulting"];
    const transactions = [];

    // Generate 1000 random transactions over the last 30 days
    for (let i = 0; i < 1000; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      transactions.push({
        amount: Math.floor(Math.random() * 500) + 50, // Amount between $50 and $550
        category: categories[Math.floor(Math.random() * categories.length)],
        status: Math.random() > 0.1 ? "completed" : "refunded", // 90% completion rate
        timestamp: date,
      });
    }

    await Transaction.insertMany(transactions);
    console.log("✅ 1000 mock transactions successfully seeded!");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedData();
