const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Customer Information
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false // Allow bookings without registered users
  },
  customerInfo: {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Customer email is required'],
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Customer phone is required'],
      match: [
        /^[\+]?[1-9][\d]{0,15}$/,
        'Please provide a valid phone number'
      ]
    },
    location: {
      type: String,
      required: [true, 'Customer location is required'],
      trim: true
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['male', 'female', 'non-binary', 'prefer-not-to-say']
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [1, 'Age must be at least 1'],
      max: [120, 'Age cannot exceed 120']
    }
  },

  // Service Information
  service: {
    type: mongoose.Schema.ObjectId,
    ref: 'Service',
    required: [true, 'Service is required']
  },
  serviceSnapshot: {
    name: String,
    price: Number,
    duration: Number,
    description: String
  },

  // Stylist Information
  stylist: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Stylist is required']
  },
  stylistSnapshot: {
    name: String,
    title: String,
    experience: Number
  },

  // Booking Details
  date: {
    type: Date,
    required: [true, 'Booking date is required'],
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'Booking date must be in the future'
    }
  },
  time: {
    type: String,
    required: [true, 'Booking time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },

  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'cash', 'pending'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'pending_bank_transfer'],
    default: 'pending'
  },
  paymentId: String,
  paymentIntentId: {
    type: String,
    sparse: true
  },
  transactionId: {
    type: String,
    sparse: true
  },
  paymentDate: {
    type: Date
  },
  refundId: {
    type: String,
    sparse: true
  },
  refundAmount: {
    type: Number
  },
  refundReason: {
    type: String
  },
  refundDate: {
    type: Date
  },
  bankTransferDetails: {
    accountHolder: String,
    bankName: String,
    accountNumber: String,
    routingNumber: String
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },

  // Booking Management
  confirmationCode: {
    type: String,
    unique: true
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: Date,

  // Review and Rating
  review: {
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      maxlength: [500, 'Review comment cannot exceed 500 characters']
    },
    reviewDate: {
      type: Date,
      default: Date.now
    }
  },

  // Cancellation
  cancellationReason: String,
  cancelledBy: {
    type: String,
    enum: ['customer', 'stylist', 'admin']
  },
  cancelledAt: Date,

  // Metadata
  source: {
    type: String,
    enum: ['website', 'phone', 'walk-in', 'admin'],
    default: 'website'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
bookingSchema.index({ date: 1, time: 1 });
bookingSchema.index({ stylist: 1, date: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ confirmationCode: 1 });
bookingSchema.index({ 'customerInfo.email': 1 });

// Virtual for formatted date
bookingSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for formatted time
bookingSchema.virtual('formattedTime').get(function() {
  const [hours, minutes] = this.time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
});

// Virtual for booking duration in minutes
bookingSchema.virtual('durationMinutes').get(function() {
  return this.serviceSnapshot?.duration || 0;
});

// Generate confirmation code before saving
bookingSchema.pre('save', function(next) {
  if (!this.confirmationCode) {
    this.confirmationCode = Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

// Populate service and stylist data before saving
bookingSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('service')) {
    const Service = mongoose.model('Service');
    const service = await Service.findById(this.service);
    if (service) {
      this.serviceSnapshot = {
        name: service.name,
        price: service.price,
        duration: service.duration,
        description: service.description
      };
      this.totalAmount = service.price;
    }
  }

  if (this.isNew || this.isModified('stylist')) {
    const User = mongoose.model('User');
    const stylist = await User.findById(this.stylist);
    if (stylist) {
      this.stylistSnapshot = {
        name: stylist.fullName,
        title: stylist.title,
        experience: stylist.experience
      };
    }
  }

  next();
});

// Static method to get bookings by date range
bookingSchema.statics.getByDateRange = function(startDate, endDate, stylistId = null) {
  const query = {
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };

  if (stylistId) {
    query.stylist = stylistId;
  }

  return this.find(query)
    .populate('service', 'name price duration')
    .populate('stylist', 'firstName lastName title')
    .sort({ date: 1, time: 1 });
};

// Static method to check availability
bookingSchema.statics.checkAvailability = function(stylistId, date, time, duration) {
  const bookingDate = new Date(date);
  const [hours, minutes] = time.split(':');
  const startTime = new Date(bookingDate);
  startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + duration);

  return this.findOne({
    stylist: stylistId,
    date: bookingDate,
    status: { $nin: ['cancelled', 'no-show'] },
    $or: [
      {
        $and: [
          { time: { $lte: time } },
          // Check if existing booking ends after new booking starts
        ]
      }
    ]
  });
};

// Method to cancel booking
bookingSchema.methods.cancel = function(reason, cancelledBy) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledBy = cancelledBy;
  this.cancelledAt = new Date();
  return this.save();
};

// Method to complete booking
bookingSchema.methods.complete = function() {
  this.status = 'completed';
  return this.save();
};

module.exports = mongoose.model('Booking', bookingSchema);
