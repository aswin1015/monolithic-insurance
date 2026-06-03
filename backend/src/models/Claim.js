const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    policy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Policy',
      required: true,
    },
    policyType: {
      type: String,
      enum: ['car', 'health', 'life'],
      required: true,
    },
    claimAmount: {
      type: Number,
      required: [true, 'Claim amount is required'],
    },
    reason: {
      type: String,
      required: [true, 'Claim reason is required'],
      trim: true,
    },
    pdfPath: {
      type: String,
      required: [true, 'PDF document is required'],
    },
    originalFileName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    ocrText: {
      type: String,
      default: '',
    },
    ocrStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Claim', claimSchema);
