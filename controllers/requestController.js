import ServiceRequest from "../models/ServiceRequest.js";
import User from "../models/User.js";

// Controller to create a new service request
export const createRequest = async (req, res) => {
  try {

    const { category, description, providerId, location, budget, isFixedPrice } = req.body;

    if (!providerId) {
      return res.status(400).json({ success: false, message: "Provider ID is required" });
    }

    const newRequest = await ServiceRequest.create({
      customer: req.user._id,
      providerId,
      category,
      description,
      location,
      budget,
      isFixedPrice,
      status: "pending",
    });

    res.status(201).json({ success: true, data: newRequest });
  } catch (error) {
    console.error("Error creating service request:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Controller to get requests for a specific provider
export const getRequestsForProvider = async (req, res) => {
  try {
    const { providerId, email } = req.params;

    let provider;
    if (providerId) {
      provider = await User.findById(providerId);
    } else if (email) {
      provider = await User.findOne({ email });
    }

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const requests = await ServiceRequest.find({ providerId: provider._id, status: "pending" }).populate("customer", "name email");
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Controller to update the status of a service request
export const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    // Ensure the status is valid
    if (!["accepted", "declined"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const request = await ServiceRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    // Ensure the request is still pending
    if (request.status !== "pending") {
      return res.status(400).json({ success: false, message: "Request is no longer pending" });
    }

    // Update the status
    request.status = status;
    await request.save();

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};