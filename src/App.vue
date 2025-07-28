<template>
  <div id="app">
    <nav class="navbar">
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
  padding: 1rem 2rem;
  background: linear-gradient(180deg, rgba(44, 44, 44, 0.95) 0%, rgba(44, 44, 44, 0.8) 70%, transparent 100%);
  color: #f4e4bc;
  backdrop-filter: blur(15px);
  transition: all 0.3s ease;
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