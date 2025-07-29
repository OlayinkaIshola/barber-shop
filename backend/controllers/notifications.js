const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (page - 1) * limit;

    let query = { recipient: req.user.id };
    
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(req.user.id);

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get notifications'
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this notification'
      });
    }

    await notification.markAsRead();

    res.status(200).json({
      success: true,
      data: notification,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.markAllAsRead(req.user.id);

    res.status(200).json({
      success: true,
      data: { modifiedCount: result.modifiedCount },
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read'
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this notification'
      });
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification'
    });
  }
};

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private
exports.getNotificationStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Notification.aggregate([
      { $match: { recipient: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] } },
          read: { $sum: { $cond: [{ $eq: ['$read', true] }, 1, 0] } }
        }
      }
    ]);

    const typeBreakdown = await Notification.aggregate([
      { $match: { recipient: userId } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || { total: 0, unread: 0, read: 0 },
        typeBreakdown
      }
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get notification statistics'
    });
  }
};

// @desc    Create notification (Admin only)
// @route   POST /api/notifications
// @access  Private/Admin
exports.createNotification = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to create notifications'
      });
    }

    const { recipient, type, title, message, data, priority, channel } = req.body;

    // Validate recipient
    const user = await User.findById(recipient);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Recipient user not found'
      });
    }

    const notification = await Notification.createNotification({
      recipient,
      type,
      title,
      message,
      data: data || {},
      priority: priority || 'medium',
      channel: channel || 'in-app'
    });

    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notification created successfully'
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create notification'
    });
  }
};

// @desc    Send bulk notifications (Admin only)
// @route   POST /api/notifications/bulk
// @access  Private/Admin
exports.sendBulkNotifications = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to send bulk notifications'
      });
    }

    const { recipients, type, title, message, data, priority, channel } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Recipients array is required'
      });
    }

    const notifications = [];
    const errors = [];

    for (const recipientId of recipients) {
      try {
        const user = await User.findById(recipientId);
        if (!user) {
          errors.push({ recipientId, error: 'User not found' });
          continue;
        }

        const notification = await Notification.createNotification({
          recipient: recipientId,
          type,
          title,
          message,
          data: data || {},
          priority: priority || 'medium',
          channel: channel || 'in-app'
        });

        notifications.push(notification);
      } catch (error) {
        errors.push({ recipientId, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        sent: notifications.length,
        errors: errors.length,
        notifications,
        errors
      },
      message: `Sent ${notifications.length} notifications successfully`
    });
  } catch (error) {
    console.error('Send bulk notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send bulk notifications'
    });
  }
};

// Helper function to create booking notification
exports.createBookingNotification = async (type, booking, additionalData = {}) => {
  try {
    let title, message, recipient;

    switch (type) {
      case 'booking_confirmation':
        title = 'Booking Confirmed';
        message = `Your booking for ${booking.serviceSnapshot?.name} has been confirmed for ${booking.formattedDate} at ${booking.formattedTime}.`;
        recipient = booking.customer;
        break;

      case 'booking_reminder':
        title = 'Booking Reminder';
        message = `Reminder: You have an appointment for ${booking.serviceSnapshot?.name} tomorrow at ${booking.formattedTime}.`;
        recipient = booking.customer;
        break;

      case 'booking_cancelled':
        title = 'Booking Cancelled';
        message = `Your booking for ${booking.serviceSnapshot?.name} on ${booking.formattedDate} has been cancelled.`;
        recipient = booking.customer;
        break;

      case 'booking_rescheduled':
        title = 'Booking Rescheduled';
        message = `Your booking has been rescheduled to ${booking.formattedDate} at ${booking.formattedTime}.`;
        recipient = booking.customer;
        break;

      default:
        throw new Error('Invalid notification type');
    }

    const notificationData = {
      bookingDetails: {
        serviceName: booking.serviceSnapshot?.name,
        date: booking.formattedDate,
        time: booking.formattedTime,
        stylistName: booking.stylistSnapshot?.name,
        confirmationCode: booking.confirmationCode
      },
      actionUrl: `${process.env.FRONTEND_URL}/booking-history`,
      ...additionalData
    };

    await Notification.createNotification({
      recipient,
      type,
      title,
      message,
      data: notificationData,
      priority: type === 'booking_reminder' ? 'high' : 'medium',
      channel: 'email'
    });
  } catch (error) {
    console.error('Create booking notification error:', error);
  }
};
