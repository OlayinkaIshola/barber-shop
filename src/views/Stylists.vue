<template>
  <div class="stylists">
    <PageNavigation />
    <div class="stylists-header">
      <h1>Our Expert Stylists</h1>
      <p class="header-description">Meet our talented team of professional stylists who are passionate about making you look and feel your best.</p>
    </div>

    <div class="stylists-grid">
      <div v-for="stylist in stylists" :key="stylist.id" class="stylist-card">
        <div class="stylist-image">
          <img :src="stylist.image" :alt="stylist.name" />
          <div class="image-overlay">
            <div class="social-links">
              <a :href="stylist.contact.social.instagram" target="_blank" class="social-link instagram">
                <i class="fab fa-instagram"></i>
              </a>
              <a :href="stylist.contact.social.facebook" target="_blank" class="social-link facebook">
                <i class="fab fa-facebook-f"></i>
              </a>
              <a :href="stylist.contact.social.twitter" target="_blank" class="social-link twitter">
                <i class="fab fa-twitter"></i>
              </a>
              <a :href="stylist.contact.social.linkedin" target="_blank" class="social-link linkedin">
                <i class="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
        </div>
        <div class="stylist-info">
          <h3>{{ stylist.name }}</h3>
          <p class="stylist-title">{{ stylist.title }}</p>
          <p class="stylist-experience">{{ stylist.experience }} years experience</p>
          <div class="stylist-specialties">
            <h4>Specialties:</h4>
            <div class="specialty-tags">
              <span v-for="specialty in stylist.specialties" :key="specialty" class="specialty-tag">
                {{ specialty }}
              </span>
            </div>
          </div>
          <p class="stylist-bio">{{ stylist.bio }}</p>

          <div class="contact-info">
            <div class="contact-item">
              <span class="contact-icon">📞</span>
              <span>{{ stylist.contact.phone }}</span>
            </div>
            <div class="contact-item">
              <span class="contact-icon">📧</span>
              <span>{{ stylist.contact.email }}</span>
            </div>
            <div class="contact-item">
              <span class="contact-icon">📍</span>
              <span>{{ stylist.contact.location }}</span>
            </div>
          </div>

          <div class="stylist-rating">
            <div class="stars">
              <span v-for="star in 5" :key="star" class="star" :class="{ filled: star <= stylist.rating }">⭐</span>
            </div>
            <span class="rating-text">({{ stylist.rating }}/5)</span>
          </div>
          <button
            v-if="selectedService"
            @click="continueWithStylist(stylist)"
            class="continue-btn"
          >
            Continue with {{ stylist.name }}
          </button>
          <div v-else class="no-service-message">
            <p>Select a service first to book with {{ stylist.name }}</p>
            <router-link to="/services" class="select-service-btn">Choose Service</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageNavigation from '@/components/PageNavigation.vue'
import { stylistAPI } from '../services/api.js'

const router = useRouter()

const selectedService = ref(null)

const stylistsData = [
  {
    id: 6,
    name: 'Antonio Rodriguez',
    title: 'Traditional Barber',
    experience: 10,
    rating: 4.8,
    image: '@/assets/images/expert-grooming.svg',
    specialties: ['Traditional Cuts', 'Straight Razor', 'Hot Towel'],
    bio: 'Antonio brings old-school barbering traditions with 10 years of experience. He excels in traditional cuts, straight razor shaves, and hot towel treatments.',
    contact: {
      phone: '(555) 123-4567',
      email: 'antonio@elitebarbershop.com',
      location: '123 Main St, Downtown',
      social: {
        instagram: 'https://instagram.com/antonio_barber',
        facebook: 'https://facebook.com/antonio.rodriguez.barber',
        twitter: 'https://twitter.com/antonio_cuts',
        linkedin: 'https://linkedin.com/in/antonio-rodriguez-barber'
      }
    }
  },
  {
    id: 8,
    name: 'Carlos Mendez',
    title: 'Senior Barber',
    experience: 9,
    rating: 4.7,
    image: '@/assets/images/professional-styling.svg',
    specialties: ['Precision Cuts', 'Beard Sculpting', 'Hair Treatments'],
    bio: 'Carlos combines technical precision with artistic flair. With 9 years of experience, he excels in precision cuts, beard sculpting, and specialized hair treatments.',
    contact: {
      phone: '(555) 234-5678',
      email: 'carlos@elitebarbershop.com',
      location: '456 Oak Ave, Midtown',
      social: {
        instagram: 'https://instagram.com/carlos_precision',
        facebook: 'https://facebook.com/carlos.mendez.barber',
        twitter: 'https://twitter.com/carlos_cuts',
        linkedin: 'https://linkedin.com/in/carlos-mendez-barber'
      }
    }
  },
  {
    id: 1,
    name: 'Mike Johnson',
    title: 'Master Barber',
    experience: 8,
    rating: 4.9,
    image: '@/assets/images/client-doing-hair-cut-barber-shop-salon.svg',
    specialties: ['Classic Cuts', 'Beard Styling', 'Fade Cuts'],
    bio: 'Mike is our master barber with over 8 years of experience. He specializes in classic cuts and modern fades, ensuring every client leaves looking sharp and confident.',
    contact: {
      phone: '(555) 345-6789',
      email: 'mike@elitebarbershop.com',
      location: '789 Pine St, Uptown',
      social: {
        instagram: 'https://instagram.com/mike_mastercuts',
        facebook: 'https://facebook.com/mike.johnson.barber',
        twitter: 'https://twitter.com/mike_barber',
        linkedin: 'https://linkedin.com/in/mike-johnson-barber'
      }
    }
  },
  {
    id: 4,
    name: 'Lisa Davis',
    title: 'Style Consultant',
    experience: 7,
    rating: 4.9,
    image: '@/assets/images/professional-styling.svg',
    specialties: ['Consultations', 'Premium Services', 'Hair Care'],
    bio: 'Lisa is our style consultant who helps clients choose the perfect look. With 7 years of experience, she offers premium services and expert hair care advice.',
    contact: {
      phone: '(555) 456-7890',
      email: 'lisa@elitebarbershop.com',
      location: '321 Elm St, Westside',
      social: {
        instagram: 'https://instagram.com/lisa_styleconsult',
        facebook: 'https://facebook.com/lisa.davis.stylist',
        twitter: 'https://twitter.com/lisa_styles',
        linkedin: 'https://linkedin.com/in/lisa-davis-stylist'
      }
    }
  },
  {
    id: 5,
    name: 'Marcus Thompson',
    title: 'Fade Specialist',
    experience: 4,
    rating: 4.6,
    image: '@/assets/images/Buzz-cut2.svg',
    specialties: ['Fade Cuts', 'Modern Styles', 'Edge-ups'],
    bio: 'Marcus is our fade specialist who creates perfect gradients and modern styles. His attention to detail and artistic approach makes him a client favorite.',
    contact: {
      phone: '(555) 567-8901',
      email: 'marcus@elitebarbershop.com',
      location: '654 Maple Dr, Eastside',
      social: {
        instagram: 'https://instagram.com/marcus_fades',
        facebook: 'https://facebook.com/marcus.thompson.barber',
        twitter: 'https://twitter.com/marcus_fades',
        linkedin: 'https://linkedin.com/in/marcus-thompson-barber'
      }
    }
  },
  {
    id: 7,
    name: 'Jordan Mitchell',
    title: 'Creative Stylist',
    experience: 3,
    rating: 4.5,
    image: '@/assets/images/professional-styling.svg',
    specialties: ['Creative Cuts', 'Artistic Designs', 'Youth Styles'],
    bio: 'Jordan is our youngest stylist with a fresh perspective on modern cuts. He specializes in creative designs and contemporary styles for younger clients.',
    contact: {
      phone: '(555) 678-9012',
      email: 'jordan@elitebarbershop.com',
      location: '987 Cedar Ln, Southside',
      social: {
        instagram: 'https://instagram.com/jordan_creative',
        facebook: 'https://facebook.com/jordan.mitchell.stylist',
        twitter: 'https://twitter.com/jordan_styles',
        linkedin: 'https://linkedin.com/in/jordan-mitchell-stylist'
      }
    }
  }
]

// Create reactive ref for stylists
const stylists = ref([])
const loading = ref(true)

// Load stylists from API
const loadStylists = async () => {
  try {
    loading.value = true
    const response = await stylistAPI.getAll()

    // Map API data to include fallback images and contact info
    const apiStylists = response.data.map((stylist, index) => ({
      ...stylist,
      id: stylist._id || stylist.id,
      name: stylist.fullName || `${stylist.firstName} ${stylist.lastName}`,
      image: stylistsData[index % stylistsData.length]?.image || '@/assets/images/expert-grooming.svg',
      contact: stylist.contact || {
        phone: stylist.phone || '(555) 123-4567',
        email: stylist.email || 'stylist@elitebarbershop.com',
        location: stylist.address || '123 Main St, Downtown',
        social: stylist.social || {
          instagram: '#',
          facebook: '#',
          twitter: '#',
          linkedin: '#'
        }
      }
    }))

    // If API has no stylists, use fallback data
    stylists.value = apiStylists.length > 0
      ? apiStylists.sort((a, b) => (b.experience || 0) - (a.experience || 0))
      : stylistsData.sort((a, b) => b.experience - a.experience)

  } catch (error) {
    console.error('Error loading stylists:', error)
    // Fallback to hardcoded data if API fails
    stylists.value = stylistsData.sort((a, b) => b.experience - a.experience)
  } finally {
    loading.value = false
  }
}

const continueWithStylist = (stylist) => {
  if (!selectedService.value) {
    alert('Please select a service first')
    return
  }

  // Store complete stylist data with correct MongoDB _id
  const stylistData = {
    _id: stylist._id || stylist.id, // Use MongoDB _id
    id: stylist._id || stylist.id,  // Keep for compatibility
    name: stylist.fullName || `${stylist.firstName} ${stylist.lastName}`,
    firstName: stylist.firstName,
    lastName: stylist.lastName,
    title: stylist.title,
    rating: stylist.rating,
    experience: stylist.experience
  }

  localStorage.setItem('selectedStylist', JSON.stringify(stylistData))

  // Navigate to booking page with both service and stylist information
  router.push({
    path: '/booking',
    query: {
      serviceId: selectedService.value._id || selectedService.value.id,
      serviceName: selectedService.value.name,
      servicePrice: selectedService.value.price,
      serviceDuration: selectedService.value.duration,
      stylistId: stylistData._id,
      stylistName: stylistData.name,
      preferredStylist: stylistData.name
    }
  })
}

onMounted(() => {
  // Load stylists from API
  loadStylists()

  // Check if a service was selected from the services page
  const storedService = localStorage.getItem('selectedService')
  if (storedService) {
    selectedService.value = JSON.parse(storedService)
  }
})
</script>

<style scoped>
.stylists {
  padding: 1.6rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  min-height: 100vh;
}

.stylists-header {
  text-align: center;
  margin-bottom: 3.2rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.stylists-header h1 {
  color: #f4e4bc;
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.header-description {
  color: #bdc3c7;
  font-size: 1.2rem;
  line-height: 1.6;
  margin: 0;
}

.stylists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 3rem;
  max-width: 1400px;
  margin: 0 auto;
}

.stylist-card {
  background: linear-gradient(135deg, #2c2c2c 0%, #3a3a3a 100%);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  position: relative;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.stylist-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(212, 175, 55, 0.2);
}

.stylist-image {
  position: relative;
  height: 240px;
  overflow: hidden;
}

.stylist-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.8) 0%, rgba(244, 228, 188, 0.8) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stylist-card:hover .image-overlay {
  opacity: 1;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  background: white;
  color: #d4af37;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.social-link:hover {
  transform: scale(1.1);
  color: white;
}

.social-link.instagram:hover {
  background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%);
}

.social-link.facebook:hover {
  background: #1877f2;
}

.social-link.twitter:hover {
  background: #1da1f2;
}

.social-link.linkedin:hover {
  background: #0077b5;
}

/* Contact Info Styles */
.contact-info {
  margin: 1.5rem 0;
  padding: 1rem;
  background: rgba(244, 228, 188, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #5a5a5a;
}

.contact-item:last-child {
  margin-bottom: 0;
}

.contact-icon {
  font-size: 1rem;
  width: 20px;
  text-align: center;
}

.stylist-info {
  padding: 1.6rem;
}

.stylist-info h3 {
  color: #f4e4bc;
  font-size: 1.8rem;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
}

.stylist-title {
  color: #d4af37;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.stylist-experience {
  color: #bdc3c7;
  font-size: 0.9rem;
  margin: 0 0 1.5rem 0;
  font-style: italic;
}

.stylist-specialties h4 {
  color: #f4e4bc;
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.specialty-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.specialty-tag {
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%);
  color: #2c2c2c;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.stylist-bio {
  color: #5a5a5a;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.stylist-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.stars {
  display: flex;
  gap: 0.2rem;
}

.star {
  font-size: 1.2rem;
  filter: grayscale(100%);
  transition: filter 0.3s ease;
}

.star.filled {
  filter: grayscale(0%);
}

.rating-text {
  color: #5a5a5a;
  font-size: 0.9rem;
  font-weight: 600;
}

.continue-btn {
  width: 100%;
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%);
  color: #2c2c2c;
  border: none;
  padding: 15px 24px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.continue-btn:hover {
  background: linear-gradient(135deg, #f4e4bc 0%, #d4af37 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(212, 175, 55, 0.4);
}

.no-service-message {
  text-align: center;
  padding: 1rem;
  background: rgba(212, 175, 55, 0.1);
  border-radius: 10px;
  border: 2px dashed rgba(212, 175, 55, 0.3);
}

.no-service-message p {
  color: #5a5a5a;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.select-service-btn {
  display: inline-block;
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%);
  color: #2c2c2c;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.select-service-btn:hover {
  background: linear-gradient(135deg, #f4e4bc 0%, #d4af37 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(212, 175, 55, 0.4);
}

@media (max-width: 768px) {
  .stylists {
    padding: 1rem;
  }

  .stylists-header h1 {
    font-size: 2.5rem;
  }

  .stylists-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .stylist-card {
    margin: 0 auto;
    max-width: 400px;
  }
}
</style>
