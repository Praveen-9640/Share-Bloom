import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  recipient: {
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
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  urgency: {
    type: String,
    enum: ['normal', 'emergency', 'critical'],
    default: 'normal'
  },
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
    enum: ['pending', 'matched', 'fulfilled', 'cancelled'],
    default: 'pending'
  },
  matchedDonation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    default: null
  },
  drive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DonationDrive',
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
  emergencyType: {
    type: String,
    enum: ['natural_disaster', 'pandemic', 'conflict', 'economic_crisis', 'other']
  },
  requiredBy: Date,
  tags: [String],
  images: [String]
}, {
  timestamps: true
});

// Index for better search performance
requestSchema.index({ category: 1, status: 1, priority: 1 });
requestSchema.index({ urgency: 1, status: 1 });
requestSchema.index({ createdAt: -1 });

export default mongoose.model('Request', requestSchema);
