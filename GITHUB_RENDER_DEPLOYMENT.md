# 🚀 GitHub & Render Deployment Guide

This guide will walk you through deploying the Elite Barber Shop application to GitHub and hosting it on Render.

## 📋 Prerequisites

Before starting, make sure you have:
- [x] Git installed on your computer
- [x] A GitHub account
- [x] A Render account (free tier available)
- [x] Stripe account for payment processing
- [x] Gmail account for email notifications

## 🔧 Step 1: Prepare for Deployment

### 1.1 Check Git Status
```bash
git status
```

### 1.2 Add All Files to Git
```bash
git add .
```

### 1.3 Commit Changes
```bash
git commit -m "Complete Elite Barber Shop application with all features"
```

## 📤 Step 2: Push to GitHub

### 2.1 Create GitHub Repository
1. Go to [GitHub](https://github.com)
2. Click "New repository"
3. Name it `elite-barber-shop`
4. Make it public (or private if you prefer)
5. Don't initialize with README (we already have one)
6. Click "Create repository"

### 2.2 Add Remote Origin
```bash
git remote add origin https://github.com/YOUR_USERNAME/elite-barber-shop.git
```
*Replace `YOUR_USERNAME` with your actual GitHub username*

### 2.3 Push to GitHub
```bash
git branch -M main
git push -u origin main
```

## 🌐 Step 3: Deploy to Render

### 3.1 Create Render Account
1. Go to [Render](https://render.com)
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### 3.2 Create Database Service
1. In Render Dashboard, click "New +"
2. Select "PostgreSQL" (we'll use MongoDB Atlas instead)
3. Actually, skip this - we'll use MongoDB Atlas

### 3.3 Set Up MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free account
3. Create a new cluster (free tier)
4. Create a database user
5. Whitelist all IP addresses (0.0.0.0/0) for Render
6. Get your connection string

### 3.4 Deploy Backend API
1. In Render Dashboard, click "New +"
2. Select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `elite-barber-shop-api`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

### 3.5 Set Environment Variables for Backend
In the Render dashboard for your API service, add these environment variables:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/barber_shop
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRE=30d
BCRYPT_ROUNDS=12
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=Elite Barber Shop <noreply@elitebarbershop.com>
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

**Important Notes:**
- Replace `your-email@gmail.com` with your actual Gmail address
- Replace `your-gmail-app-password` with an App Password from Gmail
- Replace Stripe keys with your actual keys
- Generate a strong JWT secret (32+ characters)

### 3.6 Deploy Frontend
1. In Render Dashboard, click "New +"
2. Select "Static Site"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `elite-barber-shop-web`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

### 3.7 Set Environment Variables for Frontend
Add this environment variable:
```env
VUE_APP_API_URL=https://elite-barber-shop-api.onrender.com
```
*Replace with your actual API URL from Render*

## 🔑 Step 4: Configure External Services

### 4.1 Gmail App Password
1. Go to Google Account settings
2. Enable 2-factor authentication
3. Generate an App Password for "Mail"
4. Use this password in the `EMAIL_PASS` environment variable

### 4.2 Stripe Configuration
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your API keys from the Developers section
3. Set up webhooks pointing to: `https://your-api-url.onrender.com/api/payments/webhook`
4. Add webhook events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### 4.3 MongoDB Atlas Setup
1. Create a database named `barber_shop`
2. Create collections (they'll be created automatically)
3. Set up database user with read/write permissions
4. Configure network access to allow all IPs (0.0.0.0/0)

## 🧪 Step 5: Test Deployment

### 5.1 Check API Health
Visit: `https://your-api-url.onrender.com/api/health`

### 5.2 Check Frontend
Visit: `https://your-frontend-url.onrender.com`

### 5.3 Test Registration
1. Try registering a new user
2. Check if email notifications work
3. Test the admin approval process

### 5.4 Test Booking Flow
1. Register as a customer
2. Browse services and stylists
3. Make a test booking
4. Test payment processing (use Stripe test cards)

## 🔧 Step 6: Troubleshooting

### Common Issues:

#### 6.1 Build Failures
- Check build logs in Render dashboard
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

#### 6.2 Database Connection Issues
- Verify MongoDB Atlas connection string
- Check network access settings
- Ensure database user has correct permissions

#### 6.3 Email Not Working
- Verify Gmail App Password
- Check spam folder
- Ensure 2FA is enabled on Gmail

#### 6.4 Payment Issues
- Verify Stripe API keys
- Check webhook configuration
- Test with Stripe test cards first

#### 6.5 CORS Errors
- Ensure frontend URL is in CORS whitelist
- Check API URL in frontend environment variables

### Debug Commands:
```bash
# Check logs in Render dashboard
# Or connect via SSH if available

# Test API endpoints
curl https://your-api-url.onrender.com/api/health

# Test database connection
# Check Render logs for MongoDB connection status
```

## 🎯 Step 7: Post-Deployment Setup

### 7.1 Create Admin User
1. Register a user through the frontend
2. Manually update the user in MongoDB to set role as 'admin'
3. Or use the admin seeding script if available

### 7.2 Add Initial Data
1. Create services through admin dashboard
2. Add barber/stylist profiles
3. Configure business settings

### 7.3 Test All Features
- [ ] User registration and login
- [ ] Admin approval system
- [ ] Service booking flow
- [ ] Payment processing
- [ ] Email notifications
- [ ] File uploads
- [ ] Review system

## 🔒 Step 8: Security Checklist

- [ ] Environment variables are set correctly
- [ ] Database access is restricted
- [ ] HTTPS is enabled (automatic on Render)
- [ ] API keys are secure
- [ ] CORS is properly configured
- [ ] Rate limiting is active

## 📊 Step 9: Monitoring

### 9.1 Render Monitoring
- Check service health in Render dashboard
- Monitor resource usage
- Set up alerts for downtime

### 9.2 Application Monitoring
- Monitor API response times
- Check error logs regularly
- Monitor database performance

## 🎉 Deployment Complete!

Your Elite Barber Shop application is now live! 

**URLs:**
- Frontend: `https://your-frontend-url.onrender.com`
- API: `https://your-api-url.onrender.com`

## 📞 Support

If you encounter issues:
1. Check Render service logs
2. Verify environment variables
3. Test API endpoints individually
4. Check external service configurations

## 🔄 Future Updates

To deploy updates:
```bash
git add .
git commit -m "Update description"
git push origin main
```

Render will automatically redeploy when you push to GitHub!

---

**Congratulations! Your Elite Barber Shop is now live and ready for customers! 🎊**
