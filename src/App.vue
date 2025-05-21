<template>
  <div id="app" @click.self="closeMenu">
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <router-link to="/">
              <h1 class="site-title">Darren Arney</h1>
              <p class="tagline">Automation Professional</p>
            </router-link>
          </div>
          <nav class="main-nav">
            <div class="menu-toggle" @click.stop="toggleMenu">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <transition name="menu-slide-fade">
              <ul v-show="menuActive" class="nav-links popout" @click.stop>
                <li><router-link to="/" exact @click.native="closeMenu">Home</router-link></li>
                <li><router-link to="/demos" @click.native="closeMenu">Interactive Demos</router-link></li>
                <li><router-link to="/projects" @click.native="closeMenu">Projects</router-link></li>
                <li><router-link to="/experience" @click.native="closeMenu">Experience</router-link></li>
                <li><router-link to="/contact" @click.native="closeMenu">Contact</router-link></li>
              </ul>
            </transition>
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
            </a>
            <a href="https://www.linkedin.com/in/darren-arney" target="_blank" rel="noopener" title="LinkedIn">
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
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
  },
  methods: {
    checkIfMobile() {
      this.isMobile = window.innerWidth < 768;
      if (!this.isMobile && this.menuActive) {
        this.menuActive = false;
        document.body.style.overflow = '';
      }
    },
    toggleMenu() {
      this.menuActive = !this.menuActive;
      document.body.style.overflow = this.menuActive && this.isMobile ? 'hidden' : '';
    },
    closeMenu() {
      this.menuActive = false;
      document.body.style.overflow = '';
    }
  },
  watch: {
    $route() {
      this.menuActive = false;
      document.body.style.overflow = '';
    }
  }
}
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




body {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-light);
  background-color: var(--bg-color);
  min-height: 100vh;
  margin: 0;
}

.wide-container {
  max-width: 1400px;
  padding-left: 1rem;
  padding-right: 1rem;
}
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

@media (min-width: 768px) {
  .container {
    padding-left: 0.5rem;
    padding-right: .05rem;
  }
}


a {
  color: var(--primary-color);
  text-decoration: none;
  transition: all 0.3s ease;
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
  transform: rotate(-45deg) translate(6px, -6px);
}
a:hover {
  color: var(--primary-dark);
}

.backdrop::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.header {
  background-color: var(--section-bg);
  color: var(--text-light);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid var(--border-color);
  border-radius: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.site-title {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
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
  position: relative;
  z-index: 1100;
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
  padding-left: 0.5rem;
  padding-right: 0.5rem;
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

.nav-links.popout {
  position: absolute;
  top: 60px;
  right: 1rem;
  background-color: var(--section-bg);
  flex-direction: column;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  width: max-content;
  min-width: 200px;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

    .nav-links.popout li {
    margin: 0.5rem 0;
  }
  .nav-links {
    display: flex;
    position: fixed;
    list-style: none;
    top: 64px;
    left: 0;
    width: 100%;
    max-width: 1200px;
    background-color: var(--section-bg);
    flex-direction: column;
    padding: 1rem;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    border-bottom: 1px solid var(--border-color);
    border-radius: 1 1 1rem 1rem;
  }

 .nav-links.active {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid var(--border-color);
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