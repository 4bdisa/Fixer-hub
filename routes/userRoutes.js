import express from "express";
import { authenticate } from "../middleWares/authMiddleware.js";
import { updateServiceProviderProfile } from "../controllers/userController.js";

const router = express.Router();

// Route to update service provider profile
router.put("/profile/update", authenticate, updateServiceProviderProfile);

export default router;