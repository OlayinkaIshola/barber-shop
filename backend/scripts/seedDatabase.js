const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Service = require('../models/Service');

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/elite-barber-shop', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample data
const users = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@elitebarbershop.com',
    phone: '+1234567890',
    address: '123 Admin Street, City, State 12345',
    password: 'admin123',
    role: 'admin',
    isActive: true,
    isVerified: true,
    registrationStatus: 'approved'
  },
  {
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@elitebarbershop.com',
    phone: '+1234567891',
    address: '456 Barber Lane, City, State 12345',
    password: 'barber123',
    role: 'barber',
    title: 'Master Barber',
    experience: 8,
    specialties: ['Classic Cuts', 'Beard Styling', 'Fade Cuts', 'Hot Towel'],
    bio: 'Experienced master barber with 8 years in the industry. Specializes in classic cuts and precision fades.',
    rating: 4.9,
    totalReviews: 127,
    isActive: true,
    isVerified: true,
    registrationStatus: 'approved',
    social: {
      instagram: 'https://instagram.com/mikejohnsonbarber',
      facebook: 'https://facebook.com/mikejohnsonbarber'
    },
    availability: {
      monday: { start: '09:00', end: '17:00', available: true },
      tuesday: { start: '09:00', end: '17:00', available: true },
      wednesday: { start: '09:00', end: '17:00', available: true },
      thursday: { start: '09:00', end: '17:00', available: true },
      friday: { start: '09:00', end: '18:00', available: true },
      saturday: { start: '08:00', end: '16:00', available: true },
      sunday: { start: '10:00', end: '14:00', available: false }
    }
  },
  {
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.williams@elitebarbershop.com',
    phone: '+1234567892',
    address: '789 Style Avenue, City, State 12345',
    password: 'barber123',
    role: 'barber',
    title: 'Creative Stylist',
    experience: 5,
    specialties: ['Modern Styles', 'Creative Cuts', 'Artistic Designs', 'Hair Treatments'],
    bio: 'Creative stylist passionate about modern trends and artistic hair designs. Always staying ahead of the latest styles.',
    rating: 4.7,
    totalReviews: 89,
    isActive: true,
    isVerified: true,
    registrationStatus: 'approved',
    social: {
      instagram: 'https://instagram.com/sarahstylist',
      twitter: 'https://twitter.com/sarahstylist'
    },
    availability: {
      monday: { start: '10:00', end: '18:00', available: true },
      tuesday: { start: '10:00', end: '18:00', available: true },
      wednesday: { start: '10:00', end: '18:00', available: true },
      thursday: { start: '10:00', end: '18:00', available: true },
      friday: { start: '10:00', end: '19:00', available: true },
      saturday: { start: '09:00', end: '17:00', available: true },
      sunday: { start: '11:00', end: '15:00', available: false }
    }
  },
  {
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@elitebarbershop.com',
    phone: '+1234567893',
    address: '321 Trim Street, City, State 12345',
    password: 'barber123',
    role: 'barber',
    title: 'Fade Specialist',
    experience: 6,
    specialties: ['Fade Cuts', 'Edge-ups', 'Precision Cuts', 'Youth Styles'],
    bio: 'Fade specialist with 6 years of experience. Known for precision cuts and attention to detail.',
    rating: 4.8,
    totalReviews: 156,
    isActive: true,
    isVerified: true,
    registrationStatus: 'approved',
    availability: {
      monday: { start: '08:00', end: '16:00', available: true },
      tuesday: { start: '08:00', end: '16:00', available: true },
      wednesday: { start: '08:00', end: '16:00', available: true },
      thursday: { start: '08:00', end: '16:00', available: true },
      friday: { start: '08:00', end: '17:00', available: true },
      saturday: { start: '07:00', end: '15:00', available: true },
      sunday: { start: '09:00', end: '13:00', available: false }
    }
  },
  {
    firstName: 'Lisa',
    lastName: 'Davis',
    email: 'lisa.davis@elitebarbershop.com',
    phone: '+1234567894',
    address: '654 Shave Boulevard, City, State 12345',
    password: 'barber123',
    role: 'barber',
    title: 'Traditional Barber',
    experience: 12,
    specialties: ['Traditional Cuts', 'Straight Razor', 'Hot Towel', 'Beard Sculpting'],
    bio: 'Traditional barber with 12 years of experience. Expert in classic techniques and straight razor shaves.',
    rating: 4.9,
    totalReviews: 203,
    isActive: true,
    isVerified: true,
    registrationStatus: 'approved',
    social: {
      facebook: 'https://facebook.com/lisadavisbarber',
      linkedin: 'https://linkedin.com/in/lisadavisbarber'
    },
    availability: {
      monday: { start: '09:00', end: '17:00', available: true },
      tuesday: { start: '09:00', end: '17:00', available: true },
      wednesday: { start: '09:00', end: '17:00', available: true },
      thursday: { start: '09:00', end: '17:00', available: true },
      friday: { start: '09:00', end: '18:00', available: true },
      saturday: { start: '08:00', end: '16:00', available: true },
      sunday: { start: '10:00', end: '14:00', available: false }
    }
  },
  {
    firstName: 'John',
    lastName: 'Customer',
    email: 'john.customer@example.com',
    phone: '+1234567895',
    address: '999 Customer Road, City, State 12345',
    password: 'customer123',
    role: 'customer',
    isActive: true,
    isVerified: true
  }
];

const services = [
  {
    name: 'Classic Haircut',
    description: 'Traditional haircut with scissors and clipper work. Includes wash and style.',
    price: 25,
    duration: 30,
    category: 'Haircuts',
    popularity: 150,
    tags: ['classic', 'traditional', 'scissors', 'clipper'],
    requirements: ['Clean hair preferred'],
    aftercare: ['Avoid washing for 24 hours', 'Use recommended styling products']
  },
  {
    name: 'Fade Cut',
    description: 'Modern fade haircut with precise blending. Choose from low, mid, or high fade.',
    price: 30,
    duration: 40,
    category: 'Haircuts',
    popularity: 200,
    tags: ['fade', 'modern', 'precision', 'trendy'],
    requirements: ['Consultation for fade type'],
    aftercare: ['Regular touch-ups recommended every 2-3 weeks']
  },
  {
    name: 'Beard Trim',
    description: 'Professional beard trimming and shaping to complement your face shape.',
    price: 15,
    duration: 20,
    category: 'Beard Services',
    popularity: 120,
    tags: ['beard', 'trim', 'shape', 'grooming'],
    requirements: ['Minimum 1 week beard growth'],
    aftercare: ['Use beard oil daily', 'Regular maintenance every 2 weeks']
  },
  {
    name: 'Hot Towel Shave',
    description: 'Traditional hot towel shave with straight razor for the ultimate grooming experience.',
    price: 35,
    duration: 45,
    category: 'Specialty Services',
    popularity: 80,
    tags: ['hot towel', 'straight razor', 'traditional', 'luxury'],
    requirements: ['24-hour beard growth minimum'],
    aftercare: ['Avoid sun exposure for 2 hours', 'Apply aftershave balm']
  },
  {
    name: 'Hair Wash & Style',
    description: 'Professional hair wash with premium products and styling.',
    price: 20,
    duration: 25,
    category: 'Hair Treatments',
    popularity: 90,
    tags: ['wash', 'style', 'treatment', 'premium'],
    requirements: ['None'],
    aftercare: ['Style will last 2-3 days with proper care']
  },
  {
    name: 'Premium Package',
    description: 'Complete grooming package including haircut, beard trim, hot towel treatment, and styling.',
    price: 60,
    duration: 75,
    category: 'Packages',
    popularity: 110,
    tags: ['premium', 'complete', 'package', 'luxury'],
    requirements: ['Allow extra time for full service'],
    aftercare: ['Follow individual service aftercare instructions']
  },
  {
    name: 'Kids Haircut',
    description: 'Gentle haircut service designed specifically for children under 12.',
    price: 20,
    duration: 25,
    category: 'Haircuts',
    popularity: 70,
    tags: ['kids', 'children', 'gentle', 'fun'],
    requirements: ['Parent/guardian must be present'],
    aftercare: ['Regular trims every 4-6 weeks recommended']
  },
  {
    name: 'Scalp Treatment',
    description: 'Therapeutic scalp treatment to promote healthy hair growth and relaxation.',
    price: 40,
    duration: 50,
    category: 'Hair Treatments',
    popularity: 60,
    tags: ['scalp', 'treatment', 'therapeutic', 'relaxation'],
    requirements: ['Clean hair required'],
    aftercare: ['Avoid washing hair for 12 hours', 'Use recommended products']
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Service.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Hash passwords for users
    const salt = await bcrypt.genSalt(12);
    for (let user of users) {
      user.password = await bcrypt.hash(user.password, salt);
    }

    // Insert users
    const createdUsers = await User.insertMany(users);
    console.log(`👥 Created ${createdUsers.length} users`);

    // Insert services
    const createdServices = await Service.insertMany(services);
    console.log(`🛠️  Created ${createdServices.length} services`);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Default accounts created:');
    console.log('Admin: admin@elitebarbershop.com / admin123');
    console.log('Barber: mike.johnson@elitebarbershop.com / barber123');
    console.log('Customer: john.customer@example.com / customer123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
