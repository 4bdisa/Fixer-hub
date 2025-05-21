import express from "express";
import { createAdmin, getAdmin, loginAdmin } from "../controllers/adminController.js";
const router = express.Router();
router.get("/getAdmin", getAdmin);
router.post("/createAdmin", createAdmin);
router.post("/loginAdmin", loginAdmin); // Uncomment if you have a login function

export default router;