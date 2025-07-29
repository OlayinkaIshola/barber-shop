const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [
      /^[\+]?[1-9][\d]{0,15}$/,
      'Please provide a valid phone number'
    ]
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },

  // Authentication
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['customer', 'barber', 'admin'],
    default: 'customer'
  },

  // Professional Information (for barbers)
  title: {
    type: String,
    enum: [
      'Junior Barber',
      'Senior Barber', 
      'Master Barber',
      'Fade Specialist',
      'Style Consultant',
      'Creative Stylist',
      'Traditional Barber'
    ]
  },
  experience: {
    type: Number,
    min: [0, 'Experience cannot be negative'],
    max: [50, 'Experience cannot exceed 50 years']
  },
  specialties: [{
    type: String,
    enum: [
      'Classic Cuts',
      'Beard Styling',
      'Fade Cuts',
      'Modern Styles',
      'Edge-ups',
      'Traditional Cuts',
      'Straight Razor',
      'Hot Towel',
      'Creative Cuts',
      'Artistic Designs',
      'Youth Styles',
      'Precision Cuts',
      'Beard Sculpting',
      'Hair Treatments',
      'Consultations',
      'Premium Services',
      'Hair Care'
    ]
  }],
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot exceed 5']
  },
  totalReviews: {
    type: Number,
    default: 0
  },

  // Social Media (for barbers)
  social: {
    instagram: {
      type: String,
      match: [/^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/, 'Invalid Instagram URL']
    },
    facebook: {
      type: String,
      match: [/^https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9_.]+\/?$/, 'Invalid Facebook URL']
    },
    twitter: {
      type: String,
      match: [/^https?:\/\/(www\.)?twitter\.com\/[a-zA-Z0-9_]+\/?$/, 'Invalid Twitter URL']
    },
    linkedin: {
      type: String,
      match: [/^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/, 'Invalid LinkedIn URL']
    }
  },

  // Profile Image
  profileImage: {
    type: String,
    default: null
  },

  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  registrationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // Email Verification
  emailVerificationToken: String,
  emailVerificationExpire: Date,

  // Availability (for barbers)
  availability: {
    monday: { start: String, end: String, available: { type: Boolean, default: true } },
    tuesday: { start: String, end: String, available: { type: Boolean, default: true } },
    wednesday: { start: String, end: String, available: { type: Boolean, default: true } },
    thursday: { start: String, end: String, available: { type: Boolean, default: true } },
    friday: { start: String, end: String, available: { type: Boolean, default: true } },
    saturday: { start: String, end: String, available: { type: Boolean, default: true } },
    sunday: { start: String, end: String, available: { type: Boolean, default: false } }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Generate email verification token
userSchema.methods.getEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(20).toString('hex');

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

module.exports = mongoose.model('User', userSchema);
