<template>
  <div class="home">
    <section class="hero">
      <h1>Welcome to Elite Barber Shop</h1>
      <p>Premium haircuts and styling services</p>
      <router-link to="/booking" class="cta-button">Book Appointment</router-link>
    </section>
    
    <section class="features">
      <div class="feature">
        <h3>Expert Stylists</h3>
        <p>Professional barbers with years of experience</p>
      </div>
      <div class="feature">
        <h3>Premium Services</h3>
        <p>Haircuts, beard trims, and styling</p>
      </div>
      <div class="feature">
        <h3>Easy Booking</h3>
        <p>Book online and pay securely</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.cta-button {
  display: inline-block;
  margin-top: 2rem;
  padding: 1rem 2rem;
  background: #e74c3c;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-weight: bold;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 4rem 2rem;
}

.feature {
  text-align: center;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
</style>