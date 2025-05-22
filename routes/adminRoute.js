import express from "express";
import { createAdmin, getAdmin, loginAdmin } from "../controllers/adminController.js";
import { getAllUsers, getUserById } from "../controllers/userController.js";
import { authorizeRoles, authenticate, verifyAdmin } from "../middleWares/authMiddleware.js";
import { banUser, updatePassword } from "../controllers/userController.js"; // Import the banUser function
import { deleteReport } from "../controllers/reportController.js"; // Import the deleteReport function
const router = express.Router();
router.get("/getAdmin/:id", getAdmin); // Modified to accept ID as a parameter
router.post("/createAdmin", createAdmin);
router.post("/loginAdmin", loginAdmin); // Uncomment if you have a login function
router.get("/getAllUsers", verifyAdmin, authorizeRoles('admin'), getAllUsers); // Uncomment if you have a function to get all users
router.get("/getUserById/:id", getUserById); // Uncomment if you have a function to get user by ID
router.put("/banUser/:id", verifyAdmin, authorizeRoles('admin'), banUser); // Add this line
router.delete("/reports/deleteReport/:id", verifyAdmin, authorizeRoles('admin'), deleteReport); // Add delete report route
router.put("/users/:id/password", verifyAdmin, authorizeRoles('admin'), updatePassword);
export default router;