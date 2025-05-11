import express from 'express';
import { createTransaction, handleWebhook } from '../controllers/Transaction.js';
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/create', authenticate, createTransaction);
router.post('/webhook', handleWebhook);

export default router;