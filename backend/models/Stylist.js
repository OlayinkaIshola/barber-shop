const mongoose = require('mongoose');

const stylistSchema = new mongoose.Schema({
  // Reference to the User model
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Stylist-specific information
  portfolioImages: [{
    url: String,
    caption: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],

  // Services offered by this stylist
  services: [{
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service'
    },
    customPrice: Number, // Override default service price
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  // Performance metrics
  metrics: {
    totalBookings: {
      type: Number,
      default: 0
    },
    completedBookings: {
      type: Number,
      default: 0
    },
    cancelledBookings: {
      type: Number,
      default: 0
    },
    noShowBookings: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    averageServiceTime: {
      type: Number,
      default: 0
    },
    customerRetentionRate: {
      type: Number,
      default: 0
    }
  },

  // Reviews and ratings
  reviews: [{
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    reviewDate: {
      type: Date,
      default: Date.now
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  }],

  // Availability overrides (for specific dates)
  availabilityOverrides: [{
    date: {
      type: Date,
      required: true
    },
    available: {
      type: Boolean,
      default: false
    },
    startTime: String,
    endTime: String,
    reason: String // e.g., "Vacation", "Training", "Special Event"
  }],

  // Preferred working conditions
  preferences: {
    maxBookingsPerDay: {
      type: Number,
      default: 12
    },
    breakDuration: {
      type: Number,
      default: 15 // minutes
    },
    bufferTime: {
      type: Number,
      default: 10 // minutes between appointments
    },
    acceptWalkIns: {
      type: Boolean,
      default: true
    },
    advanceBookingDays: {
      type: Number,
      default: 30 // how far in advance customers can book
    }
  },

  // Commission and payment info
  paymentInfo: {
    commissionRate: {
      type: Number,
      default: 0.6 // 60% to stylist, 40% to shop
    },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'paypal', 'check'],
      default: 'bank_transfer'
    },
    bankDetails: {
      accountNumber: String,
      routingNumber: String,
      accountHolderName: String
    }
  },

  // Status and activity
  isActive: {
    type: Boolean,
    default: true
  },
  isAcceptingBookings: {
    type: Boolean,
    default: true
  },
  lastActiveDate: {
    type: Date,
    default: Date.now
  },

  // Featured stylist
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredUntil: Date,

  // Notes from admin
  adminNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedDate: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for average rating
stylistSchema.virtual('averageRating').get(function() {
  if (this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / this.reviews.length) * 10) / 10;
});

// Virtual for total reviews
stylistSchema.virtual('totalReviews').get(function() {
  return this.reviews.length;
});

// Virtual for completion rate
stylistSchema.virtual('completionRate').get(function() {
  if (this.metrics.totalBookings === 0) return 0;
  return Math.round((this.metrics.completedBookings / this.metrics.totalBookings) * 100);
});

// Indexes for better query performance
stylistSchema.index({ user: 1 });
stylistSchema.index({ isActive: 1 });
stylistSchema.index({ isAcceptingBookings: 1 });
stylistSchema.index({ isFeatured: 1 });
stylistSchema.index({ 'metrics.totalBookings': -1 });
stylistSchema.index({ 'reviews.rating': -1 });

// Pre-save middleware to update metrics
stylistSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    // Update average rating in the referenced User model
    const avgRating = this.averageRating;
    mongoose.model('User').findByIdAndUpdate(
      this.user,
      { 
        rating: avgRating,
        totalReviews: this.reviews.length
      }
    ).exec();
  }
  next();
});

module.exports = mongoose.model('Stylist', stylistSchema);
