# Elite Barber Shop Backend API

A comprehensive Node.js backend application for the Elite Barber Shop Vue.js frontend, providing authentication, booking management, and business operations.

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Customer, Barber, Admin)
- Password reset functionality
- Email verification
- Secure password hashing with bcrypt

### Booking Management
- Create, read, update, delete bookings
- Real-time availability checking
- Booking status management
- Email confirmations
- Review and rating system

### User Management
- User registration and profile management
- Barber application and approval system
- Profile image uploads
- User statistics and analytics

### Services & Stylists
- Service catalog management
- Stylist profiles and availability
- Search and filtering capabilities
- Popularity tracking

### Security Features
- Rate limiting
- Input validation and sanitization
- XSS protection
- NoSQL injection prevention
- CORS configuration
- Helmet security headers

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/elite-barber-shop
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=Elite Barber Shop <noreply@elitebarbershop.com>
   FRONTEND_URL=http://localhost:8080
   ```

4. **Create required directories**
   ```bash
   mkdir -p uploads/profiles
   ```

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St, City, State 12345",
  "password": "password123",
  "confirmPassword": "password123",
  "agreeToTerms": true
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### Booking Endpoints

#### Create Booking
```http
POST /bookings
Content-Type: application/json

{
  "customerInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "location": "123 Main St",
    "gender": "male",
    "age": 30
  },
  "service": "service_id",
  "stylist": "stylist_id",
  "date": "2024-01-15",
  "time": "14:30",
  "notes": "Optional notes"
}
```

#### Get Stylist Bookings
```http
GET /bookings/stylist/my-bookings?status=upcoming&date=2024-01-15
Authorization: Bearer <barber_token>
```

#### Check Availability
```http
GET /bookings/availability?stylistId=<id>&date=2024-01-15&time=14:30&duration=30
```

### Service Endpoints

#### Get All Services
```http
GET /services?category=Haircuts&sort=price
```

#### Get Service by ID
```http
GET /services/:id
```

### Stylist Endpoints

#### Get All Stylists
```http
GET /stylists?experience=5&specialties=Fade Cuts,Modern Styles
```

#### Get Stylist Availability
```http
GET /stylists/:id/availability?date=2024-01-15
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

### User Roles

- **Customer**: Can create bookings, view their bookings, add reviews
- **Barber**: Can manage their bookings, update availability, view stats
- **Admin**: Full access to all endpoints, user management, service management

## 📧 Email Configuration

The application uses Nodemailer for sending emails. Configure your email service in the `.env` file:

### Gmail Configuration
1. Enable 2-factor authentication
2. Generate an app password
3. Use the app password in `EMAIL_PASS`

### Other Email Services
Update `EMAIL_HOST`, `EMAIL_PORT`, and authentication details accordingly.

## 🗄️ Database Schema

### User Model
- Personal information (name, email, phone, address)
- Authentication (password, tokens)
- Role-based fields (barber-specific data)
- Availability schedule (for barbers)

### Booking Model
- Customer information
- Service and stylist references
- Date/time scheduling
- Payment information
- Review and rating

### Service Model
- Service details (name, description, price, duration)
- Category and tags
- Popularity tracking

## 🛡️ Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Validation**: Express-validator for request validation
- **Data Sanitization**: Prevents NoSQL injection and XSS
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for Express
- **Password Hashing**: bcrypt with configurable salt rounds

## 📊 Monitoring & Logging

- Morgan HTTP request logging
- Error handling middleware
- Health check endpoint (`/api/health`)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-production-secret
FRONTEND_URL=https://your-frontend-domain.com
```

### PM2 Deployment
```bash
npm install -g pm2
pm2 start server.js --name "elite-barber-api"
pm2 startup
pm2 save
```

## 📝 Default Accounts

After running the seed script, these accounts are available:

- **Admin**: admin@elitebarbershop.com / admin123
- **Barber**: mike.johnson@elitebarbershop.com / barber123
- **Customer**: john.customer@example.com / customer123

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.
