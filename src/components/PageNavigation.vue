<template>
  <div class="page-navigation">
    <button @click="goBack" class="nav-btn back-btn">
      <i class="fas fa-arrow-left"></i>
      <span>Back</span>
    </button>
    <button @click="goHome" class="nav-btn home-btn">
      <i class="fas fa-home"></i>
      <span>Home</span>
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

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.page-navigation {
  position: fixed;
  top: 50%;
  left: 2rem;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 999;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 12px 16px;
  background: rgba(44, 44, 44, 0.9);
  color: #f4e4bc;
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  min-width: 100px;
  justify-content: center;
}

.nav-btn:hover {
  background: rgba(212, 175, 55, 0.9);
  color: #2c2c2c;
  border-color: #d4af37;
  transform: translateX(5px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.3);
}

.nav-btn i {
  font-size: 1rem;
}

.back-btn:hover {
  transform: translateX(-5px);
}

.home-btn {
  background: rgba(212, 175, 55, 0.9);
  color: #2c2c2c;
  border-color: #d4af37;
}

.home-btn:hover {
  background: rgba(44, 44, 44, 0.9);
  color: #f4e4bc;
  border-color: rgba(212, 175, 55, 0.3);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .page-navigation {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    top: auto;
    transform: translateX(-50%);
    flex-direction: row;
    gap: 1rem;
  }

  .nav-btn {
    min-width: 80px;
    padding: 10px 14px;
    font-size: 0.8rem;
  }

  .nav-btn span {
    display: none;
  }

  .nav-btn i {
    font-size: 1.1rem;
  }

  .back-btn:hover,
  .nav-btn:hover {
    transform: translateY(-3px);
  }
}

/* Tablet */
@media (max-width: 1024px) and (min-width: 769px) {
  .page-navigation {
    left: 1rem;
  }

  .nav-btn {
    min-width: 90px;
    padding: 10px 14px;
  }
}
</style>
