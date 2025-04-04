import express from "express";
import { matchServiceProviders } from "../controllers/matchingController.js";

const router = express.Router();

router.get("/match", matchServiceProviders); // Match Service Providers

export default router;
