import express from "express";
import { authenticate } from "../middleWares/authMiddleware.js";
import { updateServiceProviderProfile, getFhCoins, getProfile } from "../controllers/userController.js"; // Import getProfile

const router = express.Router();

// Route to get user profile
router.get("/user/profile", authenticate, getProfile); // Add this line

// Route to update service provider profile
router.put("/profile/update", authenticate, updateServiceProviderProfile);

// Route to get FH coins
router.get("/user/fh-coins", authenticate, getFhCoins);

// Example Express.js backend route

export default router;