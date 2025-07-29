<template>
  <div class="registration-success">
    <div class="success-container">
      <div class="success-animation">
        <div class="checkmark-circle">
          <div class="checkmark"></div>
        </div>
      </div>
      
      <div class="success-content">
        <h1>Registration Successful!</h1>
        <p class="welcome-message">Welcome to Elite Barber Shop Team!</p>
        
        <div class="success-details">
          <div class="detail-item">
            <i class="fas fa-user-check"></i>
            <span>Your application has been submitted</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-clock"></i>
            <span>We'll review your profile within 24 hours</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-envelope"></i>
            <span>Check your email for confirmation</span>
          </div>
        </div>

        <div class="countdown-section">
          <p>Redirecting to login page in</p>
          <div class="countdown-circle">
            <span class="countdown-number">{{ countdown }}</span>
          </div>
          <p class="countdown-text">seconds</p>
        </div>

        <div class="action-buttons">
          <button @click="goToLogin" class="login-btn">
            <i class="fas fa-sign-in-alt"></i>
            Go to Login Now
          </button>
          <button @click="goToHome" class="home-btn">
            <i class="fas fa-home"></i>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const countdown = ref(3)
let countdownInterval = null

const goToLogin = () => {
  router.push('/login')
}

const goToHome = () => {
  router.push('/')
}

onMounted(() => {
  // Start countdown
  countdownInterval = setInterval(() => {
    countdown.value--
    
    if (countdown.value <= 0) {
      clearInterval(countdownInterval)
      goToLogin()
    }
  }, 1000)
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>

<style scoped>
.registration-success {
  min-height: 100vh;
  background: linear-gradient(135deg, #f4e4bc 0%, #f0d49c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.success-container {
  max-width: 600px;
  width: 100%;
  background: white;
  border-radius: 25px;
  box-shadow: 0 20px 40px rgba(44, 44, 44, 0.15);
  overflow: hidden;
  border: 3px solid rgba(212, 175, 55, 0.3);
  position: relative;
  text-align: center;
  padding: 3rem 2rem;
}

.success-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, #d4af37, #f4e4bc, #d4af37);
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

.success-animation {
  margin-bottom: 2rem;
}

.checkmark-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  margin: 0 auto;
  position: relative;
  animation: scaleIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 10px 30px rgba(39, 174, 96, 0.3);
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.checkmark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 60px;
  border: solid white;
  border-width: 0 6px 6px 0;
  transform: translate(-50%, -60%) rotate(45deg);
  animation: checkmarkDraw 0.4s ease-in-out 0.6s both;
}

@keyframes checkmarkDraw {
  0% {
    height: 0;
    width: 0;
    opacity: 0;
  }
  50% {
    height: 0;
    width: 30px;
    opacity: 1;
  }
  100% {
    height: 60px;
    width: 30px;
    opacity: 1;
  }
}

.success-content h1 {
  color: #2c2c2c;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
  animation: fadeInUp 0.8s ease-out 0.3s both;
}

.welcome-message {
  color: #d4af37;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 2rem;
  animation: fadeInUp 0.8s ease-out 0.5s both;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-details {
  margin-bottom: 2.5rem;
  animation: fadeInUp 0.8s ease-out 0.7s both;
}

.detail-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(244, 228, 188, 0.2);
  border-radius: 15px;
  border: 1px solid rgba(212, 175, 55, 0.2);
  color: #2c2c2c;
  font-weight: 500;
}

.detail-item i {
  color: #d4af37;
  font-size: 1.2rem;
  width: 20px;
  text-align: center;
}

.countdown-section {
  margin-bottom: 2.5rem;
  animation: fadeInUp 0.8s ease-out 0.9s both;
}

.countdown-section p {
  color: #5a5a5a;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.countdown-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3);
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.countdown-number {
  font-size: 2rem;
  font-weight: bold;
  color: #2c2c2c;
}

.countdown-text {
  color: #5a5a5a;
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  animation: fadeInUp 0.8s ease-out 1.1s both;
}

.login-btn,
.home-btn {
  padding: 12px 24px;
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

.login-btn {
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%);
  color: #2c2c2c;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.4);
}

.home-btn {
  background: transparent;
  color: #5a5a5a;
  border: 2px solid rgba(90, 90, 90, 0.3);
}

.home-btn:hover {
  background: rgba(90, 90, 90, 0.1);
  transform: translateY(-2px);
  border-color: #5a5a5a;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .registration-success {
    padding: 1rem;
  }

  .success-container {
    padding: 2rem 1rem;
  }

  .success-content h1 {
    font-size: 2rem;
  }

  .welcome-message {
    font-size: 1.1rem;
  }

  .checkmark-circle {
    width: 100px;
    height: 100px;
  }

  .checkmark {
    width: 25px;
    height: 50px;
    border-width: 0 5px 5px 0;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .login-btn,
  .home-btn {
    width: 100%;
    justify-content: center;
    max-width: 250px;
  }

  .detail-item {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
}
</style>
