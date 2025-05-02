import Transaction from '../models/Transaction.js';
import User from '../models/user.js';
import { initiatePayment, verifyPayment } from '../utils/chapaClient.js';

// Create new transaction
export const createTransaction = async (req, res) => {
  try {
    const { totalAmount } = req.body;

    // Generate unique transaction reference
    const txRef = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create transaction record
    const transaction = new Transaction({
      payer: req.user.id,
      totalAmount,
      chapaTxRef: txRef,
    });

    // Initialize payment with Chapa
    const paymentData = {
      amount: totalAmount,
      currency: 'ETB',
      email: req.user.email,
      tx_ref: txRef,
      callback_url: `${process.env.BASE_URL}/api/transactions/webhook`,
      metadata: {
        transactionId: transaction._id.toString(),
      },
    };

    const chapaResponse = await initiatePayment(paymentData);
    await transaction.save();

    res.status(201).json({
      success: true,
      checkoutUrl: chapaResponse.data.checkout_url,
    });
  } catch (error) {
    console.error('Payment Initialization Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Handle Chapa webhook
export const handleWebhook = async (req, res) => {
  try {
    const { tx_ref, status } = req.body;

    // Verify transaction with Chapa
    const verification = await verifyPayment(tx_ref);

    const transaction = await Transaction.findOne({ chapaTxRef: tx_ref });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    transaction.status = status;

    if (status === 'success') {
      // Calculate fhCoins (e.g., 1 ETB = 10 fhCoins)
      const fhCoins = transaction.totalAmount * 10;

      // Update user's fhCoin balance
      const user = await User.findById(transaction.payer);
      user.fhCoins = (user.fhCoins || 0) + fhCoins;
      await user.save();

      // Update transaction record
      transaction.fhCoins = fhCoins;
    }

    await transaction.save();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get user transactions
export const getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [
        { payer: req.user.id },
        { 'splits.recipient': req.user.id }
      ]
    }).populate('payer splits.recipient', 'name email role');

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};