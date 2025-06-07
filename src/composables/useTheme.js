import { ref, computed } from 'vue'

const themes = {
  forest: {
    '--bg-color': 'rgba(27, 42, 38, 1)',
    '--section-bg': 'rgba(37, 63, 58, 1)',
    '--card-bg': 'rgba(46, 74, 69, 1)',
    '--primary-color': 'rgba(78, 204, 163, 1)',
    '--primary-dark': 'rgba(46, 139, 103, 1)',
    '--secondary-color': 'rgba(227, 178, 60, 1)',
    '--text-color': 'rgba(240, 240, 240, 1)',
    '--text-light': 'rgba(240, 240, 240, 1)',
    '--text-faded': 'rgba(197, 197, 197, 1)',
    '--text-muted': 'rgba(197, 197, 197, 0.7)',
    '--border-color': 'rgba(63, 79, 101, 1)',
    '--border-light': 'rgba(63, 79, 101, 0.5)',
    '--primary-color-rgb': '78, 204, 163',
    '--secondary-color-rgb': '227, 178, 60',
    '--icon-color': '#4ecca3',
    '--icon-bg': 'rgba(78, 204, 163, 0.2)',
    '--icon-border': 'rgba(78, 204, 163, 0.4)',
    '--bg-light': 'rgba(46, 74, 69, 1)',
    '--card-gradient-start': 'rgba(46, 74, 69, 1)',
    '--card-gradient-end': 'rgba(78, 204, 163, 0.7)',
    '--button-text-dark': '#ffffff',
    '--button-text-light': '#1b2a26',
    '--hover-bg': 'rgba(78, 204, 163, 0.1)',
    '--success-color': 'rgba(16, 185, 129, 1)',
    '--error-color': 'rgba(239, 68, 68, 1)',
    '--warning-color': 'rgba(245, 158, 11, 1)',
    '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  },
  ocean: {
    '--bg-color': 'rgba(30, 42, 56, 1)',
    '--section-bg': 'rgba(42, 54, 72, 1)',
    '--card-bg': 'rgba(50, 65, 88, 1)',
    '--primary-color': 'rgba(74, 144, 226, 1)',
    '--primary-dark': 'rgba(51, 103, 178, 1)',
    '--secondary-color': 'rgba(110, 136, 166, 1)',
    '--text-color': 'rgba(240, 240, 240, 1)',
    '--text-light': 'rgba(240, 240, 240, 1)',
    '--text-faded': 'rgba(197, 197, 197, 1)',
    '--text-muted': 'rgba(197, 197, 197, 0.7)',
    '--border-color': 'rgba(74, 85, 104, 1)',
    '--border-light': 'rgba(74, 85, 104, 0.5)',
    '--primary-color-rgb': '74, 144, 226',
    '--secondary-color-rgb': '110, 136, 166',
    '--icon-color': '#5fa4ff',
    '--icon-bg': 'rgba(74, 144, 226, 0.2)',
    '--icon-border': 'rgba(74, 144, 226, 0.4)',
    '--bg-light': 'rgba(50, 65, 88, 1)',
    '--card-gradient-start': 'rgba(50, 65, 88, 1)',
    '--card-gradient-end': 'rgba(74, 144, 226, 0.7)',
    '--button-text-dark': '#ffffff',
    '--button-text-light': '#1e2a38',
    '--hover-bg': 'rgba(74, 144, 226, 0.1)',
    '--success-color': 'rgba(16, 185, 129, 1)',
    '--error-color': 'rgba(239, 68, 68, 1)',
    '--warning-color': 'rgba(245, 158, 11, 1)',
    '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  },
  monochrome: {
    '--bg-color': 'rgba(26, 26, 26, 1)',
    '--section-bg': 'rgba(45, 45, 45, 1)',
    '--card-bg': 'rgba(58, 58, 58, 1)',
    '--primary-color': 'rgba(208, 208, 208, 1)',
    '--primary-dark': 'rgba(176, 176, 176, 1)',
    '--secondary-color': 'rgba(160, 160, 160, 1)',
    '--text-color': 'rgba(240, 240, 240, 1)',
    '--text-light': 'rgba(240, 240, 240, 1)',
    '--text-faded': 'rgba(176, 176, 176, 1)',
    '--text-muted': 'rgba(176, 176, 176, 0.7)',
    '--border-color': 'rgba(85, 85, 85, 1)',
    '--border-light': 'rgba(85, 85, 85, 0.5)',
    '--primary-color-rgb': '208, 208, 208',
    '--secondary-color-rgb': '160, 160, 160',
    '--icon-color': '#d0d0d0',
    '--icon-bg': 'rgba(208, 208, 208, 0.2)',
    '--icon-border': 'rgba(208, 208, 208, 0.4)',
    '--bg-light': 'rgba(58, 58, 58, 1)',
    '--card-gradient-start': 'rgba(58, 58, 58, 1)',
    '--card-gradient-end': 'rgba(70, 70, 70, 0.9)',
    '--button-text-dark': '#000000',
    '--button-text-light': '#ffffff',
    '--hover-bg': 'rgba(208, 208, 208, 0.1)',
    '--success-color': 'rgba(16, 185, 129, 1)',
    '--error-color': 'rgba(239, 68, 68, 1)',
    '--warning-color': 'rgba(245, 158, 11, 1)',
    '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.25)',
    '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.35), 0 2px 4px -1px rgba(0, 0, 0, 0.08)',
    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.45), 0 4px 6px -2px rgba(0, 0, 0, 0.07)'
  },
  purdue: {
    '--bg-color': 'rgba(26, 22, 18, 1)',
    '--section-bg': 'rgba(42, 36, 31, 1)',
    '--card-bg': 'rgba(61, 52, 42, 1)',
    '--primary-color': 'rgba(207, 181, 59, 1)',
    '--primary-dark': 'rgba(177, 157, 46, 1)',
    '--secondary-color': 'rgba(139, 115, 85, 1)',
    '--text-color': 'rgba(240, 240, 240, 1)',
    '--text-light': 'rgba(240, 240, 240, 1)',
    '--text-faded': 'rgba(197, 197, 197, 1)',
    '--text-muted': 'rgba(197, 197, 197, 0.7)',
    '--border-color': 'rgba(93, 74, 55, 1)',
    '--border-light': 'rgba(93, 74, 55, 0.5)',
    '--primary-color-rgb': '207, 181, 59',
    '--secondary-color-rgb': '139, 115, 85',
    '--icon-color': '#3d342a',
    '--icon-bg': 'rgba(207, 181, 59, 0.2)',
    '--icon-border': 'rgba(207, 181, 59, 0.6)',
    '--bg-light': 'rgba(61, 52, 42, 1)',
    '--card-gradient-start': 'rgba(61, 52, 42, 1)',
    '--card-gradient-end': 'rgba(207, 181, 59, 0.7)',
    '--button-text-dark': '#1a1612',
    '--button-text-light': '#ffffff',
    '--hover-bg': 'rgba(207, 181, 59, 0.15)',
    '--success-color': 'rgba(16, 185, 129, 1)',
    '--error-color': 'rgba(239, 68, 68, 1)',
    '--warning-color': 'rgba(245, 158, 11, 1)',
    '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  },
  pacers: {
    '--bg-color': 'rgba(10, 25, 41, 1)',
    '--section-bg': 'rgba(30, 42, 58, 1)',
    '--card-bg': 'rgba(45, 55, 72, 1)',
    '--primary-color': 'rgba(253, 187, 48, 1)',
    '--primary-dark': 'rgba(230, 168, 41, 1)',
    '--secondary-color': 'rgba(74, 144, 226, 1)',
    '--text-color': 'rgba(240, 240, 240, 1)',
    '--text-light': 'rgba(240, 240, 240, 1)',
    '--text-faded': 'rgba(197, 197, 197, 1)',
    '--text-muted': 'rgba(197, 197, 197, 0.7)',
    '--border-color': 'rgba(61, 75, 97, 1)',
    '--border-light': 'rgba(61, 75, 97, 0.5)',
    '--primary-color-rgb': '253, 187, 48',
    '--secondary-color-rgb': '74, 144, 226',
    '--icon-color': '#00285e',
    '--icon-bg': 'rgba(0, 40, 94, 0.2)',
    '--icon-border': 'rgba(0, 40, 94, 0.4)',
    '--bg-light': 'rgba(45, 55, 72, 1)',
    '--card-gradient-start': 'rgba(45, 55, 72, 1)',
    '--card-gradient-end': 'rgba(253, 187, 48, 0.7)',
    '--button-text-dark': '#0a1929',
    '--button-text-light': '#ffffff',
    '--hover-bg': 'rgba(253, 187, 48, 0.1)',
    '--success-color': 'rgba(16, 185, 129, 1)',
    '--error-color': 'rgba(239, 68, 68, 1)',
    '--warning-color': 'rgba(245, 158, 11, 1)',
    '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  }
}

const currentTheme = ref('pacers')

export function useTheme() {
  const setTheme = (themeName) => {
    if (themes[themeName]) {
      currentTheme.value = themeName
      const root = document.documentElement
      root.setAttribute('data-theme', themeName)
      Object.entries(themes[themeName]).forEach(([property, value]) => {
        root.style.setProperty(property, value)
      })
    }
  }

  const getThemeDisplayName = (themeName) => {
    const displayNames = {
      forest: '🌲 Forest',
      ocean: '🌊 Ocean', 
      monochrome: '⚫ Monochrome',
      purdue: '🚂 Purdue',
      pacers: '🏀🌽 Pacers'
    }
    return displayNames[themeName] || themeName
  }

  return {
    currentTheme: computed(() => currentTheme.value),
    setTheme,
    availableThemes: Object.keys(themes),
    getThemeDisplayName
  }
}