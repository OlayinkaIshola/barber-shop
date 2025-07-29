const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Simple in-memory data store for now
let users = [];
let services = [];
let bookings = [];
let stylists = [];

const app = express();

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8082', 'http://localhost:8084', 'http://localhost:3000'],
  credentials: true
}));

// Initialize sample data
const initializeData = () => {
  // Sample services
  services = [
    {
      _id: '6888f59f04354daa82250bf5',
      id: '6888f59f04354daa82250bf5',
      name: 'Classic Haircut',
      description: 'Traditional men\'s haircut with styling',
      price: 25,
      duration: 30,
      category: 'Haircuts',
      isActive: true
    },
    {
      _id: '6888f59f04354daa82250bf6',
      id: '6888f59f04354daa82250bf6',
      name: 'Beard Trim',
      description: 'Professional beard trimming and shaping',
      price: 15,
      duration: 20,
      category: 'Beard Services',
      isActive: true
    },
    {
      _id: '6888f59f04354daa82250bf7',
      id: '6888f59f04354daa82250bf7',
      name: 'Hot Towel Shave',
      description: 'Traditional hot towel shave experience',
      price: 35,
      duration: 45,
      category: 'Specialty Services',
      isActive: true
    }
  ];

  // Sample stylists
  stylists = [
    {
      _id: '6888f59f04354daa82250bf8',
      id: '6888f59f04354daa82250bf8',
      firstName: 'Mike',
      lastName: 'Johnson',
      fullName: 'Mike Johnson',
      title: 'Master Barber',
      experience: 8,
      rating: 4.9,
      specialties: ['Classic Cuts', 'Beard Styling'],
      bio: 'Experienced barber with 8 years in the industry',
      role: 'barber',
      isActive: true,
      registrationStatus: 'approved'
    },
    {
      _id: '6888f59f04354daa82250bf9',
      id: '6888f59f04354daa82250bf9',
      firstName: 'Sarah',
      lastName: 'Wilson',
      fullName: 'Sarah Wilson',
      title: 'Senior Stylist',
      experience: 5,
      rating: 4.7,
      specialties: ['Modern Cuts', 'Hair Treatments'],
      bio: 'Creative stylist specializing in modern cuts',
      role: 'barber',
      isActive: true,
      registrationStatus: 'approved'
    }
  ];

  // Sample users (including the stylists)
  users = [
    {
      _id: '6888f59f04354daa82250bfa',
      id: '6888f59f04354daa82250bfa',
      firstName: 'Admin',
      lastName: 'User',
      fullName: 'Admin User',
      email: 'admin@elitebarbershop.com',
      password: '$2a$10$hashedpassword', // admin123
      role: 'admin',
      isActive: true
    },
    ...stylists.map(stylist => ({
      ...stylist,
      email: `${stylist.firstName.toLowerCase()}.${stylist.lastName.toLowerCase()}@elitebarbershop.com`,
      password: '$2a$10$hashedpassword' // barber123
    })),
    {
      _id: '6888f59f04354daa82250bfb',
      id: '6888f59f04354daa82250bfb',
      firstName: 'John',
      lastName: 'Customer',
      fullName: 'John Customer',
      email: 'john.customer@example.com',
      password: '$2a$10$hashedpassword', // customer123
      role: 'customer',
      isActive: true
    }
  ];
};

initializeData();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Elite Barber Shop API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Services endpoint
app.get('/api/services', (req, res) => {
  res.status(200).json({
    success: true,
    count: services.length,
    data: services
  });
});

// Stylists endpoint
app.get('/api/stylists', (req, res) => {
  res.status(200).json({
    success: true,
    count: stylists.length,
    data: stylists
  });
});

// Auth login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide email and password'
    });
  }

  // Find user (simplified - no password hashing for demo)
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  // Generate simple token (in production, use JWT)
  const token = `token_${user._id}_${Date.now()}`;

  res.status(200).json({
    success: true,
    token,
    data: {
      _id: user._id,
      fullName: user.fullName,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      title: user.title,
      experience: user.experience,
      rating: user.rating
    }
  });
});

// Auth register endpoint
app.post('/api/auth/register', (req, res) => {
  const { firstName, lastName, email, phone, address, password, confirmPassword, agreeToTerms } = req.body;

  if (!firstName || !lastName || !email || !password || !confirmPassword || !agreeToTerms) {
    return res.status(400).json({
      success: false,
      error: 'Please fill in all required fields'
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      error: 'Passwords do not match'
    });
  }

  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return res.status(400).json({
      success: false,
      error: 'User with this email already exists'
    });
  }

  // Create new user
  const newUser = {
    _id: `user_${Date.now()}`,
    id: `user_${Date.now()}`,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    email,
    phone,
    address,
    password: '$2a$10$hashedpassword', // In production, hash the password
    role: req.body.title ? 'barber' : 'customer', // If title provided, assume barber
    title: req.body.title,
    experience: req.body.experience,
    specialties: req.body.specialties || [],
    bio: req.body.bio,
    social: req.body.social || {},
    isActive: true,
    registrationStatus: req.body.title ? 'pending' : 'approved',
    createdAt: new Date()
  };

  users.push(newUser);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role
    }
  });
});

// Bookings endpoint
app.post('/api/bookings', (req, res) => {
  const { customerInfo, service, stylist, date, time, notes } = req.body;

  if (!customerInfo || !service || !date || !time) {
    return res.status(400).json({
      success: false,
      error: 'Please provide all required booking information'
    });
  }

  // Find service
  const serviceDoc = services.find(s => s._id === service || s.id === service);
  if (!serviceDoc) {
    return res.status(404).json({
      success: false,
      error: 'Service not found'
    });
  }

  // Find or assign stylist
  let stylistDoc = null;
  if (stylist) {
    stylistDoc = stylists.find(s => s._id === stylist || s.id === stylist);
  } else {
    // Auto-assign first available stylist
    stylistDoc = stylists[0];
  }

  if (!stylistDoc) {
    return res.status(404).json({
      success: false,
      error: 'No stylists available'
    });
  }

  // Generate confirmation code
  const confirmationCode = Math.random().toString(36).substr(2, 8).toUpperCase();

  // Create booking
  const booking = {
    _id: `booking_${Date.now()}`,
    id: `booking_${Date.now()}`,
    customerInfo,
    service: serviceDoc._id,
    serviceSnapshot: {
      name: serviceDoc.name,
      price: serviceDoc.price,
      duration: serviceDoc.duration,
      description: serviceDoc.description
    },
    stylist: stylistDoc._id,
    stylistSnapshot: {
      name: stylistDoc.fullName,
      title: stylistDoc.title,
      experience: stylistDoc.experience
    },
    date: new Date(date),
    time,
    notes: notes || '',
    status: 'confirmed',
    paymentStatus: 'pending',
    totalAmount: serviceDoc.price,
    confirmationCode,
    createdAt: new Date()
  };

  bookings.push(booking);

  res.status(201).json({
    success: true,
    message: 'Booking created successfully',
    data: {
      ...booking,
      formattedDate: new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      formattedTime: time
    }
  });
});

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Elite Barber Shop API running on port ${PORT}`);
  console.log(`📊 Sample data loaded:`);
  console.log(`   - ${services.length} services`);
  console.log(`   - ${stylists.length} stylists`);
  console.log(`   - ${users.length} users`);
  console.log(`🌐 Frontend should connect to: http://localhost:${PORT}`);
});

module.exports = app;
