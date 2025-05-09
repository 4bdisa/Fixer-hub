import express from "express";
import { authenticate } from "../middleWares/authMiddleware.js";
import { updateServiceProviderProfile, getFhCoins } from "../controllers/userController.js";

const router = express.Router();

// Route to update service provider profile
router.put("/profile/update", authenticate, updateServiceProviderProfile);

// Route to get FH coins
router.get("/user/fh-coins", authenticate, getFhCoins);

// Example Express.js backend route

export default router;