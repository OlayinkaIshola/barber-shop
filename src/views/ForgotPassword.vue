<template>
  <div class="forgot-password">
    <PageNavigation />
    <div class="forgot-password-container">
      <div class="forgot-password-header">
        <h1>Reset Password</h1>
        <p>Enter your email address and we'll send you a link to reset your password</p>
        <div class="header-decoration">
          <div class="decoration-line"></div>
          <div class="decoration-diamond">🔑</div>
          <div class="decoration-line"></div>
        </div>
      </div>

      <div class="forgot-password-content">
        <div v-if="!emailSent" class="reset-form">
          <form @submit.prevent="submitReset" class="form">
            <div class="form-group">
              <label for="email">Email Address</label>
              <div class="input-with-icon">
                <i class="fas fa-envelope input-icon"></i>
                <input
                  type="email"
                  id="email"
                  v-model="resetForm.email"
                  required
                  placeholder="Enter your registered email address"
                  :class="{ 'error': emailError }"
                />
              </div>
              <div v-if="emailError" class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                {{ emailError }}
              </div>
            </div>

            <button type="submit" class="reset-btn" :disabled="isLoading">
              <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-paper-plane"></i>
              <span>{{ isLoading ? 'Sending...' : 'Send Reset Link' }}</span>
            </button>

            <div v-if="resetError" class="reset-error">
              <i class="fas fa-exclamation-triangle"></i>
              {{ resetError }}
            </div>
          </form>

          <div class="help-text">
            <div class="help-item">
              <i class="fas fa-info-circle"></i>
              <div>
                <strong>Can't find your email?</strong>
                <p>Make sure you're using the email address you registered with.</p>
              </div>
            </div>
            <div class="help-item">
              <i class="fas fa-clock"></i>
              <div>
                <strong>Didn't receive the email?</strong>
                <p>Check your spam folder or wait a few minutes and try again.</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="success-message">
          <div class="success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h2>Reset Link Sent!</h2>
          <p>We've sent a password reset link to:</p>
          <div class="email-display">{{ resetForm.email }}</div>
          <div class="success-instructions">
            <div class="instruction-item">
              <i class="fas fa-envelope-open"></i>
              <span>Check your email inbox</span>
            </div>
            <div class="instruction-item">
              <i class="fas fa-mouse-pointer"></i>
              <span>Click the reset link in the email</span>
            </div>
            <div class="instruction-item">
              <i class="fas fa-key"></i>
              <span>Create your new password</span>
            </div>
          </div>
          <button @click="resendEmail" class="resend-btn" :disabled="resendCooldown > 0">
            <i class="fas fa-redo"></i>
            <span v-if="resendCooldown > 0">Resend in {{ resendCooldown }}s</span>
            <span v-else>Resend Email</span>
          </button>
        </div>

        <div class="back-to-login">
          <router-link to="/login" class="back-link">
            <i class="fas fa-arrow-left"></i>
            Back to Login
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import PageNavigation from '@/components/PageNavigation.vue'

const router = useRouter()

// Form data
const resetForm = ref({
  email: ''
})

// State
const isLoading = ref(false)
const emailSent = ref(false)
const resetError = ref('')
const emailError = ref('')
const resendCooldown = ref(0)

let resendTimer = null

// Methods
const validateEmail = () => {
  emailError.value = ''
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!resetForm.value.email) {
    emailError.value = 'Email is required'
    return false
  } else if (!emailRegex.test(resetForm.value.email)) {
    emailError.value = 'Please enter a valid email address'
    return false
  }
  
  return true
}

const submitReset = async () => {
  if (!validateEmail()) {
    return
  }

  isLoading.value = true
  resetError.value = ''

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Here you would typically send the reset request to your backend
    const resetData = {
      email: resetForm.value.email,
      requestTime: new Date().toISOString(),
      userAgent: navigator.userAgent
    }

    console.log('Password reset requested:', resetData)

    // Simulate successful reset request
    emailSent.value = true
    startResendCooldown()

  } catch (error) {
    resetError.value = 'An error occurred while sending the reset email. Please try again.'
    console.error('Reset error:', error)
  } finally {
    isLoading.value = false
  }
}

const resendEmail = async () => {
  if (resendCooldown.value > 0) return

  isLoading.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Password reset email resent to:', resetForm.value.email)
    
    startResendCooldown()
    
  } catch (error) {
    resetError.value = 'Failed to resend email. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const startResendCooldown = () => {
  resendCooldown.value = 60
  
  resendTimer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(resendTimer)
    }
  }, 1000)
}

// Cleanup
onUnmounted(() => {
  if (resendTimer) {
    clearInterval(resendTimer)
  }
})
</script>

<style scoped>
.forgot-password {
  min-height: 100vh;
  background: linear-gradient(135deg, #f4e4bc 0%, #f0d49c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.forgot-password-container {
  max-width: 500px;
  width: 100%;
  background: white;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(44, 44, 44, 0.15);
  overflow: hidden;
  border: 3px solid rgba(212, 175, 55, 0.2);
  position: relative;
}

.forgot-password-container::before {
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

.forgot-password-header {
  background: linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%);
  color: #f4e4bc;
  padding: 3rem 2rem 2rem;
  text-align: center;
}

.forgot-password-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #d4af37;
}

.forgot-password-header p {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 2rem;
  line-height: 1.5;
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

.forgot-password-content {
  padding: 3rem 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c2c2c;
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
  background: white;
}

.input-with-icon input:focus {
  outline: none;
  border-color: #d4af37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.input-with-icon input.error {
  border-color: #e74c3c;
}

.error-message {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.reset-btn,
.resend-btn {
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
  margin-bottom: 1.5rem;
}

.reset-btn:hover:not(:disabled),
.resend-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.4);
}

.reset-btn:disabled,
.resend-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.reset-error {
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

.help-text {
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(244, 228, 188, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.help-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.help-item:last-child {
  margin-bottom: 0;
}

.help-item i {
  color: #d4af37;
  font-size: 1.1rem;
  margin-top: 0.2rem;
  flex-shrink: 0;
}

.help-item strong {
  color: #2c2c2c;
  font-size: 0.9rem;
}

.help-item p {
  color: #5a5a5a;
  font-size: 0.85rem;
  margin: 0.25rem 0 0 0;
  line-height: 1.4;
}

.success-message {
  text-align: center;
}

.success-icon {
  font-size: 4rem;
  color: #27ae60;
  margin-bottom: 1rem;
}

.success-message h2 {
  color: #2c2c2c;
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.success-message p {
  color: #5a5a5a;
  margin-bottom: 1rem;
}

.email-display {
  background: rgba(212, 175, 55, 0.1);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  color: #2c2c2c;
  margin-bottom: 2rem;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.success-instructions {
  margin: 2rem 0;
  text-align: left;
}

.instruction-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(244, 228, 188, 0.1);
  border-radius: 8px;
}

.instruction-item i {
  color: #d4af37;
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.instruction-item span {
  color: #2c2c2c;
  font-weight: 500;
}

.back-to-login {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(212, 175, 55, 0.2);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #d4af37;
  text-decoration: none;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border: 2px solid transparent;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.back-link:hover {
  border-color: #d4af37;
  background: rgba(212, 175, 55, 0.1);
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .forgot-password {
    padding: 1rem;
  }

  .forgot-password-header {
    padding: 2rem 1rem 1.5rem;
  }

  .forgot-password-header h1 {
    font-size: 2rem;
  }

  .forgot-password-content {
    padding: 2rem 1rem;
  }

  .success-instructions {
    text-align: center;
  }
}
</style>
