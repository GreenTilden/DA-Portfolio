<template>
  <div id="app" @click.self="closeMenu">
    <header class="header">
      <div class="content-container">
        <div class="header-content">
          <div class="header-left">
            <div class="logo">
              <router-link to="/">
                <h1 class="site-title">Darren Arney</h1>
                <p class="tagline">Automation Professional</p>
              </router-link>
            </div>
            <div class="header-theme-selector">
              <button @click="toggleThemeMenu" class="theme-toggle" :class="{ active: showThemeMenu }">
                {{ getThemeDisplayName(currentTheme) }}
                <svg class="dropdown-icon" :class="{ rotated: showThemeMenu }" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </button>
              <div v-show="showThemeMenu" class="theme-dropdown">
                <button 
                  v-for="theme in availableThemes" 
                  :key="theme"
                  @click="selectTheme(theme)"
                  class="theme-choice"
                  :class="{ active: currentTheme === theme }"
                >
                  {{ getThemeDisplayName(theme) }}
                </button>
              </div>
            </div>
          </div>
          <nav class="main-nav">
            <div class="menu-toggle" ref="menuToggle" @click.stop="toggleMenu" :class="{ 'active': menuActive }">
              <span></span>
              <span></span>
              <span></span>
              <div v-if="menuActive" class="mobile-menu-popout-float" @click.self="closeMenu">
                <div class="mobile-menu-popout">
                  <ul class="nav-links mobile-links">
                    <li><router-link to="/" exact @click="closeMenu">Home</router-link></li>
                    <li><router-link to="/demos" @click="closeMenu">Interactive Demos</router-link></li>
                    <li><router-link to="/projects" @click="closeMenu">Projects</router-link></li>
                    <li><router-link to="/experience" @click="closeMenu">Experience</router-link></li>
                    <li><router-link to="/contact" @click="closeMenu">Contact</router-link></li>
                  </ul>
                </div>
              </div>
            </div>
            <ul class="nav-links desktop-links">
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
      <div class="content-container">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <footer class="footer">
      <div class="content-container">
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
import { useTheme } from '@/composables/useTheme';

export default {
  setup() {
    const { currentTheme, setTheme, availableThemes, getThemeDisplayName } = useTheme();
    return {
      currentTheme,
      setTheme,
      availableThemes,
      getThemeDisplayName
    };
  },
  data() {
    return {
      menuActive: false,
      isMobile: false,
      showThemeMenu: false
    }
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    document.addEventListener('click', this.closeThemeMenu);
    this.setTheme('monochrome');
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
    document.removeEventListener('click', this.closeThemeMenu);
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
      if (this.isMobile) {
        document.body.style.overflow = this.menuActive ? 'hidden' : '';
      }
    },
    closeMenu() {
      this.menuActive = false;
      document.body.style.overflow = '';
    },
    toggleThemeMenu(event) {
      event.stopPropagation();
      this.showThemeMenu = !this.showThemeMenu;
    },
    selectTheme(theme) {
      this.setTheme(theme);
      this.showThemeMenu = false;
    },
    closeThemeMenu(event) {
      if (!event.target.closest('.header-theme-selector')) {
        this.showThemeMenu = false;
      }
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@500;600;700&family=Roboto+Mono:wght@400;500&display=swap');

body {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-light);
  background-color: var(--bg-color);
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

a {
  color: var(--primary-color);
  text-decoration: none;
  transition: all 0.3s ease;
}

a:hover {
  color: var(--primary-dark);
}

#app {
  width: 100%;
  margin: 0 auto;
  padding: 0.5rem;
  box-sizing: border-box;
}

.content-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  box-sizing: border-box;
}

/* Header */
.header {
  background-color: var(--section-bg);
  color: var(--text-light);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid var(--border-color);
  border-radius: 1rem 1rem 0.5rem 0.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  overflow: visible;
  padding: 0.25rem 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem 0.5rem;
  position: relative;
}

.header-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: auto;
  padding: 0;
}

.logo a {
  color: var(--text-light);
  display: block;
  width: 100%;
  line-height: 1;
}

.site-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  line-height: 1;
}

.tagline {
  font-size: 0.875rem;
  color: var(--text-faded);
  margin: 0;
  line-height: 1;
  text-align: left;
  white-space: nowrap;
}

.header-theme-selector {
  position: relative;
  margin-top: -1.5rem;
  align-self: flex-start;
}

.theme-toggle {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.35rem 0.7rem;
  border-radius: 0.4rem;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 120px;
  justify-content: space-between;
  text-align: left;
  position: relative;
  z-index: 1;
}

[data-theme="monochrome"] .theme-toggle {
  color: #000000;
  background-color: #d0d0d0;
  border: 1px solid #707070;
}

[data-theme="monochrome"] .theme-toggle:hover {
  background-color: #e0e0e0;
}

.theme-toggle:hover {
  background-color: var(--primary-dark);
  transform: translateY(-1px);
}

.theme-toggle.active {
  background-color: var(--primary-dark);
}

.dropdown-icon {
  transition: transform 0.3s ease;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

.theme-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.4rem;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.4rem;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  min-width: 140px;
  z-index: 1100;
}

.theme-choice {
  display: block;
  width: 100%;
  padding: 0.6rem 1rem;
  background: transparent;
  color: var(--text-light);
  border: none;
  cursor: pointer;
  font-size: 0.75rem;
  text-align: left;
  transition: all 0.2s ease;
  border-bottom: 1px solid var(--border-color);
}

.theme-choice:last-child {
  border-bottom: none;
}

.theme-choice:hover {
  background-color: var(--primary-color);
  color: white;
}

[data-theme="monochrome"] .theme-choice:hover {
  background-color: #d0d0d0;
  color: #000000;
}

.theme-choice.active {
  background-color: var(--primary-color);
  color: white;
  font-weight: 600;
}

[data-theme="monochrome"] .theme-choice.active {
  background-color: #d0d0d0;
  color: #000000;
}

/* Navigation */
.main-nav {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  align-self: stretch;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 1.25rem;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
}

.nav-links li {
  margin-left: 1.5rem;
  white-space: nowrap;
}

.nav-links a {
  color: var(--text-light);
  opacity: 0.9;
  font-weight: 500;
  padding: 0.5rem 0.25rem;
  position: relative;
  display: inline-block;
  text-align: center;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  opacity: 1;
  color: var(--primary-color);
}

.nav-links a.router-link-active:after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primary-color);
  border-radius: 1px;
}

/* Menu toggle - hidden by default */
.menu-toggle {
  display: none;
  position: relative;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  background: var(--primary-color);
  border-radius: 8px;
  cursor: pointer;
  transition: background .3s ease, box-shadow .3s ease, transform .3s ease;
}

.menu-toggle:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.menu-toggle span {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 2px;
  background: white;
  border-radius: 2px;
  transform-origin: center;
  transition: transform .3s ease, opacity .25s ease;
}

.menu-toggle span:nth-child(1) {
  transform: translate(-50%, -50%) translateY(-6px);
}
.menu-toggle span:nth-child(2) {
  transform: translate(-50%, -50%);
}
.menu-toggle span:nth-child(3) {
  transform: translate(-50%, -50%) translateY(6px);
}

.menu-toggle.active span:nth-child(1) {
  transform: translate(-50%, -50%) rotate(45deg);
}
.menu-toggle.active span:nth-child(2) {
  opacity: 0;
}
.menu-toggle.active span:nth-child(3) {
  transform: translate(-50%, -50%) rotate(-45deg);
}

[data-theme="monochrome"] .menu-toggle {
  background: #d0d0d0;
  border: 1px solid #707070;
}
[data-theme="monochrome"] .menu-toggle span {
  background-color: #000000;
}
[data-theme="monochrome"] .menu-toggle:hover {
  background: #e0e0e0;
}
[data-theme="monochrome"] .menu-toggle.active {
  background: #b0b0b0;
}

/* Mobile menu popout */
.mobile-menu-popout {
  display: flex;
  flex-direction: column;
  padding: .5rem;
}

.mobile-menu-popout-float {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background-color: var(--section-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  box-shadow: var(--shadow-lg);
  min-width: 220px;
  max-width: 80vw;
  z-index: 2100;
  overflow: hidden;
  transform-origin: top right;
  animation: fadeInDown 0.25s ease;
}

.mobile-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-links a {
  display: block;
  font-size: 1.05rem;
  font-weight: 500;
  color: var(--text-light);
  border-radius: 0.3rem;
  padding: 0.5rem;
  margin: 0 auto;
  width: max-content;
  transition: color 0.2s ease, transform 0.2s ease;
}

.mobile-links a:hover {
  color: var(--primary-color);
  transform: translateX(5px);
}

[data-theme="monochrome"] .mobile-links a:hover {
  background-color: #d0d0d0;
  color: #000000;
}

/* Responsive - show menu toggle on mobile */
@media (max-width: 767px) {
  .menu-toggle {
    display: flex;
  }

  .desktop-links {
    display: none;
  }

  .footer-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}

/* Main content */
.main-content {
  min-height: calc(100vh - 140px);
  padding: 2rem 0;
}

/* Footer */
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
  display: flex;
  align-items: center;
}

.social-links a:hover {
  opacity: 1;
  color: var(--primary-color);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
