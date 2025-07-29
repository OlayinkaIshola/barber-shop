const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Public
exports.createBooking = async (req, res) => {
  try {
    const { customerInfo, service, stylist, date, time, notes, paymentMethod } = req.body;

    // Verify service exists
    const serviceDoc = await Service.findById(service);
    if (!serviceDoc) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    // Verify stylist exists and is approved
    const stylistDoc = await User.findOne({
      _id: stylist,
      role: 'barber',
      registrationStatus: 'approved',
      isActive: true
    });
    if (!stylistDoc) {
      return res.status(404).json({
        success: false,
        error: 'Stylist not found or not available'
      });
    }

    // Check availability
    const isAvailable = await checkTimeSlotAvailability(stylist, date, time, serviceDoc.duration);
    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        error: 'Selected time slot is not available'
      });
    }

    // Create booking
    const booking = await Booking.create({
      customerInfo,
      service,
      stylist,
      date: new Date(date),
      time,
      notes,
      paymentMethod: paymentMethod || 'pending',
      totalAmount: serviceDoc.price
    });

    // Populate the booking
    await booking.populate([
      { path: 'service', select: 'name price duration' },
      { path: 'stylist', select: 'firstName lastName title email' }
    ]);

    // Send confirmation emails
    try {
      // Email to customer
      await sendBookingConfirmationEmail(booking, 'customer');
      
      // Email to stylist
      await sendBookingConfirmationEmail(booking, 'stylist');
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the booking if email fails
    }

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all bookings (admin only)
// @route   GET /api/bookings
// @access  Private/Admin
exports.getBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.stylist) {
      query.stylist = req.query.stylist;
    }
    
    if (req.query.date) {
      const date = new Date(req.query.date);
      query.date = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      };
    }

    const bookings = await Booking.find(query)
      .populate('service', 'name price duration')
      .populate('stylist', 'firstName lastName title')
      .sort({ date: -1, time: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service', 'name price duration description')
      .populate('stylist', 'firstName lastName title experience rating');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check if user can access this booking
    if (req.user.role === 'customer' && booking.customerInfo.email !== req.user.email) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this booking'
      });
    }

    if (req.user.role === 'barber' && booking.stylist._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private/Admin/Barber
exports.updateBooking = async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check authorization
    if (req.user.role === 'barber' && booking.stylist.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this booking'
      });
    }

    // If updating date/time, check availability
    if (req.body.date || req.body.time) {
      const newDate = req.body.date || booking.date;
      const newTime = req.body.time || booking.time;
      const duration = booking.serviceSnapshot.duration;

      const isAvailable = await checkTimeSlotAvailability(
        booking.stylist,
        newDate,
        newTime,
        duration,
        booking._id
      );

      if (!isAvailable) {
        return res.status(400).json({
          success: false,
          error: 'Selected time slot is not available'
        });
      }
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate([
      { path: 'service', select: 'name price duration' },
      { path: 'stylist', select: 'firstName lastName title' }
    ]);

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Booking updated successfully'
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private/Admin
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    await booking.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get current user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      'customerInfo.email': req.user.email
    })
      .populate('service', 'name price duration')
      .populate('stylist', 'firstName lastName title')
      .sort({ date: -1, time: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get stylist's bookings
// @route   GET /api/bookings/stylist/my-bookings
// @access  Private/Barber
exports.getStylistBookings = async (req, res) => {
  try {
    const { status, date, startDate, endDate } = req.query;
    
    let query = { stylist: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const bookingDate = new Date(date);
      query.date = {
        $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
        $lt: new Date(bookingDate.setHours(23, 59, 59, 999))
      };
    } else if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const bookings = await Booking.find(query)
      .populate('service', 'name price duration')
      .sort({ date: 1, time: 1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Get stylist bookings error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Check availability
// @route   GET /api/bookings/availability
// @access  Public
exports.checkAvailability = async (req, res) => {
  try {
    const { stylistId, date, time, duration } = req.query;

    const isAvailable = await checkTimeSlotAvailability(stylistId, date, time, parseInt(duration));

    res.status(200).json({
      success: true,
      available: isAvailable
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Confirm booking
// @route   PUT /api/bookings/:id/confirm
// @access  Private/Barber
exports.confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    if (booking.stylist.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to confirm this booking'
      });
    }

    booking.status = 'confirmed';
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Booking confirmed successfully'
    });
  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check authorization
    const canCancel = req.user.role === 'admin' ||
                     (req.user.role === 'barber' && booking.stylist.toString() === req.user._id.toString()) ||
                     (req.user.role === 'customer' && booking.customerInfo.email === req.user.email);

    if (!canCancel) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to cancel this booking'
      });
    }

    const { reason } = req.body;
    await booking.cancel(reason, req.user.role);

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Complete booking
// @route   PUT /api/bookings/:id/complete
// @access  Private/Barber
exports.completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    if (booking.stylist.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to complete this booking'
      });
    }

    await booking.complete();

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Booking completed successfully'
    });
  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Add review to booking
// @route   PUT /api/bookings/:id/review
// @access  Private
exports.addReview = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check if user can review this booking
    if (booking.customerInfo.email !== req.user.email) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to review this booking'
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Can only review completed bookings'
      });
    }

    if (booking.review.rating) {
      return res.status(400).json({
        success: false,
        error: 'Booking has already been reviewed'
      });
    }

    const { rating, comment } = req.body;

    booking.review = {
      rating,
      comment,
      reviewDate: new Date()
    };

    await booking.save();

    // Update stylist's average rating
    await updateStylistRating(booking.stylist);

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Review added successfully'
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Helper function to check time slot availability
const checkTimeSlotAvailability = async (stylistId, date, time, duration, excludeBookingId = null) => {
  const bookingDate = new Date(date);
  const [hours, minutes] = time.split(':');
  const startTime = new Date(bookingDate);
  startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + duration);

  const query = {
    stylist: stylistId,
    date: bookingDate,
    status: { $nin: ['cancelled', 'no-show'] }
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBookings = await Booking.find(query);

  for (const booking of conflictingBookings) {
    const [bookingHours, bookingMinutes] = booking.time.split(':');
    const bookingStartTime = new Date(booking.date);
    bookingStartTime.setHours(parseInt(bookingHours), parseInt(bookingMinutes), 0, 0);
    
    const bookingEndTime = new Date(bookingStartTime);
    bookingEndTime.setMinutes(bookingEndTime.getMinutes() + booking.serviceSnapshot.duration);

    // Check for time overlap
    if (startTime < bookingEndTime && endTime > bookingStartTime) {
      return false;
    }
  }

  return true;
};

// Helper function to send booking confirmation email
const sendBookingConfirmationEmail = async (booking, recipient) => {
  const isCustomer = recipient === 'customer';
  const email = isCustomer ? booking.customerInfo.email : booking.stylist.email;
  const name = isCustomer ? booking.customerInfo.name : booking.stylist.firstName;

  const subject = `Elite Barber Shop - Booking ${isCustomer ? 'Confirmation' : 'Notification'}`;
  
  const message = `
    <h1>Booking ${isCustomer ? 'Confirmation' : 'Notification'}</h1>
    <p>Hello ${name},</p>
    <p>${isCustomer ? 'Your booking has been confirmed!' : 'You have a new booking!'}</p>
    
    <div style="background: #f4f4f4; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h3>Booking Details:</h3>
      <p><strong>Confirmation Code:</strong> ${booking.confirmationCode}</p>
      <p><strong>Service:</strong> ${booking.serviceSnapshot.name}</p>
      <p><strong>Date:</strong> ${booking.formattedDate}</p>
      <p><strong>Time:</strong> ${booking.formattedTime}</p>
      <p><strong>Duration:</strong> ${booking.serviceSnapshot.duration} minutes</p>
      <p><strong>Price:</strong> $${booking.serviceSnapshot.price}</p>
      ${isCustomer ? `<p><strong>Stylist:</strong> ${booking.stylistSnapshot.name}</p>` : `<p><strong>Customer:</strong> ${booking.customerInfo.name}</p>`}
      ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
    </div>
    
    <p>Thank you for choosing Elite Barber Shop!</p>
  `;

  await sendEmail({
    email,
    subject,
    html: message
  });
};

// Helper function to update stylist rating
const updateStylistRating = async (stylistId) => {
  const bookings = await Booking.find({
    stylist: stylistId,
    'review.rating': { $exists: true }
  });

  if (bookings.length > 0) {
    const totalRating = bookings.reduce((sum, booking) => sum + booking.review.rating, 0);
    const averageRating = totalRating / bookings.length;

    await User.findByIdAndUpdate(stylistId, {
      rating: Math.round(averageRating * 10) / 10,
      totalReviews: bookings.length
    });
  }
};
