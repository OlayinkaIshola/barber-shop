const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');

describe('Booking Endpoints', () => {
  let customerToken, barberToken, adminToken;
  let customerId, barberId, serviceId;

  beforeAll(async () => {
    // Create test users
    const customerData = {
      firstName: 'John',
      lastName: 'Customer',
      email: 'customer@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      phone: '+1234567890',
      role: 'customer'
    };

    const barberData = {
      firstName: 'Jane',
      lastName: 'Barber',
      email: 'barber@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      phone: '+1234567891',
      role: 'barber',
      isApproved: true
    };

    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      phone: '+1234567892',
      role: 'admin'
    };

    // Register users
    const customerResponse = await request(app)
      .post('/api/auth/register')
      .send(customerData);
    customerToken = customerResponse.body.data.token;
    customerId = customerResponse.body.data.user.id;

    const barberResponse = await request(app)
      .post('/api/auth/register')
      .send(barberData);
    barberToken = barberResponse.body.data.token;
    barberId = barberResponse.body.data.user.id;

    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send(adminData);
    adminToken = adminResponse.body.data.token;

    // Create test service
    const service = new Service({
      name: 'Haircut',
      description: 'Professional haircut',
      price: 25,
      duration: 30,
      category: 'Hair'
    });
    await service.save();
    serviceId = service._id;
  });

  beforeEach(async () => {
    await Booking.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Service.deleteMany({});
    await Booking.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/bookings', () => {
    it('should create a new booking successfully', async () => {
      const bookingData = {
        customerInfo: {
          name: 'John Customer',
          email: 'customer@example.com',
          phone: '+1234567890',
          location: '123 Main St, City, State',
          gender: 'male',
          age: 30
        },
        service: serviceId,
        stylist: barberId,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        time: '10:00',
        notes: 'Please be gentle'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.customerInfo.name).toBe(bookingData.customerInfo.name);
      expect(response.body.data.service).toBe(serviceId.toString());
      expect(response.body.data.stylist).toBe(barberId.toString());
      expect(response.body.data.status).toBe('pending');
    });

    it('should not create booking with invalid service', async () => {
      const bookingData = {
        customerInfo: {
          name: 'John Customer',
          email: 'customer@example.com',
          phone: '+1234567890',
          location: '123 Main St, City, State',
          gender: 'male',
          age: 30
        },
        service: new mongoose.Types.ObjectId(),
        stylist: barberId,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        time: '10:00'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Service not found');
    });

    it('should not create booking with past date', async () => {
      const bookingData = {
        customerInfo: {
          name: 'John Customer',
          email: 'customer@example.com',
          phone: '+1234567890',
          location: '123 Main St, City, State',
          gender: 'male',
          age: 30
        },
        service: serviceId,
        stylist: barberId,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        time: '10:00'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('past');
    });

    it('should not create booking with invalid email', async () => {
      const bookingData = {
        customerInfo: {
          name: 'John Customer',
          email: 'invalid-email',
          phone: '+1234567890',
          location: '123 Main St, City, State',
          gender: 'male',
          age: 30
        },
        service: serviceId,
        stylist: barberId,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        time: '10:00'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/bookings/my-bookings', () => {
    beforeEach(async () => {
      // Create test bookings
      const booking1 = new Booking({
        customer: customerId,
        service: serviceId,
        stylist: barberId,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        time: '10:00',
        customerInfo: {
          name: 'John Customer',
          email: 'customer@example.com',
          phone: '+1234567890',
          location: '123 Main St',
          gender: 'male',
          age: 30
        },
        status: 'confirmed'
      });

      const booking2 = new Booking({
        customer: customerId,
        service: serviceId,
        stylist: barberId,
        date: new Date(Date.now() + 48 * 60 * 60 * 1000),
        time: '14:00',
        customerInfo: {
          name: 'John Customer',
          email: 'customer@example.com',
          phone: '+1234567890',
          location: '123 Main St',
          gender: 'male',
          age: 30
        },
        status: 'pending'
      });

      await booking1.save();
      await booking2.save();
    });

    it('should get customer bookings with authentication', async () => {
      const response = await request(app)
        .get('/api/bookings/my-bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.total).toBe(2);
    });

    it('should filter bookings by status', async () => {
      const response = await request(app)
        .get('/api/bookings/my-bookings?status=confirmed')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('confirmed');
    });

    it('should not get bookings without authentication', async () => {
      const response = await request(app)
        .get('/api/bookings/my-bookings')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Not authorized');
    });
  });

  describe('PUT /api/bookings/:id/confirm', () => {
    let bookingId;

    beforeEach(async () => {
      const booking = new Booking({
        customer: customerId,
        service: serviceId,
        stylist: barberId,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        time: '10:00',
        customerInfo: {
          name: 'John Customer',
          email: 'customer@example.com',
          phone: '+1234567890',
          location: '123 Main St',
          gender: 'male',
          age: 30
        },
        status: 'pending'
      });
      await booking.save();
      bookingId = booking._id;
    });

    it('should confirm booking as barber', async () => {
      const response = await request(app)
        .put(`/api/bookings/${bookingId}/confirm`)
        .set('Authorization', `Bearer ${barberToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('confirmed');
    });

    it('should not confirm booking as customer', async () => {
      const response = await request(app)
        .put(`/api/bookings/${bookingId}/confirm`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Not authorized');
    });

    it('should not confirm non-existent booking', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/bookings/${fakeId}/confirm`)
        .set('Authorization', `Bearer ${barberToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Booking not found');
    });
  });

  describe('PUT /api/bookings/:id/cancel', () => {
    let bookingId;

    beforeEach(async () => {
      const booking = new Booking({
        customer: customerId,
        service: serviceId,
        stylist: barberId,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        time: '10:00',
        customerInfo: {
          name: 'John Customer',
          email: 'customer@example.com',
          phone: '+1234567890',
          location: '123 Main St',
          gender: 'male',
          age: 30
        },
        status: 'confirmed'
      });
      await booking.save();
      bookingId = booking._id;
    });

    it('should cancel booking as customer', async () => {
      const response = await request(app)
        .put(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ reason: 'Schedule conflict' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('cancelled');
    });

    it('should cancel booking as barber', async () => {
      const response = await request(app)
        .put(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${barberToken}`)
        .send({ reason: 'Emergency' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('cancelled');
    });

    it('should not cancel booking without authentication', async () => {
      const response = await request(app)
        .put(`/api/bookings/${bookingId}/cancel`)
        .send({ reason: 'Schedule conflict' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/bookings/:id/review', () => {
    let bookingId;

    beforeEach(async () => {
      const booking = new Booking({
        customer: customerId,
        service: serviceId,
        stylist: barberId,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        time: '10:00',
        customerInfo: {
          name: 'John Customer',
          email: 'customer@example.com',
          phone: '+1234567890',
          location: '123 Main St',
          gender: 'male',
          age: 30
        },
        status: 'completed'
      });
      await booking.save();
      bookingId = booking._id;
    });

    it('should add review to completed booking', async () => {
      const reviewData = {
        rating: 5,
        comment: 'Excellent service!'
      };

      const response = await request(app)
        .put(`/api/bookings/${bookingId}/review`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send(reviewData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.review.rating).toBe(5);
      expect(response.body.data.review.comment).toBe('Excellent service!');
    });

    it('should not add review with invalid rating', async () => {
      const reviewData = {
        rating: 6, // Invalid rating
        comment: 'Great service!'
      };

      const response = await request(app)
        .put(`/api/bookings/${bookingId}/review`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send(reviewData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not add review to non-completed booking', async () => {
      // Update booking to pending status
      await Booking.findByIdAndUpdate(bookingId, { status: 'pending' });

      const reviewData = {
        rating: 5,
        comment: 'Great service!'
      };

      const response = await request(app)
        .put(`/api/bookings/${bookingId}/review`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send(reviewData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('completed');
    });
  });
});
