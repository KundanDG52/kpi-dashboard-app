import express from "express";
import { getDashboardKpis } from "../controllers/kpiController.js";

const router = express.Router();

// GET /api/kpis/overview
router.get("/overview", getDashboardKpis);

export default router;
