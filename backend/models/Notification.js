const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'booking_confirmation',
      'booking_reminder',
      'booking_cancelled',
      'booking_rescheduled',
      'payment_received',
      'payment_failed',
      'review_request',
      'stylist_approved',
      'stylist_rejected',
      'general'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  channel: {
    type: String,
    enum: ['in-app', 'email', 'sms', 'push'],
    default: 'in-app'
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date
  },
  smsSent: {
    type: Boolean,
    default: false
  },
  smsSentAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for formatted creation date
notificationSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Instance methods
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

notificationSchema.methods.markEmailSent = function() {
  this.emailSent = true;
  this.emailSentAt = new Date();
  return this.save();
};

notificationSchema.methods.markSmsSent = function() {
  this.smsSent = true;
  this.smsSentAt = new Date();
  return this.save();
};

// Static methods
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  await notification.save();
  
  // Send email if required
  if (data.channel === 'email' || data.priority === 'urgent') {
    await this.sendEmailNotification(notification);
  }
  
  return notification;
};

notificationSchema.statics.sendEmailNotification = async function(notification) {
  try {
    const User = mongoose.model('User');
    const user = await User.findById(notification.recipient);
    
    if (!user || !user.email) {
      return;
    }

    const { sendEmail } = require('../utils/email');
    
    await sendEmail({
      email: user.email,
      subject: notification.title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%); color: #f4e4bc; padding: 2rem; text-align: center;">
            <h1 style="margin: 0; color: #d4af37;">Elite Barber Shop</h1>
          </div>
          
          <div style="padding: 2rem; background: #f9f9f9;">
            <h2 style="color: #2c2c2c; margin-top: 0;">${notification.title}</h2>
            <p style="color: #666; line-height: 1.6;">${notification.message}</p>
            
            ${notification.data.bookingDetails ? `
              <div style="background: #fff; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #d4af37; margin: 1.5rem 0;">
                <h3 style="margin-top: 0; color: #2c2c2c;">Booking Details</h3>
                <p><strong>Service:</strong> ${notification.data.bookingDetails.serviceName}</p>
                <p><strong>Date:</strong> ${notification.data.bookingDetails.date}</p>
                <p><strong>Time:</strong> ${notification.data.bookingDetails.time}</p>
                <p><strong>Stylist:</strong> ${notification.data.bookingDetails.stylistName}</p>
                ${notification.data.bookingDetails.confirmationCode ? `<p><strong>Confirmation Code:</strong> ${notification.data.bookingDetails.confirmationCode}</p>` : ''}
              </div>
            ` : ''}
            
            ${notification.data.actionUrl ? `
              <div style="text-align: center; margin: 2rem 0;">
                <a href="${notification.data.actionUrl}" 
                   style="background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%); 
                          color: #2c2c2c; 
                          padding: 1rem 2rem; 
                          text-decoration: none; 
                          border-radius: 25px; 
                          font-weight: 600; 
                          display: inline-block;">
                  View Details
                </a>
              </div>
            ` : ''}
          </div>
          
          <div style="background: #2c2c2c; color: #f4e4bc; padding: 1rem; text-align: center; font-size: 0.9rem;">
            <p style="margin: 0;">Thank you for choosing Elite Barber Shop!</p>
            <p style="margin: 0.5rem 0 0; opacity: 0.8;">This is an automated message, please do not reply.</p>
          </div>
        </div>
      `
    });
    
    await notification.markEmailSent();
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
};

notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({ recipient: userId, read: false });
};

notificationSchema.statics.markAllAsRead = async function(userId) {
  return this.updateMany(
    { recipient: userId, read: false },
    { read: true, readAt: new Date() }
  );
};

notificationSchema.statics.deleteOldNotifications = async function() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.deleteMany({ createdAt: { $lt: thirtyDaysAgo } });
};

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  if (this.read && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);
