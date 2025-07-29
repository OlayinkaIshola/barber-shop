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

  // Service and Stylist
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
    required: [true, 'Booking date is required']
  },
  time: {
    type: String,
    required: [true, 'Booking time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time in HH:MM format']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },

  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank-transfer', 'pending'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Amount cannot be negative']
  },

  // Confirmation
  confirmationCode: {
    type: String,
    unique: true,
    index: true
  },

  // Communication
  reminderSent: {
    type: Boolean,
    default: false
  },
  confirmationEmailSent: {
    type: Boolean,
    default: false
  },

  // Review and Rating
  review: {
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Review comment cannot exceed 500 characters']
    },
    reviewDate: {
      type: Date,
      default: Date.now
    }
  },

  // Metadata
  source: {
    type: String,
    enum: ['website', 'phone', 'walk-in', 'admin'],
    default: 'website'
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
bookingSchema.index({ date: 1, time: 1 });
bookingSchema.index({ stylist: 1, date: 1 });
bookingSchema.index({ 'customerInfo.email': 1 });
bookingSchema.index({ confirmationCode: 1 });
bookingSchema.index({ status: 1 });

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

// Virtual for duration in minutes
bookingSchema.virtual('durationMinutes').get(function() {
  return this.serviceSnapshot ? this.serviceSnapshot.duration : 0;
});

// Pre-save middleware to generate confirmation code
bookingSchema.pre('save', function(next) {
  if (!this.confirmationCode) {
    this.confirmationCode = this.generateConfirmationCode();
  }
  next();
});

// Pre-save middleware to create snapshots
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

// Method to generate confirmation code
bookingSchema.methods.generateConfirmationCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Static method to find available time slots
bookingSchema.statics.getAvailableSlots = async function(stylistId, date, duration = 30) {
  const startHour = 9; // 9 AM
  const endHour = 18; // 6 PM
  const slotDuration = 30; // 30 minutes
  
  const bookings = await this.find({
    stylist: stylistId,
    date: new Date(date),
    status: { $nin: ['cancelled', 'no-show'] }
  });

  const availableSlots = [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // Check if this slot conflicts with existing bookings
      const hasConflict = bookings.some(booking => {
        const bookingStart = new Date(`1970-01-01T${booking.time}:00`);
        const bookingEnd = new Date(bookingStart.getTime() + booking.serviceSnapshot.duration * 60000);
        const slotStart = new Date(`1970-01-01T${timeString}:00`);
        const slotEnd = new Date(slotStart.getTime() + duration * 60000);
        
        return (slotStart < bookingEnd && slotEnd > bookingStart);
      });
      
      if (!hasConflict) {
        availableSlots.push(timeString);
      }
    }
  }
  
  return availableSlots;
};

module.exports = mongoose.model('Booking', bookingSchema);
