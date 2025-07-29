<template>
  <div id="app">
    <nav
      v-if="showNavigation"
      class="navbar"
      :class="{ 'nav-hidden': !showNavigation }"
      :style="{ background: dynamicNavBackground }"
    >
      <div class="nav-left">
        <button v-if="showBackButton" @click="goBack" class="back-nav-btn">
          <i class="fas fa-arrow-left"></i>
        </button>
        <div class="nav-brand">
          <h2>✂️ Elite Barber Shop</h2>
        </div>
      </div>
      <div class="nav-links">
        <router-link to="/">Home</router-link>
        <router-link to="/services">Services</router-link>
        <router-link to="/stylists">Our Team</router-link>
        <router-link v-if="isLoggedIn" to="/employee-dashboard" class="dashboard-link">Dashboard</router-link>
        <router-link v-if="!isLoggedIn" to="/register" class="register-link">Register as Barber</router-link>
        <router-link v-if="!isLoggedIn" to="/login" class="login-link">Login</router-link>
        <button v-if="isLoggedIn" @click="logout" class="logout-btn">Logout</button>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const dynamicNavBackground = ref('linear-gradient(180deg, rgba(44, 44, 44, 0.95) 0%, rgba(44, 44, 44, 0.8) 70%, transparent 100%)')
const isLoggedIn = ref(false)

// Pages where navigation should be hidden
const hiddenNavPages = ['/booking', '/payment', '/payment-success', '/register', '/registration-success', '/login', '/forgot-password']

// Check login status
const checkLoginStatus = () => {
  isLoggedIn.value = localStorage.getItem('isLoggedIn') === 'true'
}

// Logout function
const logout = () => {
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('userEmail')
  isLoggedIn.value = false
  router.push('/')
}

const showNavigation = computed(() => {
  return !hiddenNavPages.includes(route.path)
})

const showBackButton = computed(() => {
  return showNavigation.value && route.path !== '/'
})

// Navigation methods
const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

let observer = null

onMounted(() => {
  // Check login status on app load
  checkLoginStatus()

  // Only set up intersection observer on pages that show navigation
  if (showNavigation.value) {
    setupIntersectionObserver()
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

const setupIntersectionObserver = () => {
  // Define section colors based on typical page sections
  const sectionColors = {
    'hero': 'linear-gradient(135deg, rgba(44, 44, 44, 0.95) 0%, rgba(26, 26, 26, 0.9) 100%)',
    'features': 'linear-gradient(180deg, rgba(244, 228, 188, 0.95) 0%, rgba(240, 212, 156, 0.9) 100%)',
    'stats': 'linear-gradient(135deg, rgba(44, 44, 44, 0.95) 0%, rgba(26, 26, 26, 0.9) 100%)',
    'gallery': 'linear-gradient(180deg, rgba(244, 228, 188, 0.95) 0%, rgba(240, 212, 156, 0.9) 100%)',
    'cta-section': 'linear-gradient(135deg, rgba(44, 44, 44, 0.95) 0%, rgba(26, 26, 26, 0.9) 100%)',
    'services': 'linear-gradient(180deg, rgba(244, 228, 188, 0.95) 0%, rgba(240, 212, 156, 0.9) 100%)',
    'stylists': 'linear-gradient(180deg, rgba(244, 228, 188, 0.95) 0%, rgba(240, 212, 156, 0.9) 100%)'
  }

  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionClass = entry.target.className
        let newBackground = dynamicNavBackground.value

        // Check which section is intersecting and set appropriate color
        for (const [section, color] of Object.entries(sectionColors)) {
          if (sectionClass.includes(section)) {
            newBackground = color
            break
          }
        }

        dynamicNavBackground.value = newBackground
      }
    })
  }, {
    threshold: 0.3,
    rootMargin: '-80px 0px -80px 0px'
  })

  // Observe sections after a short delay to ensure DOM is ready
  setTimeout(() => {
    const sections = document.querySelectorAll('section, .hero, .features, .stats, .gallery, .cta-section, .services, .stylists')
    sections.forEach(section => {
      if (section) {
        observer.observe(section)
      }
    })
  }, 100)
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}



.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 3rem;
  color: #f4e4bc;
  backdrop-filter: blur(15px);
  transition: all 0.5s ease;
  transform: translateY(0);
  opacity: 1;
}

.navbar.nav-hidden {
  transform: translateY(-100%);
  opacity: 0;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-nav-btn {
  background: rgba(212, 175, 55, 0.2);
  color: #f4e4bc;
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.back-nav-btn:hover {
  background: rgba(212, 175, 55, 0.9);
  color: #2c2c2c;
  border-color: #d4af37;
  transform: translateX(-3px);
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
}

.nav-brand h2 {
  color: #d4af37;
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-links a {
  color: #f4e4bc;
  text-decoration: none;
  margin-left: 2rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%);
  color: #2c2c2c;
  transform: translateY(-2px);
}

.nav-links .register-link {
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%);
  color: #2c2c2c;
  font-weight: 600;
  border: 2px solid #d4af37;
}

.nav-links .register-link:hover {
  background: linear-gradient(135deg, #f4e4bc 0%, #d4af37 100%);
  transform: translateY(-2px) scale(1.05);
}

.nav-links .login-link {
  border: 2px solid #f4e4bc;
  background: transparent;
}

.nav-links .login-link:hover {
  background: rgba(244, 228, 188, 0.1);
  border-color: #d4af37;
}

.nav-links .dashboard-link {
  background: linear-gradient(135deg, #3498db 0%, #5dade2 100%);
  color: white;
  font-weight: 600;
  border: 2px solid #3498db;
}

.nav-links .dashboard-link:hover {
  background: linear-gradient(135deg, #5dade2 0%, #3498db 100%);
  transform: translateY(-2px) scale(1.05);
}

.logout-btn {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border: 2px solid rgba(231, 76, 60, 0.3);
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
}

.logout-btn:hover {
  background: rgba(231, 76, 60, 0.2);
  border-color: #e74c3c;
  transform: translateY(-2px);
}
</style>