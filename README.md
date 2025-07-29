# 💈 Elite Barber Shop

A comprehensive barber shop management system with customer booking, stylist management, payment processing, and administrative features.

![Elite Barber Shop](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D)
![Node.js](https://img.shields.io/badge/Node.js-16+-339933)
![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-47A248)

## 🌟 Features

### 🔐 Authentication & Authorization
- Multi-role user system (customers, barbers, admins)
- JWT-based authentication with refresh tokens
- Admin approval system for barbers
- Password reset and email verification

### 📅 Advanced Booking System
- Service selection and booking flow
- Stylist selection with detailed profiles
- Recurring appointments (daily, weekly, monthly)
- Group bookings and waitlist functionality
- Real-time availability checking

### 💳 Payment Processing
- Stripe payment integration
- Payment history and refund management
- Multiple payment methods support
- Secure webhook handling

### 👥 User Management
- Customer dashboard with booking history
- Barber dashboard with appointment management
- Admin dashboard with system oversight
- Profile and portfolio management

### 🔔 Notification System
- Email notifications for all booking events
- In-app notification center
- Automated reminders and confirmations
- Bulk notification system for admins

### ⭐ Review & Rating System
- Customer reviews with 1-5 star ratings
- Review filtering, sorting, and moderation
- Stylist response capabilities
- Rating analytics and insights

### 📱 Mobile-Responsive Design
- Fully responsive across all devices
- Touch-friendly interfaces
- Progressive Web App capabilities
- Dark theme implementation

### 🚀 Performance Features
- Multi-layer caching (Redis + Memory)
- Database query optimization
- Image optimization and lazy loading
- Virtual scrolling for large datasets

## 🛠️ Tech Stack

### Frontend
- **Vue.js 3** - Progressive JavaScript framework
- **Vue Router** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Modern styling with responsive design

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Stripe** - Payment processing
- **Nodemailer** - Email service
- **Sharp** - Image processing

### DevOps & Deployment
- **Render** - Cloud hosting platform
- **MongoDB Atlas** - Cloud database
- **GitHub** - Version control
- **Jest** - Testing framework

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB 4.4+
- Stripe account for payments

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/elite-barber-shop.git
cd elite-barber-shop
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

3. **Environment setup**
Create `.env` file in the backend directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/barber-shop
JWT_SECRET=your-super-secret-jwt-key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

4. **Start the application**
```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from root directory)
cd ../
npm run serve
```

The application will be available at:
- Frontend: http://localhost:8080
- Backend API: http://localhost:5000

## 📁 Project Structure

```
elite-barber-shop/
├── src/                    # Frontend Vue.js application
│   ├── components/         # Reusable Vue components
│   ├── views/             # Page components
│   ├── router/            # Vue Router configuration
│   ├── services/          # API services
│   ├── utils/             # Utility functions
│   └── assets/            # Static assets
├── backend/               # Backend Node.js application
│   ├── controllers/       # API controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   ├── tests/            # Test suites
│   └── uploads/          # File storage
├── public/               # Static files
└── docs/                 # Documentation
```

## 🧪 Testing

Run the test suite:
```bash
cd backend
npm test
```

Test coverage includes:
- Authentication endpoints
- Booking system integration
- Payment processing
- API validation

## 🚀 Deployment

### Deploy to Render

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Render**
- Go to [Render Dashboard](https://dashboard.render.com)
- Connect your GitHub repository
- Render will automatically detect the `render.yaml` configuration

3. **Environment Variables**
Set the following environment variables in Render:
- `STRIPE_SECRET_KEY`
- `EMAIL_USER`
- `EMAIL_PASS`
- Other sensitive configuration

### Manual Deployment

For other platforms, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Password reset

### Booking Endpoints
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user bookings
- `PUT /api/bookings/:id/confirm` - Confirm booking
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Payment Endpoints
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/webhook` - Stripe webhook
- `GET /api/payments/history` - Payment history

For complete API documentation, see [APPLICATION_STATUS.md](APPLICATION_STATUS.md)

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS protection
- XSS protection
- File upload security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for deployment help
- Review [APPLICATION_STATUS.md](APPLICATION_STATUS.md) for feature details
- Open an issue for bug reports or feature requests

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Multi-location support
- [ ] Integration with calendar systems
- [ ] SMS notifications
- [ ] Loyalty program features

---

**Elite Barber Shop** - Professional barber shop management made simple.

Built with ❤️ using Vue.js and Node.js
