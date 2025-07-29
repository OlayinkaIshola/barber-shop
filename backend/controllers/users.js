const User = require('../models/User');
const Booking = require('../models/Booking');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profiles/');
  },
  filename: function (req, file, cb) {
    cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/jpg,image/png,image/gif').split(',');
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (req.query.role) {
      query.role = req.query.role;
    }
    
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }
    
    if (req.query.registrationStatus) {
      query.registrationStatus = req.query.registrationStatus;
    }

    const users = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpire')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Owner or Admin)
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpire');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Create user error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email address is already registered'
      });
    }

    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Owner or Admin)
exports.updateUser = async (req, res) => {
  try {
    // Remove sensitive fields that shouldn't be updated via this route
    const { password, resetPasswordToken, resetPasswordExpire, emailVerificationToken, emailVerificationExpire, ...updateData } = req.body;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpire');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email address is already in use'
      });
    }

    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Don't allow deletion of admin users
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete admin users'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Upload profile image
// @route   POST /api/users/upload-profile-image
// @access  Private
exports.uploadProfileImage = async (req, res) => {
  try {
    upload.single('profileImage')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Please upload an image file'
        });
      }

      // Update user's profile image
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { profileImage: `/uploads/profiles/${req.file.filename}` },
        { new: true }
      ).select('-password');

      res.status(200).json({
        success: true,
        data: user,
        message: 'Profile image uploaded successfully'
      });
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get pending barber registrations
// @route   GET /api/users/pending-barbers
// @access  Private/Admin
exports.getPendingBarbers = async (req, res) => {
  try {
    const pendingBarbers = await User.find({
      role: 'barber',
      registrationStatus: 'pending'
    })
    .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpire')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pendingBarbers.length,
      data: pendingBarbers
    });
  } catch (error) {
    console.error('Get pending barbers error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    let stats = {};

    if (req.user.role === 'admin') {
      // Admin stats
      const [
        totalUsers,
        totalCustomers,
        totalBarbers,
        approvedBarbers,
        pendingBarbers,
        totalBookings,
        completedBookings,
        totalRevenue
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'customer' }),
        User.countDocuments({ role: 'barber' }),
        User.countDocuments({ role: 'barber', registrationStatus: 'approved' }),
        User.countDocuments({ role: 'barber', registrationStatus: 'pending' }),
        Booking.countDocuments(),
        Booking.countDocuments({ status: 'completed' }),
        Booking.aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ])
      ]);

      stats = {
        users: {
          total: totalUsers,
          customers: totalCustomers,
          barbers: totalBarbers,
          approvedBarbers: approvedBarbers,
          pendingBarbers: pendingBarbers
        },
        bookings: {
          total: totalBookings,
          completed: completedBookings
        },
        revenue: {
          total: totalRevenue[0]?.total || 0
        }
      };
    } else if (req.user.role === 'customer') {
      // Customer stats
      const [
        totalBookings,
        completedBookings,
        upcomingBookings,
        totalSpent
      ] = await Promise.all([
        Booking.countDocuments({ 'customerInfo.email': req.user.email }),
        Booking.countDocuments({ 'customerInfo.email': req.user.email, status: 'completed' }),
        Booking.countDocuments({ 
          'customerInfo.email': req.user.email, 
          status: { $in: ['pending', 'confirmed'] },
          date: { $gte: new Date() }
        }),
        Booking.aggregate([
          { $match: { 'customerInfo.email': req.user.email, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ])
      ]);

      stats = {
        bookings: {
          total: totalBookings,
          completed: completedBookings,
          upcoming: upcomingBookings
        },
        spending: {
          total: totalSpent[0]?.total || 0
        }
      };
    } else if (req.user.role === 'barber') {
      // Barber stats (redirect to stylist stats)
      return res.redirect('/api/stylists/stats/my-stats');
    }

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};
