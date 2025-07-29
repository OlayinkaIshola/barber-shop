const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  stylist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  preferredDates: [{
    date: {
      type: Date,
      required: true
    },
    timeSlots: [{
      startTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      },
      endTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      }
    }]
  }],
  flexibleDates: {
    enabled: {
      type: Boolean,
      default: false
    },
    dateRange: {
      start: Date,
      end: Date
    },
    daysOfWeek: [{
      type: Number,
      min: 0,
      max: 6
    }],
    timePreferences: {
      morning: { type: Boolean, default: false },
      afternoon: { type: Boolean, default: false },
      evening: { type: Boolean, default: false }
    }
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['active', 'notified', 'booked', 'expired', 'cancelled'],
    default: 'active'
  },
  customerInfo: {
    name: {
      type: String,
      required: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    phone: {
      type: String,
      required: true,
      match: /^[\+]?[1-9][\d]{0,15}$/
    },
    location: {
      type: String,
      maxlength: 200
    },
    notes: {
      type: String,
      maxlength: 500
    }
  },
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    inApp: {
      type: Boolean,
      default: true
    },
    advanceNotice: {
      type: Number,
      default: 24,
      min: 1,
      max: 168
    }
  },
  attempts: [{
    date: Date,
    method: {
      type: String,
      enum: ['email', 'sms', 'phone', 'in-app']
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed', 'responded']
    },
    response: {
      type: String,
      enum: ['accepted', 'declined', 'no-response']
    },
    offeredSlot: {
      date: Date,
      time: String,
      stylist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  }],
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  },
  position: {
    type: Number,
    default: 0
  },
  estimatedWaitTime: {
    type: Number, // in hours
    default: 0
  },
  lastNotified: Date,
  bookedSlot: {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    date: Date,
    time: String
  }
}, {
  timestamps: true
});

// Indexes
waitlistSchema.index({ customer: 1, status: 1 });
waitlistSchema.index({ service: 1, status: 1 });
waitlistSchema.index({ stylist: 1, status: 1 });
waitlistSchema.index({ status: 1, priority: -1, createdAt: 1 });
waitlistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
waitlistSchema.index({ 'preferredDates.date': 1 });

// Virtual for formatted wait time
waitlistSchema.virtual('formattedWaitTime').get(function() {
  if (this.estimatedWaitTime < 24) {
    return `${this.estimatedWaitTime} hours`;
  } else {
    const days = Math.floor(this.estimatedWaitTime / 24);
    const hours = this.estimatedWaitTime % 24;
    return hours > 0 ? `${days} days, ${hours} hours` : `${days} days`;
  }
});

// Instance methods
waitlistSchema.methods.updatePosition = async function() {
  const higherPriorityCount = await this.constructor.countDocuments({
    service: this.service,
    stylist: this.stylist,
    status: 'active',
    $or: [
      { priority: { $gt: this.priority } },
      { 
        priority: this.priority,
        createdAt: { $lt: this.createdAt }
      }
    ]
  });
  
  this.position = higherPriorityCount + 1;
  return this.save();
};

waitlistSchema.methods.estimateWaitTime = async function() {
  const Service = mongoose.model('Service');
  const service = await Service.findById(this.service);
  
  if (!service) {
    this.estimatedWaitTime = 0;
    return this.save();
  }
  
  // Calculate based on position and average service duration
  const averageDuration = service.duration || 60; // minutes
  const slotsPerDay = Math.floor((8 * 60) / averageDuration); // Assuming 8-hour workday
  
  const estimatedDays = Math.ceil(this.position / slotsPerDay);
  this.estimatedWaitTime = estimatedDays * 24;
  
  return this.save();
};

waitlistSchema.methods.notify = async function(availableSlot) {
  const { createBookingNotification } = require('../controllers/notifications');
  
  try {
    // Create notification
    await createBookingNotification('waitlist_opportunity', {
      customer: this.customer,
      serviceSnapshot: { name: availableSlot.serviceName },
      formattedDate: availableSlot.date,
      formattedTime: availableSlot.time,
      stylistSnapshot: { name: availableSlot.stylistName }
    }, {
      waitlistId: this._id,
      availableSlot,
      responseDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours to respond
    });
    
    // Record attempt
    this.attempts.push({
      date: new Date(),
      method: 'email',
      status: 'sent',
      offeredSlot: {
        date: availableSlot.date,
        time: availableSlot.time,
        stylist: availableSlot.stylistId
      }
    });
    
    this.lastNotified = new Date();
    this.status = 'notified';
    
    await this.save();
    return true;
  } catch (error) {
    console.error('Error notifying waitlist customer:', error);
    return false;
  }
};

waitlistSchema.methods.acceptOffer = async function(bookingData) {
  const Booking = mongoose.model('Booking');
  
  try {
    const booking = new Booking({
      ...bookingData,
      customer: this.customer,
      service: this.service,
      stylist: this.stylist,
      customerInfo: this.customerInfo,
      isFromWaitlist: true,
      waitlistId: this._id
    });
    
    await booking.save();
    
    this.bookedSlot = {
      booking: booking._id,
      date: bookingData.date,
      time: bookingData.time
    };
    
    this.status = 'booked';
    await this.save();
    
    // Update positions for remaining waitlist entries
    await this.constructor.updatePositions(this.service, this.stylist);
    
    return booking;
  } catch (error) {
    console.error('Error accepting waitlist offer:', error);
    return null;
  }
};

waitlistSchema.methods.decline = async function(reason) {
  const lastAttempt = this.attempts[this.attempts.length - 1];
  if (lastAttempt) {
    lastAttempt.response = 'declined';
  }
  
  // Add reason to customer notes
  if (reason) {
    this.customerInfo.notes = (this.customerInfo.notes || '') + `\nDeclined offer: ${reason}`;
  }
  
  this.status = 'active'; // Back to active status
  await this.save();
  
  return this;
};

waitlistSchema.methods.cancel = async function() {
  this.status = 'cancelled';
  await this.save();
  
  // Update positions for remaining waitlist entries
  await this.constructor.updatePositions(this.service, this.stylist);
  
  return this;
};

// Static methods
waitlistSchema.statics.addToWaitlist = async function(data) {
  const waitlistEntry = new this(data);
  await waitlistEntry.save();
  await waitlistEntry.updatePosition();
  await waitlistEntry.estimateWaitTime();
  
  return waitlistEntry;
};

waitlistSchema.statics.findAvailableSlots = async function(serviceId, stylistId, date) {
  const Booking = mongoose.model('Booking');
  
  // Get existing bookings for the date
  const existingBookings = await Booking.find({
    service: serviceId,
    stylist: stylistId,
    date: {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999))
    },
    status: { $in: ['confirmed', 'pending'] }
  });
  
  // Calculate available slots (simplified logic)
  const workingHours = [
    { start: '09:00', end: '12:00' },
    { start: '13:00', end: '17:00' }
  ];
  
  const availableSlots = [];
  // Implementation would calculate actual available slots
  
  return availableSlots;
};

waitlistSchema.statics.notifyWaitlist = async function(serviceId, stylistId, availableSlot) {
  const waitlistEntries = await this.find({
    service: serviceId,
    stylist: stylistId,
    status: 'active'
  }).sort({ priority: -1, createdAt: 1 }).limit(5);
  
  for (const entry of waitlistEntries) {
    // Check if the available slot matches customer preferences
    const matchesPreferences = entry.preferredDates.some(pref => {
      const prefDate = new Date(pref.date);
      const slotDate = new Date(availableSlot.date);
      
      if (prefDate.toDateString() === slotDate.toDateString()) {
        return pref.timeSlots.some(slot => {
          return slot.startTime <= availableSlot.time && slot.endTime >= availableSlot.time;
        });
      }
      
      return false;
    });
    
    if (matchesPreferences || entry.flexibleDates.enabled) {
      const notified = await entry.notify(availableSlot);
      if (notified) {
        break; // Only notify the first matching customer
      }
    }
  }
};

waitlistSchema.statics.updatePositions = async function(serviceId, stylistId) {
  const waitlistEntries = await this.find({
    service: serviceId,
    stylist: stylistId,
    status: 'active'
  }).sort({ priority: -1, createdAt: 1 });
  
  for (let i = 0; i < waitlistEntries.length; i++) {
    waitlistEntries[i].position = i + 1;
    await waitlistEntries[i].estimateWaitTime();
  }
};

waitlistSchema.statics.cleanupExpired = async function() {
  const expiredEntries = await this.find({
    status: 'active',
    expiresAt: { $lt: new Date() }
  });
  
  for (const entry of expiredEntries) {
    entry.status = 'expired';
    await entry.save();
  }
  
  return expiredEntries.length;
};

// Pre-save middleware
waitlistSchema.pre('save', function(next) {
  if (this.isNew) {
    // Set expiration date if not provided
    if (!this.expiresAt) {
      this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  }
  next();
});

module.exports = mongoose.model('Waitlist', waitlistSchema);
