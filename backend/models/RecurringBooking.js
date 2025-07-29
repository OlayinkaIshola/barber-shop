const mongoose = require('mongoose');

const recurringBookingSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  recurrencePattern: {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'custom'],
      required: true
    },
    interval: {
      type: Number,
      default: 1,
      min: 1,
      max: 12
    },
    daysOfWeek: [{
      type: Number,
      min: 0,
      max: 6
    }],
    dayOfMonth: {
      type: Number,
      min: 1,
      max: 31
    },
    weekOfMonth: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  time: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  duration: {
    type: Number,
    required: true,
    min: 15,
    max: 480
  },
  maxOccurrences: {
    type: Number,
    min: 1,
    max: 100
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'completed'],
    default: 'active'
  },
  bookingPreferences: {
    autoConfirm: {
      type: Boolean,
      default: false
    },
    reminderDays: {
      type: Number,
      default: 1,
      min: 0,
      max: 7
    },
    allowRescheduling: {
      type: Boolean,
      default: true
    },
    rescheduleDeadline: {
      type: Number,
      default: 24,
      min: 1,
      max: 168
    }
  },
  generatedBookings: [{
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    scheduledDate: Date,
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'cancelled', 'completed', 'skipped'],
      default: 'scheduled'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  exceptions: [{
    date: Date,
    reason: String,
    action: {
      type: String,
      enum: ['skip', 'reschedule'],
      default: 'skip'
    },
    rescheduleDate: Date,
    rescheduleTime: String
  }],
  nextOccurrence: Date,
  totalOccurrences: {
    type: Number,
    default: 0
  },
  completedOccurrences: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
recurringBookingSchema.index({ customer: 1, status: 1 });
recurringBookingSchema.index({ stylist: 1, status: 1 });
recurringBookingSchema.index({ nextOccurrence: 1, status: 1 });
recurringBookingSchema.index({ startDate: 1, endDate: 1 });

// Virtual for formatted recurrence description
recurringBookingSchema.virtual('recurrenceDescription').get(function() {
  const { type, interval, daysOfWeek } = this.recurrencePattern;
  
  switch (type) {
    case 'daily':
      return interval === 1 ? 'Daily' : `Every ${interval} days`;
    case 'weekly':
      if (daysOfWeek && daysOfWeek.length > 0) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const selectedDays = daysOfWeek.map(day => dayNames[day]).join(', ');
        return interval === 1 ? `Weekly on ${selectedDays}` : `Every ${interval} weeks on ${selectedDays}`;
      }
      return interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
    case 'monthly':
      return interval === 1 ? 'Monthly' : `Every ${interval} months`;
    case 'custom':
      return 'Custom schedule';
    default:
      return 'Unknown pattern';
  }
});

// Instance methods
recurringBookingSchema.methods.calculateNextOccurrence = function() {
  const { type, interval, daysOfWeek, dayOfMonth } = this.recurrencePattern;
  let nextDate = new Date(this.nextOccurrence || this.startDate);
  
  switch (type) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + interval);
      break;
    case 'weekly':
      if (daysOfWeek && daysOfWeek.length > 0) {
        // Find next occurrence based on days of week
        const currentDay = nextDate.getDay();
        const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
        
        let nextDay = sortedDays.find(day => day > currentDay);
        if (!nextDay) {
          nextDay = sortedDays[0];
          nextDate.setDate(nextDate.getDate() + (7 * interval));
        }
        
        const daysToAdd = nextDay - currentDay;
        nextDate.setDate(nextDate.getDate() + daysToAdd);
      } else {
        nextDate.setDate(nextDate.getDate() + (7 * interval));
      }
      break;
    case 'monthly':
      if (dayOfMonth) {
        nextDate.setMonth(nextDate.getMonth() + interval);
        nextDate.setDate(Math.min(dayOfMonth, new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate()));
      } else {
        nextDate.setMonth(nextDate.getMonth() + interval);
      }
      break;
  }
  
  this.nextOccurrence = nextDate;
  return nextDate;
};

recurringBookingSchema.methods.generateBooking = async function() {
  if (!this.isActive || this.status !== 'active') {
    return null;
  }
  
  if (this.endDate && this.nextOccurrence > this.endDate) {
    this.status = 'completed';
    await this.save();
    return null;
  }
  
  if (this.maxOccurrences && this.totalOccurrences >= this.maxOccurrences) {
    this.status = 'completed';
    await this.save();
    return null;
  }
  
  // Check for exceptions
  const exceptionDate = this.nextOccurrence.toDateString();
  const exception = this.exceptions.find(ex => ex.date.toDateString() === exceptionDate);
  
  if (exception) {
    if (exception.action === 'skip') {
      this.generatedBookings.push({
        scheduledDate: this.nextOccurrence,
        status: 'skipped'
      });
      this.calculateNextOccurrence();
      await this.save();
      return this.generateBooking(); // Try next occurrence
    } else if (exception.action === 'reschedule' && exception.rescheduleDate) {
      this.nextOccurrence = exception.rescheduleDate;
    }
  }
  
  const Booking = mongoose.model('Booking');
  
  const bookingData = {
    customer: this.customer,
    service: this.service,
    stylist: this.stylist,
    date: this.nextOccurrence,
    time: this.time,
    duration: this.duration,
    status: this.bookingPreferences.autoConfirm ? 'confirmed' : 'pending',
    isRecurring: true,
    recurringBookingId: this._id,
    customerInfo: {
      // Will be populated from customer data
    }
  };
  
  try {
    const booking = new Booking(bookingData);
    await booking.save();
    
    this.generatedBookings.push({
      booking: booking._id,
      scheduledDate: this.nextOccurrence,
      status: 'scheduled'
    });
    
    this.totalOccurrences += 1;
    this.calculateNextOccurrence();
    await this.save();
    
    return booking;
  } catch (error) {
    console.error('Error generating recurring booking:', error);
    return null;
  }
};

recurringBookingSchema.methods.pause = function() {
  this.status = 'paused';
  return this.save();
};

recurringBookingSchema.methods.resume = function() {
  this.status = 'active';
  return this.save();
};

recurringBookingSchema.methods.cancel = function() {
  this.status = 'cancelled';
  this.isActive = false;
  return this.save();
};

recurringBookingSchema.methods.addException = function(date, reason, action = 'skip', rescheduleDate = null, rescheduleTime = null) {
  this.exceptions.push({
    date,
    reason,
    action,
    rescheduleDate,
    rescheduleTime
  });
  return this.save();
};

// Static methods
recurringBookingSchema.statics.generateDueBookings = async function() {
  const now = new Date();
  const dueRecurringBookings = await this.find({
    status: 'active',
    isActive: true,
    nextOccurrence: { $lte: now }
  });
  
  const results = [];
  
  for (const recurringBooking of dueRecurringBookings) {
    const booking = await recurringBooking.generateBooking();
    if (booking) {
      results.push(booking);
    }
  }
  
  return results;
};

recurringBookingSchema.statics.getUpcomingOccurrences = async function(customerId, days = 30) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  
  return this.find({
    customer: customerId,
    status: 'active',
    isActive: true,
    nextOccurrence: { $gte: startDate, $lte: endDate }
  }).populate('service stylist');
};

// Pre-save middleware
recurringBookingSchema.pre('save', function(next) {
  if (this.isNew && !this.nextOccurrence) {
    this.nextOccurrence = this.startDate;
  }
  next();
});

module.exports = mongoose.model('RecurringBooking', recurringBookingSchema);
