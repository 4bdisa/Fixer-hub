import express from "express";
import { createRequest, getRequestsForProvider, updateRequestStatus, getRequests, getJobHistory, getProviderJobHistory } from "../controllers/requestController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { deleteRequest } from "../controllers/requestController.js";
import { searchProviders, selectProvider } from "../controllers/requestController.js";
import { getAcceptedRequestsByProvider } from "../controllers/requestController.js";
import { completeRequest } from "../controllers/requestController.js";

const router = express.Router();

router.post("/search-providers", authenticate, searchProviders);
router.post("/select-provider", authenticate, selectProvider);

// Route to create a new service request
router.post("/requests", authenticate, createRequest);

// Route to get all requests
router.get("/requests", authenticate, getRequests);

// Route to get requests for a specific provider
router.get("/requests/get", authenticate, getRequestsForProvider);


// Route to update the status of a service request
router.patch("/requests/:requestId/status", authenticate, updateRequestStatus);
router.patch("/requests/complete/:requestId", authenticate, completeRequest);


router.get("/requests/history", authenticate, getJobHistory);

router.get("/requests/accepted", authenticate, getAcceptedRequestsByProvider);

router.delete("/requests/:requestId", authenticate, deleteRequest);

// Route to fetch job history for providers
router.get("/requests/provider/history", authenticate, getProviderJobHistory);

export default router;