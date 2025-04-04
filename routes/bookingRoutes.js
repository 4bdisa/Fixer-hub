import express from "express";
import {
  requestBooking,
  acceptBooking,
  rejectBooking,
  getUserBookings,
} from "../controllers/bookingController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 📌 Clients can request bookings
router.post("/request", protect, authorizeRoles("client"), requestBooking);

// 📌 Only service providers can accept/reject bookings
router.put("/:bookingId/accept", protect, authorizeRoles("service_provider"), acceptBooking);
router.put("/:bookingId/reject", protect, authorizeRoles("service_provider"), rejectBooking);

// 📌 Clients & Providers can view their bookings
router.get("/", protect, getUserBookings);
export default router;

