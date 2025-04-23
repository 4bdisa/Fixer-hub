import express from "express";
import { createRequest, getRequestsForProvider, updateRequestStatus, getRequests } from "../controllers/requestController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route to create a new service request
router.post("/requests", authenticate, createRequest);

// Route to get all requests
router.get("/requests", authenticate, getRequests);

// Route to get requests for a specific provider
router.get("/requests/:providerId?", authenticate, getRequestsForProvider);
router.get("/requests/email/:email", authenticate, getRequestsForProvider);

// Route to update the status of a service request
router.patch("/requests/:requestId", authenticate, updateRequestStatus);

// Route to select a provider for a job
router.post("/select-provider", authenticate, async (req, res) => {
    try {
        const { jobId, providerId } = req.body;

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ error: "Job not found" });

        if (!job.customer.equals(req.user._id)) {
            return res.status(403).json({ error: "Unauthorized action" });
        }

        job.provider = providerId;
        await job.save();

        res.status(200).json({ message: "Provider selected successfully", job });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;