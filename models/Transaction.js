import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function (v) {
        const user = await mongoose.model('User').findById(v);
        return user.role === 'client';
      },
      message: 'Payer must be a client',
    },
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [1, 'Amount must be at least 1 ETB'],
  },
  currency: {
    type: String,
    default: 'ETB',
    enum: ['ETB', 'USD'],
  },
  chapaTxRef: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending',
  },
  fhCoins: {
    type: Number,
    default: 0, // Amount of fh-coins credited after successful payment
  },
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);