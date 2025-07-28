<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-background">
        <div class="floating-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
          <div class="shape shape-4"></div>
        </div>
      </div>
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <span class="title-line">Elite Barber</span>
            <span class="title-line">Shop</span>
          </h1>
          <p class="hero-subtitle">Where Style Meets Excellence</p>
          <p class="hero-description">
            Experience premium haircuts and styling services from our expert barbers.
            Your perfect look awaits.
          </p>
          <div class="hero-buttons">
            <router-link to="/services" class="cta-button primary">
              <span>Explore Services</span>
              <div class="button-shine"></div>
            </router-link>
            <router-link to="/stylists" class="cta-button secondary">
              <span>Meet Our Team</span>
            </router-link>
          </div>
        </div>
        <div class="hero-image">
          <div class="image-container">
            <img src="@/asset/images/client-doing-hair-cut-barber-shop-salon.jpg" alt="Professional Barber Service" />
            <div class="image-overlay"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <div class="section-header">
          <h2>Why Choose Elite Barber Shop?</h2>
          <p>Discover what makes us the premier destination for men's grooming</p>
        </div>
        <div class="features-grid">
          <div class="feature" data-aos="fade-up" data-aos-delay="100">
            <div class="feature-icon">
              <div class="icon-circle">✂️</div>
            </div>
            <h3>Expert Stylists</h3>
            <p>Our master barbers bring years of experience and passion to every cut, ensuring you leave looking and feeling your absolute best.</p>
            <div class="feature-number">01</div>
          </div>
          <div class="feature" data-aos="fade-up" data-aos-delay="200">
            <div class="feature-icon">
              <div class="icon-circle">⭐</div>
            </div>
            <h3>Premium Services</h3>
            <p>From classic cuts to modern styles, beard trims to hot towel shaves - we offer comprehensive grooming services for the modern gentleman.</p>
            <div class="feature-number">02</div>
          </div>
          <div class="feature" data-aos="fade-up" data-aos-delay="300">
            <div class="feature-icon">
              <div class="icon-circle">📱</div>
            </div>
            <h3>Easy Booking</h3>
            <p>Book your appointment online with our streamlined system. Choose your service, select your preferred stylist, and secure your slot.</p>
            <div class="feature-number">03</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-item" data-aos="zoom-in" data-aos-delay="100">
            <div class="stat-number">500+</div>
            <div class="stat-label">Happy Clients</div>
          </div>
          <div class="stat-item" data-aos="zoom-in" data-aos-delay="200">
            <div class="stat-number">5+</div>
            <div class="stat-label">Years Experience</div>
          </div>
          <div class="stat-item" data-aos="zoom-in" data-aos-delay="300">
            <div class="stat-number">4.9</div>
            <div class="stat-label">Average Rating</div>
          </div>
          <div class="stat-item" data-aos="zoom-in" data-aos-delay="400">
            <div class="stat-number">6</div>
            <div class="stat-label">Services Offered</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Gallery Section -->
    <section class="gallery">
      <div class="container">
        <div class="section-header">
          <h2>Our Work</h2>
          <p>See the transformation we create for our clients</p>
        </div>
        <div class="gallery-grid">
          <div class="gallery-item" data-aos="fade-up" data-aos-delay="100">
            <img src="@/asset/images/Afro-Buzz-Cut.jpg" alt="Afro Buzz Cut" />
            <div class="gallery-overlay">
              <h4>Afro Buzz Cut</h4>
            </div>
          </div>
          <div class="gallery-item" data-aos="fade-up" data-aos-delay="200">
            <img src="@/asset/images/handsome-man-barbershop-shaving-beard.jpg" alt="Beard Styling" />
            <div class="gallery-overlay">
              <h4>Beard Styling</h4>
            </div>
          </div>
          <div class="gallery-item" data-aos="fade-up" data-aos-delay="300">
            <img src="@/asset/images/young-man-visiting-barbershop.jpg" alt="Premium Service" />
            <div class="gallery-overlay">
              <h4>Premium Package</h4>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2>Ready for Your Perfect Look?</h2>
          <p>Book your appointment today and experience the Elite difference</p>
          <router-link to="/services" class="cta-button large">
            <span>Start Your Journey</span>
            <div class="button-shine"></div>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // Initialize AOS (Animate On Scroll) if available
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100
    })
  }
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.home {
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Hero Section */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 80px;
  height: 80px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 120px;
  height: 120px;
  top: 60%;
  left: 80%;
  animation-delay: 2s;
}

.shape-3 {
  width: 60px;
  height: 60px;
  top: 80%;
  left: 20%;
  animation-delay: 4s;
}

.shape-4 {
  width: 100px;
  height: 100px;
  top: 30%;
  right: 15%;
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.hero-content {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.hero-text {
  animation: slideInLeft 1s ease-out;
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.title-line {
  display: block;
  animation: fadeInUp 1s ease-out;
}

.title-line:nth-child(2) {
  animation-delay: 0.2s;
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.5rem;
  font-weight: 300;
  margin-bottom: 1rem;
  opacity: 0.9;
  animation: fadeInUp 1s ease-out 0.4s both;
}

.hero-description {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  opacity: 0.8;
  animation: fadeInUp 1s ease-out 0.6s both;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  animation: fadeInUp 1s ease-out 0.8s both;
}

.cta-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 15px 30px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.cta-button.primary {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
}

.cta-button.secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.cta-button.large {
  padding: 20px 40px;
  font-size: 1.2rem;
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.cta-button.primary:hover {
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.6);
}

.button-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.cta-button:hover .button-shine {
  left: 100%;
}

.hero-image {
  animation: slideInRight 1s ease-out;
}

.image-container {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  transform: perspective(1000px) rotateY(-5deg);
  transition: transform 0.3s ease;
}

.image-container:hover {
  transform: perspective(1000px) rotateY(0deg) scale(1.05);
}

.image-container img {
  width: 100%;
  height: 400px;
  object-fit: cover;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
}

/* Animations */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Features Section */
.features {
  padding: 6rem 0;
  background: #f8f9fa;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-header h2 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  font-weight: 700;
}

.section-header p {
  font-size: 1.2rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 3rem;
}

.feature {
  position: relative;
  background: white;
  padding: 3rem 2rem;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
}

.feature:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  margin-bottom: 2rem;
}

.icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(102, 126, 234, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
  }
}

.feature h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  font-weight: 600;
}

.feature p {
  color: #666;
  line-height: 1.6;
  font-size: 1rem;
}

.feature-number {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
}

/* Stats Section */
.stats {
  padding: 4rem 0;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.stat-item {
  text-align: center;
  padding: 2rem;
}

.stat-number {
  font-size: 3rem;
  font-weight: 800;
  color: #ffd700;
  margin-bottom: 0.5rem;
  display: block;
}

.stat-label {
  font-size: 1.1rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Gallery Section */
.gallery {
  padding: 6rem 0;
  background: white;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.gallery-item {
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  height: 300px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.gallery-item:hover {
  transform: scale(1.05);
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.gallery-item:hover img {
  transform: scale(1.1);
}

.gallery-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: 2rem;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.gallery-item:hover .gallery-overlay {
  transform: translateY(0);
}

.gallery-overlay h4 {
  font-size: 1.3rem;
  margin: 0;
}

/* CTA Section */
.cta-section {
  padding: 6rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.cta-content h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.cta-content p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .gallery-grid {
    grid-template-columns: 1fr;
  }

  .section-header h2 {
    font-size: 2rem;
  }

  .container {
    padding: 0 1rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-number {
    font-size: 2.5rem;
  }
}
</style>