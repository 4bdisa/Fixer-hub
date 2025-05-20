import Transaction from '../models/Transaction.js';
import User from '../models/user.js';
import { initiatePayment, verifyPayment } from '../utils/chapaClient.js';

// Create new transaction
export const createTransaction = async (req, res) => {
  try {
    const { totalAmount } = req.body;

    // Generate a unique transaction reference
    const txRef = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create a transaction record
    const transaction = new Transaction({
      payer: req.user.id,
      totalAmount,
      chapaTxRef: txRef,
    });

    // Initialize payment with Chapa
    const paymentData = {
      amount: totalAmount,
      currency: "ETB",
      email: req.user.email,
      tx_ref: txRef,
      callback_url: `${process.env.BASE_URL}/api/transactions/webhook`, // Webhook for payment verification
      metadata: {
        transactionId: transaction._id.toString(),
      },
    };

    const chapaResponse = await initiatePayment(paymentData);
    await transaction.save();

    res.status(201).json({
      success: true,
      checkoutUrl: chapaResponse.data.checkout_url, // Return Chapa checkout URL
    });
  } catch (error) {
    console.error("Payment Initialization Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Handle Chapa webhook
export const handleWebhook = async (req, res) => {
  try {
    console.log("Chapa Webhook Received:", req.body);

    const { tx_ref, status } = req.body;

    // Verify transaction with Chapa
    const verification = await verifyPayment(tx_ref);
    console.log("Chapa Verification Response:", verification);

    const transaction = await Transaction.findOne({ chapaTxRef: tx_ref });

    if (!transaction) {
      console.log("Transaction not found for tx_ref:", tx_ref);
      return res.status(404).json({ error: "Transaction not found" });
    }

    console.log("Transaction before update:", transaction);

    transaction.status = status; // Update transaction status
    console.log("Transaction status from chapa:", status);

    if (status === "success") {
      // Calculate FH-Coins (e.g., 1 ETB = 10 FH-Coins)
      const fhCoins = transaction.totalAmount * 10;

      // Update user's FH-Coin balance
      const user = await User.findById(transaction.payer);
      if (!user) {
        console.log("User not found:", transaction.payer);
        return res.status(404).json({ error: "User not found" });
      }

      user.fhCoins = (user.fhCoins || 0) + fhCoins;
      await user.save();
      console.log("User FH-Coin balance updated:", user.fhCoins);
    }

    await transaction.save();
    console.log("Transaction updated:", transaction);

    res.status(200).json({ success: true });
    console.log("Webhook processed successfully");
  } catch (error) {
    console.error("Webhook Handling Error:", error);
    res.status(500).json({ success: false, error: error.message });
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