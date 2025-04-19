// import Booking from "../models/Booking.js";
// import User from "../models/user.js";
// import ServiceRequest from "../models/ServiceRequest.js";

// // 📌 Client Requests a Booking
// export const requestBooking = async (req, res) => {
//   try {
//     const { providerId, serviceRequestId, price, scheduledDate } = req.body;
//     const clientId = req.user.userId; // Extract from JWT token

//     // Ensure provider exists
//     const provider = await User.findById(providerId);
//     if (!provider || provider.role !== "service_provider") {
//       return res.status(404).json({ message: "Service provider not found" });
//     }

//     // Ensure service request exists
//     const serviceRequest = await ServiceRequest.findById(serviceRequestId);
//     if (!serviceRequest) {
//       return res.status(404).json({ message: "Service request not found" });
//     }

//     // Create a new booking
//     const booking = await Booking.create({
//       clientId,
//       providerId,
//       serviceRequestId,
//       price,
//       scheduledDate,
//       location: serviceRequest.location,
//     });

//     res.status(201).json({ message: "Booking request sent!", booking });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // 📌 Provider Accepts Booking
// export const acceptBooking = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
//     const providerId = req.user.userId; // Provider must be logged in

//     // Find and update booking
//     const booking = await Booking.findOneAndUpdate(
//       { _id: bookingId, providerId, status: "pending" },
//       { status: "accepted" },
//       { new: true }
//     );

//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found or already updated" });
//     }

//     res.status(200).json({ message: "Booking accepted", booking });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // 📌 Provider Rejects Booking
// export const rejectBooking = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
//     const providerId = req.user.userId;

//     const booking = await Booking.findOneAndUpdate(
//       { _id: bookingId, providerId, status: "pending" },
//       { status: "rejected" },
//       { new: true }
//     );

//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found or already updated" });
//     }

//     res.status(200).json({ message: "Booking rejected", booking });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // 📌 Get All Bookings for a User
// export const getUserBookings = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const bookings = await Booking.find({ $or: [{ clientId: userId }, { providerId: userId }] }).populate("clientId providerId serviceRequestId");
//     res.status(200).json(bookings);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
