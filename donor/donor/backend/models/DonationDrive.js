import mongoose from 'mongoose';

const donationDriveSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['food', 'clothing', 'medical', 'shelter', 'education', 'mixed'],
    required: true
  },
  targetItems: [{
    item: String,
    quantity: Number,
    unit: String,
    description: String
  }],
  location: {
    name: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  isEmergency: {
    type: Boolean,
    default: false
  },
  emergencyType: {
    type: String,
    enum: ['natural_disaster', 'pandemic', 'conflict', 'economic_crisis', 'other'],
    required: function() {
      return this.isEmergency;
    }
  },
  targetRecipients: {
    type: Number,
    default: 0
  },
  currentDonations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation'
  }],
  logistics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  volunteers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  progress: {
    totalDonations: {
      type: Number,
      default: 0
    },
    totalValue: {
      type: Number,
      default: 0
    },
    itemsCollected: [{
      item: String,
      quantity: Number,
      unit: String
    }]
  },
  requirements: {
    minAge: {
      type: Number,
      default: 0
    },
    documentation: [String],
    specialInstructions: String
  },
  images: [String],
  tags: [String],
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better search performance
donationDriveSchema.index({ status: 1, startDate: 1, endDate: 1 });
donationDriveSchema.index({ isEmergency: 1, status: 1 });
donationDriveSchema.index({ location: 1 });

export default mongoose.model('DonationDrive', donationDriveSchema);
