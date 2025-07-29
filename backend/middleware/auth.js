const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No user found with this token'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User account is deactivated'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Optional authentication - doesn't require token but adds user if present
exports.optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Token is invalid, but we continue without user
      req.user = null;
    }
  }

  next();
};

// Check if user owns resource or is admin
exports.ownerOrAdmin = (req, res, next) => {
  if (req.user.role === 'admin' || req.user._id.toString() === req.params.id) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to access this resource'
    });
  }
};

// Check if user is barber and approved
exports.approvedBarber = (req, res, next) => {
  if (req.user.role !== 'barber') {
    return res.status(403).json({
      success: false,
      error: 'Access restricted to barbers only'
    });
  }

  if (req.user.registrationStatus !== 'approved') {
    return res.status(403).json({
      success: false,
      error: 'Barber registration is not approved yet'
    });
  }

  next();
};
