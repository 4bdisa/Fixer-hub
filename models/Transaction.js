import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function(v) {
        const user = await mongoose.model('User').findById(v);
        return user.role === 'client';
      },
      message: 'Payer must be a client'
    }
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [1, 'Amount must be at least 1 ETB']
  },
  currency: {
    type: String,
    default: 'ETB',
    enum: ['ETB', 'USD']
  },
  chapaTxRef: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending'
  },
  splits: [{
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      validate: {
        validator: async function(v) {
          const user = await mongoose.model('User').findById(v);
          return user.role === 'service_provider';
        },
        message: 'Recipient must be a service provider'
      }
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative']
    },
    fee: {
      type: Number,
      default: 0
    },
    netAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending'
    },
    settledAt: Date
  }],
  paymentMethod: {
    type: String,
    enum: ['mobile_money', 'card', 'bank'],
    required: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Validation middleware
transactionSchema.pre('validate', function(next) {
  const totalSplit = this.splits.reduce((sum, split) => sum + split.amount, 0);
  if (totalSplit !== this.totalAmount) {
    next(new Error('Sum of splits must equal total amount'));
  } else {
    next();
  }
});

// Auto-calculate netAmount
transactionSchema.pre('save', function(next) {
  this.splits.forEach(split => {
    split.netAmount = split.amount - split.fee;
  });
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;