import express from 'express';
import { createTransaction, handleWebhook } from '../controllers/Transaction.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createTransaction);
router.post('/webhook', handleWebhook);

export default router;