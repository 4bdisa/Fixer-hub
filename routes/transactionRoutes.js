import express from 'express';
import {
  createTransaction,
  handleWebhook,
  getUserTransactions
} from '../controllers/transactionController.js';
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createTransaction);
router.post('/webhook', handleWebhook);
router.get('/my-transactions', protect, getUserTransactions);

export default router;