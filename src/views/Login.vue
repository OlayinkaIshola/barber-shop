<template>
  <div class="login">
    <PageNavigation />
    <div class="login-container">
      <div class="login-header">
        <h1>Welcome Back</h1>
        <p>Sign in to your Elite Barber Shop account</p>
        <div class="header-decoration">
          <div class="decoration-line"></div>
          <div class="decoration-diamond">✂️</div>
          <div class="decoration-line"></div>
        </div>
      </div>

      <div class="login-content">
        <form @submit.prevent="submitLogin" class="login-form">
          <div class="form-group">
            <label for="email">Email Address</label>
            <div class="input-with-icon">
              <i class="fas fa-envelope input-icon"></i>
              <input
                type="email"
                id="email"
                v-model="loginForm.email"
                required
                placeholder="Enter your email address"
                :class="{ 'error': emailError }"
              />
            </div>
            <div v-if="emailError" class="error-message">{{ emailError }}</div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-with-icon">
              <i class="fas fa-lock input-icon"></i>
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="loginForm.password"
                required
                placeholder="Enter your password"
                :class="{ 'error': passwordError }"
              />
              <button
                type="button"
                @click="togglePassword"
                class="password-toggle"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
          </div>

          <div class="form-options">
            <label class="remember-me">
              <input
                type="checkbox"
                v-model="loginForm.rememberMe"
              />
              <span class="checkmark"></span>
              Remember me
            </label>
            <router-link to="/forgot-password" class="forgot-password">
              Forgot password?
            </router-link>
          </div>

          <button type="submit" class="login-btn" :disabled="isLoading">
            <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-sign-in-alt"></i>
            <span>{{ isLoading ? 'Signing in...' : 'Sign In' }}</span>
          </button>

          <div v-if="loginError" class="login-error">
            <i class="fas fa-exclamation-triangle"></i>
            {{ loginError }}
          </div>
        </form>

        <div class="login-divider">
          <span>or</span>
        </div>

        <div class="register-prompt">
          <p>Don't have an account?</p>
          <router-link to="/register" class="register-link">
            <i class="fas fa-user-plus"></i>
            Register as Barber
          </router-link>
        </div>

        <div class="customer-note">
          <p><i class="fas fa-info-circle"></i> Customers can book directly without an account</p>
          <router-link to="/services" class="book-service-link">
            <i class="fas fa-cut"></i>
            Book a Service
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PageNavigation from '@/components/PageNavigation.vue'
import { authAPI, handleApiError } from '../services/api.js'

const router = useRouter()

// Form data
const loginForm = ref({
  email: '',
  password: '',
  rememberMe: false
})

// State
const isLoading = ref(false)
const showPassword = ref(false)
const loginError = ref('')
const emailError = ref('')
const passwordError = ref('')

// Methods
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const validateForm = () => {
  emailError.value = ''
  passwordError.value = ''
  loginError.value = ''

  let isValid = true

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!loginForm.value.email) {
    emailError.value = 'Email is required'
    isValid = false
  } else if (!emailRegex.test(loginForm.value.email)) {
    emailError.value = 'Please enter a valid email address'
    isValid = false
  }

  // Password validation
  if (!loginForm.value.password) {
    passwordError.value = 'Password is required'
    isValid = false
  } else if (loginForm.value.password.length < 8) {
    passwordError.value = 'Password must be at least 8 characters'
    isValid = false
  }

  return isValid
}

const submitLogin = async () => {
  console.log('🔄 Login form submitted')

  if (!validateForm()) {
    console.log('❌ Form validation failed')
    return
  }

  console.log('✅ Form validation passed')
  isLoading.value = true
  loginError.value = ''

  try {
    // Prepare login data
    const loginData = {
      email: loginForm.value.email,
      password: loginForm.value.password
    }

    console.log('Login attempt:', loginData)

    // Submit to backend API
    const response = await authAPI.login(loginData)

    console.log('Login successful:', response)

    // Store authentication data
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.data))
    localStorage.setItem('isLoggedIn', 'true')

    // Show success message
    alert(`Welcome back, ${response.data.fullName}!

Login successful. You are now signed in to your Elite Barber Shop account.`)

    // Navigate based on user role
    if (response.data.role === 'admin') {
      router.push('/admin-dashboard') // Admin goes to admin dashboard
    } else if (response.data.role === 'barber') {
      router.push('/employee-dashboard') // Barber goes to employee dashboard
    } else {
      router.push('/') // Customer goes to home page
    }

  } catch (error) {
    console.error('Login error:', error)
    console.error('Error details:', {
      message: error.message,
      response: error.response,
      request: error.request,
      config: error.config
    })

    let errorMessage = 'Login failed. Please check your credentials and try again.'

    // Handle different error response formats
    if (error && error.response) {
      // Axios error response
      const responseData = error.response.data
      if (responseData && responseData.error) {
        errorMessage = responseData.error
      } else if (responseData && responseData.message) {
        errorMessage = responseData.message
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

    loginError.value = errorMessage
    alert(`Login Failed!\n\n${errorMessage}`)
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.push('/')
}

// Test function to bypass form validation
const testLogin = async () => {
  console.log('🧪 Testing login with hardcoded credentials')

  try {
    const testData = {
      email: 'admin@elitebarbershop.com',
      password: 'admin123'
    }

    console.log('🔄 Making API call with:', testData)
    const response = await authAPI.login(testData)
    console.log('✅ API response:', response)

    alert('Test login successful!')

  } catch (error) {
    console.error('❌ Test login failed:', error)
    alert('Test login failed: ' + (error.message || error))
  }
}

// Expose test function to window for browser console testing
if (typeof window !== 'undefined') {
  window.testLogin = testLogin
}
</script>

<style scoped>
.login {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-container {
  max-width: 500px;
  width: 100%;
  background: linear-gradient(135deg, #2c2c2c 0%, #3a3a3a 100%);
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  border: 3px solid rgba(212, 175, 55, 0.2);
  position: relative;
}

.login-container::before {
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

.login-header {
  background: linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%);
  color: #f4e4bc;
  padding: 3rem 2rem 2rem;
  text-align: center;
}

.login-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #d4af37;
}

.login-header p {
  font-size: 1.1rem;
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

.login-content {
  padding: 3rem 2rem;
}

.login-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
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

.input-with-icon input {
  width: 100%;
  padding: 12px 15px 12px 45px;
  border: 2px solid rgba(212, 175, 55, 0.2);
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  color: #f4e4bc;
}

.input-with-icon input:focus {
  outline: none;
  border-color: #d4af37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
  background: rgba(255, 255, 255, 0.2);
}

.input-with-icon input.error {
  border-color: #e74c3c;
}

.password-toggle {
  position: absolute;
  right: 15px;
  background: none;
  border: none;
  color: #d4af37;
  cursor: pointer;
  font-size: 1rem;
  z-index: 2;
}

.password-toggle:hover {
  color: #b8941f;
}

.error-message {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #5a5a5a;
}

.remember-me input[type="checkbox"] {
  display: none;
}

.remember-me .checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
}

.remember-me input[type="checkbox"]:checked + .checkmark {
  background: #d4af37;
  border-color: #d4af37;
}

.remember-me input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 10px;
}

.forgot-password {
  color: #d4af37;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
}

.forgot-password:hover {
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%);
  color: #2c2c2c;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.4);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-error {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 8px;
  color: #e74c3c;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.login-divider {
  text-align: center;
  margin: 2rem 0;
  position: relative;
}

.login-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(212, 175, 55, 0.2);
}

.login-divider span {
  background: white;
  padding: 0 1rem;
  color: #5a5a5a;
  font-size: 0.9rem;
}

.register-prompt {
  text-align: center;
  margin-bottom: 2rem;
}

.register-prompt p {
  color: #5a5a5a;
  margin-bottom: 1rem;
}

.register-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #d4af37;
  text-decoration: none;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border: 2px solid #d4af37;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.register-link:hover {
  background: #d4af37;
  color: white;
  transform: translateY(-2px);
}

.customer-note {
  text-align: center;
  padding: 1.5rem;
  background: rgba(244, 228, 188, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.customer-note p {
  color: #5a5a5a;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.book-service-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #2c2c2c;
  text-decoration: none;
  font-weight: 600;
  padding: 0.5rem 1rem;
  background: rgba(212, 175, 55, 0.2);
  border-radius: 15px;
  transition: all 0.3s ease;
}

.book-service-link:hover {
  background: rgba(212, 175, 55, 0.3);
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .login {
    padding: 1rem;
  }

  .login-header {
    padding: 2rem 1rem 1.5rem;
  }

  .login-header h1 {
    font-size: 2rem;
  }

  .login-content {
    padding: 2rem 1rem;
  }

  .form-options {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>
