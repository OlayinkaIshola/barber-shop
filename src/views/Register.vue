<template>
  <div class="register">
    <PageNavigation />
    <div class="register-container">
      <div class="register-header">
        <h1>Join Our Elite Team</h1>
        <p>Register as a professional barber and showcase your skills</p>
        <div class="header-decoration">
          <div class="decoration-line"></div>
          <div class="decoration-diamond">✂️</div>
          <div class="decoration-line"></div>
        </div>
      </div>

      <form @submit.prevent="submitRegistration" class="register-form">
        <!-- Personal Information -->
        <div class="form-section">
          <h3><i class="fas fa-user"></i> Personal Information</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name *</label>
              <div class="input-with-icon">
                <i class="fas fa-user input-icon"></i>
                <input
                  type="text"
                  id="firstName"
                  v-model="registrationForm.firstName"
                  required
                  placeholder="Enter your first name"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="lastName">Last Name *</label>
              <div class="input-with-icon">
                <i class="fas fa-user input-icon"></i>
                <input
                  type="text"
                  id="lastName"
                  v-model="registrationForm.lastName"
                  required
                  placeholder="Enter your last name"
                />
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="email">Email Address *</label>
              <div class="input-with-icon">
                <i class="fas fa-envelope input-icon"></i>
                <input
                  type="email"
                  id="email"
                  v-model="registrationForm.email"
                  required
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="phone">Phone Number *</label>
              <div class="input-with-icon">
                <i class="fas fa-phone input-icon"></i>
                <input
                  type="tel"
                  id="phone"
                  v-model="registrationForm.phone"
                  required
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="address">Address *</label>
            <div class="input-with-icon">
              <i class="fas fa-map-marker-alt input-icon"></i>
              <input
                type="text"
                id="address"
                v-model="registrationForm.address"
                required
                placeholder="Enter your full address"
              />
            </div>
          </div>
        </div>

        <!-- Professional Information -->
        <div class="form-section">
          <h3><i class="fas fa-cut"></i> Professional Information</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="title">Professional Title *</label>
              <div class="input-with-icon">
                <i class="fas fa-id-badge input-icon"></i>
                <select id="title" v-model="registrationForm.title" required>
                  <option value="">Select your title</option>
                  <option value="Junior Barber">Junior Barber</option>
                  <option value="Senior Barber">Senior Barber</option>
                  <option value="Master Barber">Master Barber</option>
                  <option value="Fade Specialist">Fade Specialist</option>
                  <option value="Style Consultant">Style Consultant</option>
                  <option value="Creative Stylist">Creative Stylist</option>
                  <option value="Traditional Barber">Traditional Barber</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="experience">Years of Experience *</label>
              <div class="input-with-icon">
                <i class="fas fa-calendar-alt input-icon"></i>
                <input
                  type="number"
                  id="experience"
                  v-model="registrationForm.experience"
                  required
                  min="0"
                  max="50"
                  placeholder="Years of experience"
                />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="specialties">Specialties *</label>
            <div class="specialties-grid">
              <label v-for="specialty in availableSpecialties" :key="specialty" class="specialty-checkbox">
                <input
                  type="checkbox"
                  :value="specialty"
                  v-model="registrationForm.specialties"
                />
                <span class="checkmark"></span>
                {{ specialty }}
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="bio">Professional Bio *</label>
            <div class="input-with-icon">
              <i class="fas fa-file-alt input-icon"></i>
              <textarea
                id="bio"
                v-model="registrationForm.bio"
                required
                rows="4"
                placeholder="Tell us about your experience, skills, and what makes you unique as a barber..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Account Security -->
        <div class="form-section">
          <h3><i class="fas fa-lock"></i> Account Security</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="password">Password *</label>
              <div class="input-with-icon">
                <i class="fas fa-lock input-icon"></i>
                <input
                  type="password"
                  id="password"
                  v-model="registrationForm.password"
                  required
                  placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 number"
                  @blur="validatePasswords"
                  :class="{ 'error': passwordError }"
                />
              </div>
              <div v-if="passwordError" class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                {{ passwordError }}
              </div>
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirm Password *</label>
              <div class="input-with-icon">
                <i class="fas fa-lock input-icon"></i>
                <input
                  type="password"
                  id="confirmPassword"
                  v-model="registrationForm.confirmPassword"
                  required
                  placeholder="Confirm your password"
                  @blur="validatePasswords"
                  :class="{ 'error': confirmPasswordError }"
                />
              </div>
              <div v-if="confirmPasswordError" class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                {{ confirmPasswordError }}
              </div>
            </div>
          </div>
        </div>

        <!-- Social Media (Optional) -->
        <div class="form-section">
          <h3><i class="fas fa-share-alt"></i> Social Media (Optional)</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="instagram">Instagram</label>
              <div class="input-with-icon">
                <i class="fab fa-instagram input-icon"></i>
                <input
                  type="url"
                  id="instagram"
                  v-model="registrationForm.social.instagram"
                  placeholder="https://instagram.com/yourusername"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="facebook">Facebook</label>
              <div class="input-with-icon">
                <i class="fab fa-facebook-f input-icon"></i>
                <input
                  type="url"
                  id="facebook"
                  v-model="registrationForm.social.facebook"
                  placeholder="https://facebook.com/yourusername"
                />
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="twitter">Twitter</label>
              <div class="input-with-icon">
                <i class="fab fa-twitter input-icon"></i>
                <input
                  type="url"
                  id="twitter"
                  v-model="registrationForm.social.twitter"
                  placeholder="https://twitter.com/yourusername"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="linkedin">LinkedIn</label>
              <div class="input-with-icon">
                <i class="fab fa-linkedin-in input-icon"></i>
                <input
                  type="url"
                  id="linkedin"
                  v-model="registrationForm.social.linkedin"
                  placeholder="https://linkedin.com/in/yourusername"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Terms and Conditions -->
        <div class="form-section">
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="registrationForm.agreeToTerms"
                required
              />
              <span class="checkmark"></span>
              I agree to the <a href="#" class="terms-link">Terms and Conditions</a> and <a href="#" class="terms-link">Privacy Policy</a>
            </label>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="form-actions">
          <button type="button" @click="goBack" class="btn-secondary">
            <i class="fas fa-arrow-left"></i>
            Back to Home
          </button>
          <button type="submit" class="btn-primary" :disabled="!isFormValid">
            <i class="fas fa-user-plus"></i>
            Register as Barber
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import PageNavigation from '@/components/PageNavigation.vue'
import { authAPI, handleApiError } from '../services/api.js'

const router = useRouter()

// Registration form data
const registrationForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  title: '',
  experience: '',
  specialties: [],
  bio: '',
  password: '',
  confirmPassword: '',
  social: {
    instagram: '',
    facebook: '',
    twitter: '',
    linkedin: ''
  },
  agreeToTerms: false
})

// Available specialties for barbers (must match backend enum exactly)
const availableSpecialties = [
  'Classic Cuts',
  'Beard Styling',
  'Fade Cuts',
  'Modern Styles',
  'Edge-ups',
  'Traditional Cuts',
  'Straight Razor',
  'Hot Towel',
  'Creative Cuts',
  'Artistic Designs',
  'Youth Styles',
  'Precision Cuts',
  'Beard Sculpting',
  'Hair Treatments',
  'Consultations',
  'Premium Services',
  'Hair Care'
]

// Password validation
const passwordsMatch = computed(() => {
  return registrationForm.value.password === registrationForm.value.confirmPassword
})

const passwordError = ref('')
const confirmPasswordError = ref('')

// Form validation
const isFormValid = computed(() => {
  // Basic required fields for all users
  const basicFieldsValid = registrationForm.value.firstName &&
                          registrationForm.value.lastName &&
                          registrationForm.value.email &&
                          registrationForm.value.phone &&
                          registrationForm.value.address &&
                          registrationForm.value.password &&
                          registrationForm.value.confirmPassword &&
                          passwordsMatch.value &&
                          registrationForm.value.agreeToTerms

  // If user is registering as a barber (has filled barber fields), validate them
  const isBarberRegistration = registrationForm.value.title ||
                              registrationForm.value.experience ||
                              registrationForm.value.specialties.length > 0 ||
                              registrationForm.value.bio

  if (isBarberRegistration) {
    // For barber registration, require all barber fields
    return basicFieldsValid &&
           registrationForm.value.title &&
           registrationForm.value.experience &&
           registrationForm.value.specialties.length > 0 &&
           registrationForm.value.bio
  }

  // For customer registration, only basic fields required
  return basicFieldsValid
})

// Validate passwords
const validatePasswords = () => {
  passwordError.value = ''
  confirmPasswordError.value = ''

  if (registrationForm.value.password) {
    const password = registrationForm.value.password

    if (password.length < 8) {
      passwordError.value = 'Password must be at least 8 characters long'
    } else if (!/(?=.*[a-z])/.test(password)) {
      passwordError.value = 'Password must contain at least one lowercase letter'
    } else if (!/(?=.*[A-Z])/.test(password)) {
      passwordError.value = 'Password must contain at least one uppercase letter'
    } else if (!/(?=.*\d)/.test(password)) {
      passwordError.value = 'Password must contain at least one number'
    }
  }

  if (registrationForm.value.confirmPassword && !passwordsMatch.value) {
    confirmPasswordError.value = 'Passwords do not match (case sensitive)'
  }
}

// Methods
const submitRegistration = async () => {
  console.log('🔄 Registration form submitted')
  console.log('📋 Form data:', registrationForm.value)

  if (!isFormValid.value) {
    console.log('❌ Form validation failed')
    alert('Please fill in all required fields and ensure passwords match.')
    return
  }

  console.log('✅ Form validation passed')

  try {
    // Create registration data object
    const registrationData = {
      firstName: registrationForm.value.firstName,
      lastName: registrationForm.value.lastName,
      email: registrationForm.value.email,
      phone: registrationForm.value.phone,
      address: registrationForm.value.address,
      password: registrationForm.value.password,
      confirmPassword: registrationForm.value.confirmPassword,
      agreeToTerms: registrationForm.value.agreeToTerms
    }

    // Add barber-specific fields if provided
    if (registrationForm.value.title) {
      registrationData.title = registrationForm.value.title
      registrationData.experience = registrationForm.value.experience
      registrationData.specialties = registrationForm.value.specialties
      registrationData.bio = registrationForm.value.bio
      registrationData.social = {
        instagram: registrationForm.value.social.instagram,
        facebook: registrationForm.value.social.facebook,
        twitter: registrationForm.value.social.twitter,
        linkedin: registrationForm.value.social.linkedin
      }
    }

    console.log('Submitting registration:', registrationData)

    // Submit to backend API
    try {
      console.log('🔄 Making API call to register...')
      const response = await authAPI.register(registrationData)
      console.log('✅ Registration API response:', response)
      console.log('✅ Response type:', typeof response)
      console.log('✅ Response keys:', Object.keys(response || {}))

      // Show success message for normal registration
      alert(`Registration Successful!\n\nWelcome to Elite Barber Shop! ${registrationForm.value.title ? 'Your barber registration is pending admin approval.' : 'You can now log in to your account.'}`)

      // Navigate to registration success page
      router.push('/registration-success')
      return

    } catch (apiError) {
      // Check if this is actually a success with email issue
      if (apiError && apiError.response && apiError.response.data &&
          apiError.response.data.error &&
          apiError.response.data.error.includes('Email could not be sent, but account was created successfully')) {

        alert(`Registration Successful!\n\nYour account has been created successfully. ${registrationForm.value.title ? 'Your barber registration is pending admin approval.' : ''}\n\nNote: Confirmation email could not be sent, but your account is active.`)
        router.push('/registration-success')
        return
      }

      // If it's a real error, re-throw it to be handled by the outer catch
      throw apiError
    }

  } catch (error) {
    console.error('Registration error:', error)
    console.error('Error details:', {
      message: error.message,
      response: error.response,
      request: error.request
    })

    let errorMessage = 'Registration failed. Please try again.'

    // Handle different error response formats
    if (error && error.response) {
      // Axios error response
      const responseData = error.response.data
      if (responseData && responseData.error) {
        errorMessage = responseData.error
      } else if (responseData && responseData.message) {
        errorMessage = responseData.message
      } else if (responseData && responseData.errors) {
        // Handle validation errors array
        const validationErrors = responseData.errors.map(err => err.msg || err.message || err).join('\n')
        errorMessage = `Validation failed:\n${validationErrors}`
      } else {
        errorMessage = `Server error: ${error.response.status} ${error.response.statusText}`
      }
    } else if (error && error.request) {
      // Network error
      errorMessage = 'Network error. Please check your connection and try again.'
    } else if (error && typeof error === 'object') {
      if (error.error) {
        errorMessage = error.error
      } else if (error.message) {
        errorMessage = error.message
      } else if (error.data && error.data.error) {
        errorMessage = error.data.error
      }
    } else if (typeof error === 'string') {
      errorMessage = error
    }

    alert(`Registration Failed!\n\n${errorMessage}`)
  }
}

const goBack = () => {
  router.push('/')
}

// Test function for barber registration
const testBarberRegistration = async () => {
  console.log('🧪 Testing barber registration with hardcoded data')

  try {
    const testData = {
      firstName: 'Test',
      lastName: 'Barber',
      email: `test.barber.${Date.now()}@example.com`,
      phone: '5551234567',
      address: '123 Test Street, Test City, TS 12345',
      password: 'Password123',
      confirmPassword: 'Password123',
      agreeToTerms: true,
      title: 'Senior Barber',
      experience: 5,
      specialties: ['Classic Cuts', 'Beard Styling'],
      bio: 'Test barber with 5 years of experience',
      social: {
        instagram: '',
        facebook: '',
        twitter: '',
        linkedin: ''
      }
    }

    console.log('🔄 Making API call with:', testData)
    const response = await authAPI.register(testData)
    console.log('✅ API response:', response)

    alert('Test barber registration successful!')

  } catch (error) {
    console.error('❌ Test registration failed:', error)
    alert('Test registration failed: ' + (error.message || error))
  }
}

// Simple customer registration test
const testCustomerRegistration = async () => {
  console.log('🧪 Testing customer registration with hardcoded data')

  try {
    const testData = {
      firstName: 'Test',
      lastName: 'Customer',
      email: `test.customer.${Date.now()}@example.com`,
      phone: '5551234567',
      address: '123 Test Street, Test City, TS 12345',
      password: 'Password123',
      confirmPassword: 'Password123',
      agreeToTerms: true
    }

    console.log('🔄 Making API call with:', testData)
    const response = await authAPI.register(testData)
    console.log('✅ API response:', response)

    alert('Test customer registration successful!')

  } catch (error) {
    console.error('❌ Test registration failed:', error)
    alert('Test registration failed: ' + (error.message || error))
  }
}

// Debug function to check form state
const debugFormState = () => {
  console.log('🔍 Form Debug Info:')
  console.log('Form data:', registrationForm.value)
  console.log('Passwords match:', passwordsMatch.value)
  console.log('Form valid:', isFormValid.value)
  console.log('Password:', registrationForm.value.password)
  console.log('Confirm password:', registrationForm.value.confirmPassword)
  console.log('Agree to terms:', registrationForm.value.agreeToTerms)
}

// Test function for quick barber registration
const testQuickBarberRegistration = async () => {
  const randomId = Math.floor(Math.random() * 1000)
  const testBarber = {
    firstName: `Test`,
    lastName: `Barber${randomId}`,
    email: `testbarber${randomId}@example.com`,
    phone: `555-${String(randomId).padStart(4, '0')}`,
    address: `${randomId} Test Street, Test City`,
    password: 'testpass123',
    confirmPassword: 'testpass123',
    role: 'barber',
    title: 'Senior Barber',
    experience: Math.floor(Math.random() * 10) + 1,
    specialties: ['Classic Cuts', 'Beard Styling', 'Fade Cuts'],
    bio: `Test barber with ${Math.floor(Math.random() * 10) + 1} years of experience.`,
    social: {
      instagram: `https://instagram.com/testbarber${randomId}`,
      facebook: `https://facebook.com/testbarber${randomId}`,
      twitter: `https://twitter.com/testbarber${randomId}`,
      linkedin: `https://linkedin.com/in/testbarber${randomId}`
    }
  }

  try {
    const response = await authAPI.register(testBarber)
    console.log('✅ Test barber registered:', response)
    alert(`Test barber registered successfully!\nEmail: ${testBarber.email}\nPassword: testpass123\n\nYou can now approve this barber in the admin dashboard.`)
    return response
  } catch (error) {
    console.error('❌ Test barber registration failed:', error)
    alert('Test barber registration failed: ' + (error.response?.data?.error || error.message))
  }
}

// Expose test functions to window for browser console testing
if (typeof window !== 'undefined') {
  window.testBarberRegistration = testBarberRegistration
  window.testCustomerRegistration = testCustomerRegistration
  window.testQuickBarberRegistration = testQuickBarberRegistration
  window.debugFormState = debugFormState
}
</script>

<style scoped>
.register {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  padding: 2rem 0;
}

.register-container {
  max-width: 1000px;
  margin: 0 auto;
  background: linear-gradient(135deg, #2c2c2c 0%, #3a3a3a 100%);
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  border: 3px solid rgba(212, 175, 55, 0.2);
  position: relative;
}

.register-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #d4af37, #f4e4bc, #d4af37);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.register-header {
  background: linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%);
  color: #f4e4bc;
  padding: 3rem 2rem 2rem;
  text-align: center;
}

.register-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #d4af37;
}

.register-header p {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 2rem;
}

.header-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.decoration-line {
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #d4af37, transparent);
}

.decoration-diamond {
  font-size: 1.5rem;
  animation: pulse 2s infinite;
  color: #d4af37;
}

.register-form {
  padding: 3rem;
}

.form-section {
  margin-bottom: 3rem;
  padding: 2rem;
  background: rgba(244, 228, 188, 0.05);
  border-radius: 15px;
  border: 1px solid rgba(212, 175, 55, 0.1);
}

.form-section h3 {
  color: #2c2c2c;
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-section h3 i {
  color: #d4af37;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #f4e4bc;
  font-weight: 600;
  font-size: 0.95rem;
}

/* Input with Icon Styles */
.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 15px;
  color: #d4af37;
  font-size: 1rem;
  z-index: 2;
  pointer-events: none;
}

.input-with-icon input,
.input-with-icon select,
.input-with-icon textarea {
  width: 100%;
  padding: 12px 15px 12px 45px;
  border: 2px solid rgba(212, 175, 55, 0.2);
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  color: #f4e4bc;
}

.input-with-icon input:focus,
.input-with-icon select:focus,
.input-with-icon textarea:focus {
  outline: none;
  border-color: #d4af37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
  background: rgba(255, 255, 255, 0.2);
}

.input-with-icon input.error,
.input-with-icon select.error,
.input-with-icon textarea.error {
  border-color: #e74c3c;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

.error-message {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.input-with-icon textarea {
  resize: vertical;
  min-height: 100px;
}

/* Specialties Grid */
.specialties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
}

.specialty-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.specialty-checkbox:hover {
  background: rgba(212, 175, 55, 0.1);
}

.specialty-checkbox input[type="checkbox"] {
  display: none;
}

.specialty-checkbox .checkmark {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-radius: 6px;
  position: relative;
  transition: all 0.3s ease;
}

.specialty-checkbox input[type="checkbox"]:checked + .checkmark {
  background: #d4af37;
  border-color: #d4af37;
}

.specialty-checkbox input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 14px;
}

/* Checkbox Group */
.checkbox-group {
  margin: 1rem 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.95rem;
  color: #5a5a5a;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkbox-label .checkmark {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-radius: 6px;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark {
  background: #d4af37;
  border-color: #d4af37;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.terms-link {
  color: #d4af37;
  text-decoration: none;
  font-weight: 600;
}

.terms-link:hover {
  text-decoration: underline;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid rgba(212, 175, 55, 0.1);
}

.btn-primary,
.btn-secondary {
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%);
  color: #2c2c2c;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: transparent;
  color: #5a5a5a;
  border: 2px solid rgba(90, 90, 90, 0.3);
}

.btn-secondary:hover {
  background: rgba(90, 90, 90, 0.1);
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .register {
    padding: 1rem;
  }

  .register-header {
    padding: 2rem 1rem 1.5rem;
  }

  .register-header h1 {
    font-size: 2rem;
  }

  .register-form {
    padding: 2rem 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .specialties-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>
