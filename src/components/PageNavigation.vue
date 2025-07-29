<template>
  <div class="floating-navigation">
    <button @click="goBack" class="floating-btn back-btn">
      <i class="fas fa-arrow-left"></i>
      <span class="btn-text">Back</span>
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  // Check if there's history to go back to
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    // Fallback to home if no history
    router.push('/')
  }
}


</script>

<style scoped>
.floating-navigation {
  position: fixed;
  top: 2rem;
  left: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 999;
}

.floating-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 12px;
  background: rgba(44, 44, 44, 0.95);
  color: #f4e4bc;
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.9rem;
  font-weight: 600;
  backdrop-filter: blur(15px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  width: 48px;
  height: 48px;
  justify-content: center;
  overflow: hidden;
  white-space: nowrap;
}

.floating-btn i {
  font-size: 1.1rem;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.btn-text {
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.85rem;
  margin-left: 0.5rem;
}

.floating-btn:hover {
  width: auto;
  min-width: 120px;
  padding: 12px 20px 12px 16px;
  background: rgba(212, 175, 55, 0.95);
  color: #2c2c2c;
  border-color: #d4af37;
  box-shadow: 0 8px 30px rgba(212, 175, 55, 0.4);
  transform: translateX(5px);
}

.floating-btn:hover .btn-text {
  opacity: 1;
  transform: translateX(0);
}

.floating-btn:hover i {
  transform: scale(1.1);
}

.back-btn {
  background: rgba(52, 152, 219, 0.95);
  border-color: rgba(52, 152, 219, 0.5);
}

.back-btn:hover {
  background: rgba(52, 152, 219, 0.95);
  border-color: #3498db;
  box-shadow: 0 8px 30px rgba(52, 152, 219, 0.4);
  transform: translateX(-5px);
}



/* Animation for smooth expansion */
@keyframes expandButton {
  from {
    width: 48px;
  }
  to {
    width: 120px;
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .floating-navigation {
    top: 1rem;
    left: 1rem;
    gap: 0.25rem;
  }

  .floating-btn {
    width: 44px;
    height: 44px;
    padding: 10px;
  }

  .floating-btn:hover {
    min-width: 100px;
    padding: 10px 16px 10px 12px;
  }

  .floating-btn i {
    font-size: 1rem;
  }

  .btn-text {
    font-size: 0.8rem;
  }
}

/* Tablet */
@media (max-width: 1024px) and (min-width: 769px) {
  .floating-navigation {
    top: 1.5rem;
    left: 1.5rem;
  }

  .floating-btn:hover {
    min-width: 110px;
  }
}

/* Ensure buttons don't interfere with navigation */
.floating-navigation {
  pointer-events: auto;
}

.floating-btn {
  pointer-events: auto;
}

/* Add subtle pulse animation for better visibility */
@keyframes subtlePulse {
  0%, 100% {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }
  50% {
    box-shadow: 0 4px 25px rgba(0, 0, 0, 0.4);
  }
}

.floating-btn {
  animation: subtlePulse 3s ease-in-out infinite;
}

.floating-btn:hover {
  animation: none;
}
</style>
