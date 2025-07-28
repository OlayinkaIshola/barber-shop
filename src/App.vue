<template>
  <div id="app">
    <nav
      v-if="showNavigation"
      class="navbar"
      :class="{ 'nav-hidden': !showNavigation }"
      :style="{ background: dynamicNavBackground }"
    >
      <div class="nav-brand">
        <h2>✂️ Elite Barber Shop</h2>
      </div>
      <div class="nav-links">
        <router-link to="/">Home</router-link>
        <router-link to="/services">Services</router-link>
        <router-link to="/stylists">Our Team</router-link>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const dynamicNavBackground = ref('linear-gradient(180deg, rgba(44, 44, 44, 0.95) 0%, rgba(44, 44, 44, 0.8) 70%, transparent 100%)')

// Pages where navigation should be hidden
const hiddenNavPages = ['/booking', '/payment', '/payment-success']

const showNavigation = computed(() => {
  return !hiddenNavPages.includes(route.path)
})

let observer = null

onMounted(() => {
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
</style>