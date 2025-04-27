import express from "express";
import { createRequest, getRequestsForProvider, updateRequestStatus, getRequests, getJobHistory } from "../controllers/requestController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { searchProviders, selectProvider } from "../controllers/requestController.js";

const router = express.Router();

// Route to create a new service request
router.post("/requests", authenticate, createRequest);

// Route to get all requests
router.get("/requests", authenticate, getRequests);

// Route to get requests for a specific provider
router.get("/requests/get", authenticate, getRequestsForProvider);


// Route to update the status of a service request
router.patch("/requests/:requestId/status", authenticate, updateRequestStatus);

router.post("/search-providers", authenticate, searchProviders);
router.post("/select-provider", authenticate, selectProvider);

router.get("/requests/history", authenticate, getJobHistory);


export default router;