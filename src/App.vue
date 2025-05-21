<template>
  <div id="app">
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <router-link to="/">
              <h1>Darren Arney</h1>
              <p class="tagline">Automation Professional</p>
            </router-link>
          </div>
          
          <nav class="main-nav">
            <div class="menu-toggle" @click="toggleMenu">
              <span></span>
              <span></span>
              <span></span>
            </div>
            
            <ul class="nav-links" :class="{ 'active': menuActive }">
              <li><router-link to="/" exact>Home</router-link></li>
              <li><router-link to="/demos">Interactive Demos</router-link></li>
              <li><router-link to="/projects">Projects</router-link></li>
              <li><router-link to="/experience">Experience</router-link></li>
              <li><router-link to="/contact">Contact</router-link></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="copyright">
            &copy; {{ new Date().getFullYear() }} Darren Arney 
          </div>
          <div class="social-links">
            <a href="https://github.com/greentilden" target="_blank" rel="noopener" title="GitHub">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </a>
            <a href="https://www.linkedin.com/in/darren-arney" target="_blank" rel="noopener" title="LinkedIn">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menuActive: false,
      isMobile: false
    }
  },
mounted() {
// Check if mobile on load
  this.checkIfMobile();
// Add resize listener
  window.addEventListener('resize', this.checkIfMobile);
},
beforeUnmount() {
// Remove listener when component is destroyed
  window.removeEventListener('resize', this.checkIfMobile);
},
methods: {
  checkIfMobile() {
    this.isMobile = window.innerWidth < 768;
  },
  toggleMenu() {
    this.menuActive = !this.menuActive;
// Prevent scrolling when menu is open on mobile
    document.body.style.overflow = this.menuActive && this.isMobile ? 'hidden' : '';
  }
},
  watch: {
    $route() {
      // Close mobile menu when route changes
      this.menuActive = false;
    }
  }}
</script>

<style>
/* Import professional fonts - adding font weights for better typography */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@500;600;700&family=Roboto+Mono:wght@400;500&display=swap');

:root {
  /* Consistent dark theme based on your style.css */
  --bg-color: #1e2a38;             /* page background */
  --section-bg: #2a3648;           /* sections like hero/specialties */
  --card-bg: #324158;              /* cards & panels */
  --primary-color: #4a90e2;        /* CTA / highlights */
  --primary-dark: #3367b2;         /* CTA hover state */
  --secondary-color: #6e88a6;      /* secondary accents */
  --text-color: #eaeaea;           /* primary text */
  --text-light: #eaeaea;           /* emphasized text */
  --text-faded: #b4b4b4;           /* secondary text */
  --border-color: #3f4f65;         /* borders */
  --success-color: #10B981;        /* success messages */
  --error-color: #EF4444;          /* error messages */
  --warning-color: #F59E0B;        /* warning messages */
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-light);
  background-color: var(--bg-color);
  min-height: 100vh;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

a {
  color: var(--primary-color);
  text-decoration: none;
  transition: all 0.3s ease;
}

a:hover {
  color: var(--primary-dark);
}

.header {
  background-color: var(--section-bg);
  color: var(--text-light);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid var(--border-color);
  border-radius: 1rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.logo a {
  color: var(--text-light);
  display: block;
}

.logo h1 {
  font-size: 1.5rem;
  margin: 0;
  font-weight: 700;
}

.tagline {
  font-size: 0.875rem;
  color: var(--text-faded);
  margin-top: 0.25rem;
}

.main-nav {
  display: flex;
  align-items: center;
}

.nav-links {
  display: flex;
  list-style: none;
}

.nav-links li {
  margin-left: 1.5rem;
}

.nav-links a {
  color: var(--text-light);
  opacity: 0.9;
  font-weight: 500;
  padding: 0.5rem 0;
  position: relative;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  opacity: 1;
  color: var(--primary-color);
}

.nav-links a.router-link-active:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primary-color);
}

.menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 18px;
  cursor: pointer;
}

.menu-toggle span {
  height: 2px;
  width: 100%;
  background-color: var(--text-light);
  transition: all 0.3s ease;
}

.menu-toggle.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.menu-toggle.active span:nth-child(2) {
  opacity: 0;
}

.menu-toggle.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

.main-content {
  min-height: calc(100vh - 140px);
  padding: 2rem 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.footer {
  background-color: var(--section-bg);
  color: var(--text-faded);
  padding: 1.5rem 0;
  border-top: 1px solid var(--border-color);
  border-radius: 1rem;
  margin-top: 2rem;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-links a {
  color: var(--text-light);
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.social-links a:hover {
  opacity: 1;
  color: var(--primary-color);
}

/* Consistent button styling in dark theme */
button, .btn, .el-button {
  border-radius: 6px !important;
  font-weight: 500 !important;
  letter-spacing: 0.3px !important;
  transition: all 0.3s ease !important;
}

/* Add a subtle glass-like effect to cards and panels */
.el-card {
  background-color: var(--card-bg) !important;
  border-color: var(--border-color) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

/* Apply consistent code styling */
code, pre {
  font-family: 'Roboto Mono', monospace !important;
  background-color: rgba(0, 0, 0, 0.2) !important;
  border-radius: 4px !important;
}

@media (max-width: 768px) {
  .menu-toggle {
    display: flex;
  }

  .nav-links {
    position: fixed;
    top: 64px;
    left: 0;
    width: 100%;
    background-color: var(--section-bg);
    flex-direction: column;
    padding: 1rem;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    border-bottom: 1px solid var(--border-color);
  }

 .nav-links.active {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  }

  .nav-links li {
    margin: 0.5rem 0;
  }

  .footer-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>