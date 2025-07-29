// Simple API test script to verify backend functionality
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing Elite Barber Shop API...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health Check:', health.data.message);

    // Test 2: Get Services
    console.log('\n2. Testing Services Endpoint...');
    const services = await axios.get(`${API_BASE}/services`);
    console.log(`✅ Services: Found ${services.data.count} services`);
    if (services.data.count > 0) {
      console.log(`   - First service: ${services.data.data[0].name} ($${services.data.data[0].price})`);
    }

    // Test 3: Get Stylists
    console.log('\n3. Testing Stylists Endpoint...');
    const stylists = await axios.get(`${API_BASE}/stylists`);
    console.log(`✅ Stylists: Found ${stylists.data.count} stylists`);
    if (stylists.data.count > 0) {
      console.log(`   - First stylist: ${stylists.data.data[0].fullName} (${stylists.data.data[0].title})`);
    }

    // Test 4: Login Test
    console.log('\n4. Testing Authentication...');
    const loginData = {
      email: 'mike.johnson@elitebarbershop.com',
      password: 'barber123'
    };
    
    const login = await axios.post(`${API_BASE}/auth/login`, loginData);
    console.log('✅ Login successful for:', login.data.data.fullName);
    console.log('   - Role:', login.data.data.role);
    console.log('   - Token received:', login.data.token ? 'Yes' : 'No');

    // Test 5: Protected Route (using token)
    console.log('\n5. Testing Protected Route...');
    const token = login.data.token;
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    
    const profile = await axios.get(`${API_BASE}/auth/me`, config);
    console.log('✅ Profile access successful for:', profile.data.data.fullName);

    // Test 6: Booking Creation (sample)
    console.log('\n6. Testing Booking Creation...');
    const bookingData = {
      customerInfo: {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '+1234567890',
        location: '123 Test Street',
        gender: 'male',
        age: 30
      },
      service: services.data.data[0]._id,
      stylist: stylists.data.data[0]._id,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
      time: '14:30',
      notes: 'Test booking from API test'
    };

    const booking = await axios.post(`${API_BASE}/bookings`, bookingData);
    console.log('✅ Booking created successfully');
    console.log(`   - Confirmation Code: ${booking.data.data.confirmationCode}`);
    console.log(`   - Service: ${booking.data.data.serviceSnapshot.name}`);
    console.log(`   - Stylist: ${booking.data.data.stylistSnapshot.name}`);

    console.log('\n🎉 All API tests passed successfully!');
    console.log('\n📋 Test Accounts Available:');
    console.log('   Admin: admin@elitebarbershop.com / admin123');
    console.log('   Barber: mike.johnson@elitebarbershop.com / barber123');
    console.log('   Customer: john.customer@example.com / customer123');

  } catch (error) {
    console.error('❌ API Test Failed:', error.response?.data || error.message);
    if (error.response?.data?.details) {
      console.error('   Details:', error.response.data.details);
    }
  }
}

// Run the test
testAPI();
