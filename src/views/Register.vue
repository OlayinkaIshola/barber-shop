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
                  placeholder="Create a strong password (min 8 characters)"
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

// Available specialties based on existing stylists
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
  return registrationForm.value.firstName &&
         registrationForm.value.lastName &&
         registrationForm.value.email &&
         registrationForm.value.phone &&
         registrationForm.value.address &&
         registrationForm.value.title &&
         registrationForm.value.experience &&
         registrationForm.value.specialties.length > 0 &&
         registrationForm.value.bio &&
         registrationForm.value.password &&
         registrationForm.value.confirmPassword &&
         passwordsMatch.value &&
         registrationForm.value.agreeToTerms
})

// Validate passwords
const validatePasswords = () => {
  passwordError.value = ''
  confirmPasswordError.value = ''

  if (registrationForm.value.password && registrationForm.value.password.length < 8) {
    passwordError.value = 'Password must be at least 8 characters long'
  }

  if (registrationForm.value.confirmPassword && !passwordsMatch.value) {
    confirmPasswordError.value = 'Passwords do not match (case sensitive)'
  }
}

// Methods
const submitRegistration = () => {
  if (!isFormValid.value) {
    alert('Please fill in all required fields and ensure passwords match.')
    return
  }

  // Here you would typically send the registration data to your backend
  const registrationData = {
    ...registrationForm.value,
    fullName: `${registrationForm.value.firstName} ${registrationForm.value.lastName}`,
    registrationDate: new Date().toISOString(),
    status: 'pending' // Pending approval
  }

  console.log('Registration submitted:', registrationData)

  // Navigate to registration success page
  router.push('/registration-success')
}

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.register {
  min-height: 100vh;
  background: linear-gradient(135deg, #f4e4bc 0%, #f0d49c 100%);
  padding: 2rem 0;
}

.register-container {
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(44, 44, 44, 0.15);
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

.input-with-icon input,
.input-with-icon select,
.input-with-icon textarea {
  width: 100%;
  padding: 12px 15px 12px 45px;
  border: 2px solid rgba(212, 175, 55, 0.2);
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.input-with-icon input:focus,
.input-with-icon select:focus,
.input-with-icon textarea:focus {
  outline: none;
  border-color: #d4af37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
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
