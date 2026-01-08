import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['food', 'clothing', 'medical', 'shelter', 'education', 'other'],
    required: true
  },
  subcategory: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unit: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    enum: ['new', 'like_new', 'good', 'fair', 'poor'],
    required: true
  },
  images: [{
    type: String,
    required: true
  }],
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'donated', 'expired'],
    default: 'available'
  },
  drive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DonationDrive',
    default: null
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  logistics: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  deliveryDate: Date,
  deliveryStatus: {
    type: String,
    enum: ['pending', 'scheduled', 'in_transit', 'delivered', 'failed'],
    default: 'pending'
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: Date
  },
  isEmergency: {
    type: Boolean,
    default: false
  },
  expiryDate: Date,
  tags: [String]
}, {
  timestamps: true
});

// Index for better search performance
donationSchema.index({ category: 1, status: 1, location: 1 });
donationSchema.index({ createdAt: -1 });

export default mongoose.model('Donation', donationSchema);
