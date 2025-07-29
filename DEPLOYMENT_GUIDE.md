# Elite Barber Shop - Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB 4.4+
- Redis (optional, for caching)
- Stripe account for payments

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd barber-shop

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../
npm install
```

### 2. Environment Configuration

Create `.env` file in the backend directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/barber-shop
DB_NAME=barber-shop

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d

# Email Configuration (using Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Elite Barber Shop <noreply@elitebarbershop.com>

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Redis Configuration (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### 3. Database Setup

```bash
# Start MongoDB service
# On Windows: net start MongoDB
# On macOS: brew services start mongodb-community
# On Linux: sudo systemctl start mongod

# The application will automatically create the database and collections
```

### 4. Start the Application

```bash
# Start backend server (from backend directory)
cd backend
npm run dev

# Start frontend development server (from root directory)
cd ../
npm run serve
```

The application will be available at:
- Frontend: http://localhost:8080
- Backend API: http://localhost:5000

## 🏭 Production Deployment

### 1. Build Frontend for Production

```bash
npm run build
```

### 2. Production Environment Variables

Update `.env` for production:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db-url/barber-shop
JWT_SECRET=your-production-jwt-secret
STRIPE_SECRET_KEY=sk_live_your_live_stripe_key
# ... other production values
```

### 3. Start Production Server

```bash
cd backend
npm start
```

### 4. Serve Frontend (using nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Serve frontend
    location / {
        root /path/to/barber-shop/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Serve uploaded files
    location /uploads/ {
        root /path/to/barber-shop/backend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🐳 Docker Deployment

### 1. Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

### 2. Frontend Dockerfile

```dockerfile
# Dockerfile
FROM node:16-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:4.4
    container_name: barber-shop-db
    restart: unless-stopped
    environment:
      MONGO_INITDB_DATABASE: barber-shop
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  redis:
    image: redis:6-alpine
    container_name: barber-shop-redis
    restart: unless-stopped
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    container_name: barber-shop-api
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/barber-shop
      - REDIS_HOST=redis
    depends_on:
      - mongodb
      - redis
    ports:
      - "5000:5000"
    volumes:
      - ./backend/uploads:/app/uploads

  frontend:
    build: .
    container_name: barber-shop-web
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

### 4. Run with Docker

```bash
docker-compose up -d
```

## ☁️ Cloud Deployment Options

### 1. Heroku Deployment

```bash
# Install Heroku CLI
# Create Heroku apps
heroku create your-app-name-api
heroku create your-app-name-web

# Set environment variables
heroku config:set NODE_ENV=production --app your-app-name-api
heroku config:set MONGODB_URI=your-mongodb-atlas-url --app your-app-name-api
# ... set other environment variables

# Deploy backend
git subtree push --prefix backend heroku-api main

# Deploy frontend
heroku config:set VUE_APP_API_URL=https://your-app-name-api.herokuapp.com --app your-app-name-web
git push heroku-web main
```

### 2. AWS Deployment

```bash
# Using AWS Elastic Beanstalk
eb init
eb create production
eb deploy
```

### 3. DigitalOcean App Platform

```yaml
# .do/app.yaml
name: barber-shop
services:
- name: api
  source_dir: backend
  github:
    repo: your-username/barber-shop
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: MONGODB_URI
    value: ${DATABASE_URL}

- name: web
  source_dir: /
  github:
    repo: your-username/barber-shop
    branch: main
  build_command: npm run build
  run_command: npx serve -s dist -l 8080
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs

databases:
- name: barber-shop-db
  engine: MONGODB
  version: "4.4"
```

## 🔧 Configuration Options

### Database Configuration
- **Development**: Local MongoDB instance
- **Production**: MongoDB Atlas or self-hosted
- **Testing**: MongoDB Memory Server

### Caching Configuration
- **Redis**: For production caching
- **Memory**: Fallback for development

### File Storage Options
- **Local**: Default file system storage
- **AWS S3**: For production file storage
- **Cloudinary**: For image optimization

### Email Service Options
- **Gmail**: For development
- **SendGrid**: For production
- **AWS SES**: Enterprise option

## 📊 Monitoring and Logging

### 1. Application Monitoring

```javascript
// Add to backend/server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 2. Performance Monitoring

```javascript
// Add performance monitoring
const newrelic = require('newrelic');
// or
const apm = require('elastic-apm-node').start();
```

### 3. Health Checks

The application includes health check endpoints:
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed system status

## 🔒 Security Checklist

- [ ] Update all default passwords
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Set secure headers
- [ ] Regular security updates
- [ ] Database access restrictions
- [ ] API key rotation
- [ ] Backup strategies

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MongoDB service status
   - Verify connection string
   - Check network connectivity

2. **Payment Processing Errors**
   - Verify Stripe API keys
   - Check webhook configuration
   - Validate SSL certificates

3. **File Upload Issues**
   - Check upload directory permissions
   - Verify file size limits
   - Check available disk space

4. **Email Delivery Problems**
   - Verify SMTP credentials
   - Check spam filters
   - Validate email templates

### Logs Location
- Application logs: `backend/logs/`
- Error logs: `backend/error.log`
- Access logs: `backend/access.log`

## 📞 Support

For deployment support and troubleshooting:
1. Check the logs for error messages
2. Verify all environment variables
3. Test database connectivity
4. Validate API endpoints
5. Check frontend build process

---

## 🎉 Deployment Complete!

Your Elite Barber Shop application is now ready for production use with all features fully functional and optimized for performance.
