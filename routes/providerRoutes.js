import express from "express";
import { matchProviders } from "../controllers/providerController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 📌 Find matching service providers
router.get("/match", protect, matchProviders);

export default router;
