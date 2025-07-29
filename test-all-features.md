# Complete Application Testing Guide

## Current Status
✅ **Backend**: Running on http://localhost:5000
✅ **Frontend**: Running on http://localhost:8084
✅ **Database**: Seeded with sample data
✅ **CORS**: Configured for port 8084

## Fixed Issues
1. **Rate Limiting**: Increased auth rate limit from 5 to 50 requests per 15 minutes
2. **Registration Validation**: Fixed to allow both customer and barber registration
3. **Error Handling**: Improved error messages for all forms
4. **Form Validation**: Made barber fields optional for customer registration

## Test Scenarios

### 1. Test Customer Registration
**URL**: http://localhost:8084 → Click "Register as Barber" in navigation

**Fill Required Fields Only (Customer Registration)**:
- First Name: John
- Last Name: Customer
- Email: john.test@example.com
- Phone: +1234567890
- Address: 123 Test Street
- Password: testpass123
- Confirm Password: testpass123
- ✅ Check "I agree to terms"

**Expected**: Should register successfully as customer (no barber fields required)

### 2. Test Barber Registration
**Fill All Fields (Barber Registration)**:
- First Name: Jane
- Last Name: Barber
- Email: jane.barber@example.com
- Phone: +1234567891
- Address: 456 Barber Lane
- Password: barber123
- Confirm Password: barber123
- Title: Senior Barber
- Experience: 5
- Specialties: Select at least one
- Bio: Experienced barber...
- ✅ Check "I agree to terms"

**Expected**: Should register successfully as barber

### 3. Test Login
**URL**: http://localhost:8084/login

**Test with existing account**:
- Email: mike.johnson@elitebarbershop.com
- Password: barber123

**Expected**: Should login and redirect to employee dashboard

**Test with new customer account**:
- Email: john.test@example.com
- Password: testpass123

**Expected**: Should login and redirect to home page

### 4. Test Booking Flow
**URL**: http://localhost:8084/services

1. **Select a Service**: Click on any service
2. **Select Stylist**: Choose a stylist (optional)
3. **Fill Booking Form**:
   - Full Name: Test Customer
   - Email: test@example.com
   - Phone: +1234567890
   - Location: Test City
   - Gender: Male/Female
   - Age: 25
   - Date: Select future date
   - Time: Select available time
   - Notes: Optional

**Expected**: Should create booking and redirect to payment

### 5. Test Payment Flow
**After successful booking**:

1. **Payment Form**: Fill credit card details (simulation)
2. **Process Payment**: Click "Process Payment"

**Expected**: Should show success message and redirect to success page

## Available Test Accounts
- **Admin**: admin@elitebarbershop.com / admin123
- **Barber**: mike.johnson@elitebarbershop.com / barber123
- **Customer**: john.customer@example.com / customer123

## API Endpoints Working
- ✅ `POST /api/auth/register` - User registration
- ✅ `POST /api/auth/login` - User login
- ✅ `GET /api/services` - Get services
- ✅ `GET /api/stylists` - Get stylists
- ✅ `POST /api/bookings` - Create booking

## Troubleshooting

### If Login Fails:
1. Check browser console for errors
2. Verify backend is running on port 5000
3. Check if rate limit is exceeded (wait 15 minutes)

### If Registration Fails:
1. Ensure all required fields are filled
2. Check password matching (case-sensitive)
3. Verify email format is valid

### If Booking Fails:
1. Ensure service and stylist are selected
2. Check all required fields are filled
3. Verify date/time selection

### If Payment Fails:
1. Check if booking data is passed correctly
2. Verify payment form validation

## Next Steps
After testing, all features should work:
- ✅ User registration (customer and barber)
- ✅ User login with proper redirects
- ✅ Service browsing and selection
- ✅ Booking creation with validation
- ✅ Payment processing (simulated)
- ✅ Success confirmations
