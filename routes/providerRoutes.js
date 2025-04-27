import express from "express";
import { searchProviders } from "../controllers/providerController.js";
import { authenticate } from "../middlewares/authMiddleware.js"; // Assuming you have an authentication middleware

const router = express.Router();

// Route to search for service providers
router.post("/search-providers", authenticate, searchProviders);

export default router;
