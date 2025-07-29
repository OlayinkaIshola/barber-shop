const User = require('../models/User');
const Stylist = require('../models/Stylist');
const Booking = require('../models/Booking');

// @desc    Get all stylists
// @route   GET /api/stylists
// @access  Public
exports.getStylists = async (req, res) => {
  try {
    const { sort, experience, specialties } = req.query;
    
    let query = {
      role: 'barber',
      registrationStatus: 'approved',
      isActive: true
    };

    // Filter by minimum experience
    if (experience) {
      query.experience = { $gte: parseInt(experience) };
    }

    // Filter by specialties
    if (specialties) {
      const specialtyArray = specialties.split(',');
      query.specialties = { $in: specialtyArray };
    }

    let stylists = User.find(query).select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpire');

    // Sorting
    if (sort) {
      const sortBy = sort.split(',').join(' ');
      stylists = stylists.sort(sortBy);
    } else {
      stylists = stylists.sort('-experience rating'); // Default sort by experience desc, then rating
    }

    const result = await stylists;

    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    console.error('Get stylists error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single stylist
// @route   GET /api/stylists/:id
// @access  Public
exports.getStylist = async (req, res) => {
  try {
    const stylist = await User.findOne({
      _id: req.params.id,
      role: 'barber',
      registrationStatus: 'approved',
      isActive: true
    }).select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpire');

    if (!stylist) {
      return res.status(404).json({
        success: false,
        error: 'Stylist not found'
      });
    }

    // Get recent reviews
    const recentBookings = await Booking.find({
      stylist: stylist._id,
      'review.rating': { $exists: true }
    })
    .select('review customerInfo.name')
    .sort({ 'review.reviewDate': -1 })
    .limit(5);

    const stylistData = {
      ...stylist.toObject(),
      recentReviews: recentBookings.map(booking => ({
        rating: booking.review.rating,
        comment: booking.review.comment,
        customerName: booking.customerInfo.name.split(' ')[0], // First name only
        date: booking.review.reviewDate
      }))
    };

    res.status(200).json({
      success: true,
      data: stylistData
    });
  } catch (error) {
    console.error('Get stylist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get stylist availability
// @route   GET /api/stylists/:id/availability
// @access  Public
exports.getStylistAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    
    const stylist = await User.findOne({
      _id: req.params.id,
      role: 'barber',
      registrationStatus: 'approved',
      isActive: true
    }).select('availability');

    if (!stylist) {
      return res.status(404).json({
        success: false,
        error: 'Stylist not found'
      });
    }

    let availableSlots = [];

    if (date) {
      // Get available time slots for specific date
      const requestedDate = new Date(date);
      const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
      
      const dayAvailability = stylist.availability[dayOfWeek];
      
      if (dayAvailability && dayAvailability.available) {
        // Get existing bookings for this date
        const existingBookings = await Booking.find({
          stylist: stylist._id,
          date: {
            $gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
            $lt: new Date(requestedDate.setHours(23, 59, 59, 999))
          },
          status: { $nin: ['cancelled', 'no-show'] }
        }).select('time serviceSnapshot.duration');

        // Generate time slots (assuming 30-minute intervals)
        const startTime = dayAvailability.start || '09:00';
        const endTime = dayAvailability.end || '17:00';
        
        availableSlots = generateTimeSlots(startTime, endTime, existingBookings);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        availability: stylist.availability,
        availableSlots: date ? availableSlots : undefined
      }
    });
  } catch (error) {
    console.error('Get stylist availability error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update stylist availability
// @route   PUT /api/stylists/availability
// @access  Private/Barber
exports.updateStylistAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    const stylist = await User.findByIdAndUpdate(
      req.user._id,
      { availability },
      { new: true, runValidators: true }
    ).select('availability');

    res.status(200).json({
      success: true,
      data: stylist,
      message: 'Availability updated successfully'
    });
  } catch (error) {
    console.error('Update stylist availability error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get stylist stats
// @route   GET /api/stylists/stats/my-stats
// @access  Private/Barber
exports.getStylistStats = async (req, res) => {
  try {
    const stylistId = req.user._id;
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));

    // Get various booking statistics
    const [
      totalBookings,
      completedBookings,
      todayBookings,
      weekBookings,
      monthBookings,
      totalEarnings,
      monthEarnings,
      averageRating,
      totalReviews
    ] = await Promise.all([
      Booking.countDocuments({ stylist: stylistId }),
      Booking.countDocuments({ stylist: stylistId, status: 'completed' }),
      Booking.countDocuments({
        stylist: stylistId,
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }),
      Booking.countDocuments({
        stylist: stylistId,
        date: { $gte: startOfWeek }
      }),
      Booking.countDocuments({
        stylist: stylistId,
        date: { $gte: startOfMonth }
      }),
      Booking.aggregate([
        { $match: { stylist: stylistId, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Booking.aggregate([
        { 
          $match: { 
            stylist: stylistId, 
            status: 'completed',
            date: { $gte: startOfMonth }
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Booking.aggregate([
        { 
          $match: { 
            stylist: stylistId,
            'review.rating': { $exists: true }
          } 
        },
        { $group: { _id: null, avgRating: { $avg: '$review.rating' } } }
      ]),
      Booking.countDocuments({
        stylist: stylistId,
        'review.rating': { $exists: true }
      })
    ]);

    const stats = {
      bookings: {
        total: totalBookings,
        completed: completedBookings,
        today: todayBookings,
        thisWeek: weekBookings,
        thisMonth: monthBookings
      },
      earnings: {
        total: totalEarnings[0]?.total || 0,
        thisMonth: monthEarnings[0]?.total || 0
      },
      rating: {
        average: averageRating[0]?.avgRating || 0,
        totalReviews: totalReviews
      }
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get stylist stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Approve stylist registration
// @route   PUT /api/stylists/:id/approve
// @access  Private/Admin
exports.approveStylist = async (req, res) => {
  try {
    // Find the barber to approve
    const barber = await User.findOne({ _id: req.params.id, role: 'barber' });

    if (!barber) {
      return res.status(404).json({
        success: false,
        error: 'Barber not found'
      });
    }

    // Prepare stylist data with defaults if not provided
    const stylistData = {
      registrationStatus: 'approved',
      isActive: true,
      // Set default availability if not already set
      availability: barber.availability || {
        monday: { start: '09:00', end: '17:00', available: true },
        tuesday: { start: '09:00', end: '17:00', available: true },
        wednesday: { start: '09:00', end: '17:00', available: true },
        thursday: { start: '09:00', end: '17:00', available: true },
        friday: { start: '09:00', end: '17:00', available: true },
        saturday: { start: '09:00', end: '17:00', available: true },
        sunday: { start: '10:00', end: '16:00', available: false }
      },
      // Set default rating if not set
      rating: barber.rating || 4.5,
      // Ensure bio exists
      bio: barber.bio || `${barber.firstName} is a skilled ${barber.title || 'barber'} with ${barber.experience || 0} years of experience. Specializing in ${barber.specialties?.join(', ') || 'various hair services'}.`
    };

    // Update the barber to become an active stylist
    const stylist = await User.findByIdAndUpdate(
      req.params.id,
      stylistData,
      { new: true, runValidators: true }
    ).select('-password');

    // Create or update the Stylist record for enhanced features
    let stylistRecord = await Stylist.findOne({ user: req.params.id });

    if (!stylistRecord) {
      // Create new stylist record
      stylistRecord = await Stylist.create({
        user: req.params.id,
        isActive: true,
        isAcceptingBookings: true,
        preferences: {
          maxBookingsPerDay: 12,
          breakDuration: 15,
          bufferTime: 10,
          acceptWalkIns: true,
          advanceBookingDays: 30
        },
        paymentInfo: {
          commissionRate: 0.6
        }
      });
    } else {
      // Update existing record to active
      stylistRecord.isActive = true;
      stylistRecord.isAcceptingBookings = true;
      await stylistRecord.save();
    }

    // Send approval email
    const sendEmail = require('../utils/sendEmail');
    const message = `
      <h1>Registration Approved!</h1>
      <p>Congratulations ${stylist.firstName}!</p>
      <p>Your barber registration has been approved. You can now log in to your account and start accepting bookings.</p>
      <p><strong>Your Profile:</strong></p>
      <ul>
        <li><strong>Title:</strong> ${stylist.title || 'Barber'}</li>
        <li><strong>Experience:</strong> ${stylist.experience || 0} years</li>
        <li><strong>Specialties:</strong> ${stylist.specialties?.join(', ') || 'Various services'}</li>
      </ul>
      <p>You are now visible to customers in our stylists section and can receive bookings.</p>
      <p>Welcome to the Elite Barber Shop team!</p>
    `;

    try {
      await sendEmail({
        email: stylist.email,
        subject: 'Elite Barber Shop - Registration Approved',
        html: message
      });
    } catch (emailError) {
      console.error('Approval email error:', emailError);
    }

    res.status(200).json({
      success: true,
      data: stylist,
      message: 'Stylist approved successfully and is now available for bookings'
    });
  } catch (error) {
    console.error('Approve stylist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Reject stylist registration
// @route   PUT /api/stylists/:id/reject
// @access  Private/Admin
exports.rejectStylist = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const stylist = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'barber' },
      { registrationStatus: 'rejected' },
      { new: true }
    ).select('-password');

    if (!stylist) {
      return res.status(404).json({
        success: false,
        error: 'Stylist not found'
      });
    }

    // Send rejection email
    const sendEmail = require('../utils/sendEmail');
    const message = `
      <h1>Registration Update</h1>
      <p>Hello ${stylist.firstName},</p>
      <p>Thank you for your interest in joining Elite Barber Shop.</p>
      <p>Unfortunately, we are unable to approve your registration at this time.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>You are welcome to reapply in the future.</p>
      <p>Best regards,<br>Elite Barber Shop Team</p>
    `;

    try {
      await sendEmail({
        email: stylist.email,
        subject: 'Elite Barber Shop - Registration Update',
        html: message
      });
    } catch (emailError) {
      console.error('Rejection email error:', emailError);
    }

    res.status(200).json({
      success: true,
      data: stylist,
      message: 'Stylist registration rejected'
    });
  } catch (error) {
    console.error('Reject stylist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Helper function to generate available time slots
const generateTimeSlots = (startTime, endTime, existingBookings) => {
  const slots = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  let currentTime = new Date();
  currentTime.setHours(startHour, startMinute, 0, 0);
  
  const endDateTime = new Date();
  endDateTime.setHours(endHour, endMinute, 0, 0);
  
  while (currentTime < endDateTime) {
    const timeString = currentTime.toTimeString().slice(0, 5);
    
    // Check if this time slot conflicts with existing bookings
    const isBooked = existingBookings.some(booking => {
      const bookingStart = new Date();
      const [bookingHour, bookingMinute] = booking.time.split(':').map(Number);
      bookingStart.setHours(bookingHour, bookingMinute, 0, 0);
      
      const bookingEnd = new Date(bookingStart);
      bookingEnd.setMinutes(bookingEnd.getMinutes() + booking.serviceSnapshot.duration);
      
      return currentTime >= bookingStart && currentTime < bookingEnd;
    });
    
    if (!isBooked) {
      slots.push(timeString);
    }
    
    currentTime.setMinutes(currentTime.getMinutes() + 30); // 30-minute intervals
  }
  
  return slots;
};
