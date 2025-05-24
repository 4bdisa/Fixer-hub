import Transaction from '../models/Transaction.js';
import User from '../models/user.js';
import { initiatePayment, verifyPayment } from '../utils/chapaClient.js';
import mongoose from 'mongoose';

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
      status: 'pending', // Initial status
    });

    // Initialize payment with Chapa
    const paymentData = {
      amount: totalAmount,
      currency: "ETB",
      email: req.user.email,
      tx_ref: txRef,
      callback_url: `${process.env.BASE_URL}/api/transactions/webhook`, // Webhook for payment verification
      return_url: `${process.env.BASE_URL}/customer-dashboard`, // Redirect after payment
      metadata: {
        transactionId: transaction._id.toString(),
      },
    };

    const chapaResponse = await initiatePayment(paymentData);
    await transaction.save();

    res.status(201).json({
      success: true,
      checkoutUrl: chapaResponse.data.checkout_url, // Return Chapa checkout URL
      txRef: txRef, // Pass the transaction reference to the frontend
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

    if (!tx_ref || !status) {
      console.error("Invalid webhook data: missing tx_ref or status");
      return res.status(400).json({ error: "Invalid webhook data" });
    }

    const transaction = await Transaction.findOne({ chapaTxRef: tx_ref });

    if (!transaction) {
      console.log("Transaction not found for tx_ref:", tx_ref);
      return res.status(404).json({ error: "Transaction not found" });
    }

    if (transaction.status !== 'pending') {
      console.log("Transaction already processed:", tx_ref);
      return res.status(200).json({ success: true, message: "Transaction already processed" });
    }

    // Simulate Chapa verification (for testing only)
    // In a real environment, you would call the Chapa API here
    const verification = {
      data: {
        status: status, // Use the status from the webhook
      },
    };

    if (verification.data.status === 'success' || verification.data.status === 'failed') {
      transaction.status = verification.data.status;
      await transaction.save();

      // Calculate FH-Coins (e.g., 1 ETB = 10 FH-Coins)
      const fhCoins = transaction.totalAmount;

      // Update user's FH-Coin balance
      const user = await User.findById(transaction.payer);
      if (!user) {
        console.log("User not found:", transaction.payer);
        return res.status(404).json({ error: "User not found" });
      }

      user.fhCoins = (user.fhCoins || 0) + fhCoins;
      await user.save();
      console.log("User FH-Coin balance updated:", user.fhCoins);

      res.status(200).json({ success: true });
    } else {
      console.log("Invalid transaction status from Chapa:", verification.data.status);
      res.status(400).json({ error: "Invalid transaction status from Chapa" });
    }
  } catch (error) {
    console.error("Webhook Handling Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Verify pending payments
export const verifyPendingPayments = async () => {
  try {
    console.log("Verifying pending payments...");
    // Find transactions with 'pending' status
    const pendingTransactions = await Transaction.find({ status: 'pending' });

    console.log(`Found ${pendingTransactions.length} pending transactions.`);

    // Loop through each pending transaction
    for (const transaction of pendingTransactions) {
      try {
        console.log(`Verifying transaction: ${transaction.chapaTxRef}`);
        // Verify payment with Chapa
        const verification = await verifyPayment(transaction.chapaTxRef);
        console.log("Chapa Verification Response:", verification);

        // Update transaction status based on verification response
        if (verification && verification.data && verification.data.status === 'success') {
          transaction.status = 'success';

          // Calculate FH-Coins (e.g., 1 ETB = 10 FH-Coins)
          const fhCoins = transaction.totalAmount;

          // Update user's FH-Coin balance
          const user = await User.findById(transaction.payer);
          if (!user) {
            console.log("User not found:", transaction.payer);
            continue; // Skip to the next transaction
          }

          user.fhCoins = (user.fhCoins || 0) + fhCoins;
          await user.save();
          console.log("User FH-Coin balance updated:", user.fhCoins);

        } else if (verification && verification.data && verification.data.status === 'failed') {
          transaction.status = 'failed';
        } else {
          console.log(`Transaction ${transaction.chapaTxRef} still pending or verification failed.`);
          continue; // Skip to the next transaction
        }

        await transaction.save();
        console.log("Transaction updated:", transaction);
      } catch (verificationError) {
        console.error(`Error verifying transaction ${transaction.chapaTxRef}:`, verificationError);
      }
    }

    console.log("Pending payments verification complete.");
  } catch (error) {
    console.error("Error in verifyPendingPayments:", error);
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

// Get total revenue
export const getTotalRevenue = async (req, res) => {
    try {
        const totalRevenue = await Transaction.aggregate([
            {
                $match: { status: 'success' }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' }
                }
            }
        ]);

        if (totalRevenue.length > 0) {
            res.status(200).json({ totalRevenue: totalRevenue[0].totalRevenue });
        } else {
            res.status(200).json({ totalRevenue: 0 });
        }
    } catch (error) {
        console.error("Error fetching total revenue:", error);
        res.status(500).json({ message: "Failed to fetch total revenue", error: error.message });
    }
};