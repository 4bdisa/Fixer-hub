import express from "express";
import { matchServiceProviders } from "../controllers/matchController.js";

const router = express.Router();

// GET /match/providers?serviceRequestId=xxx&sortBy=rating
router.get("/providers", matchServiceProviders);

export default router;
