const mongoose = require('mongoose');

const policySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Policy name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['car', 'health', 'life'],
      required: [true, 'Policy type is required'],
    },
    description: {
      type: String,
      required: true,
    },
    coverage: {
      type: Number,
      required: [true, 'Coverage amount is required'],
    },
    premium: {
      type: Number,
      required: [true, 'Premium amount is required'],
    },
    duration: {
      type: String,
      required: true, // e.g. "1 Year", "5 Years"
    },
    features: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Policy', policySchema);
