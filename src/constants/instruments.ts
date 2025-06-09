export const INSTRUMENTS = {
  'Centrifuge': ['Spin', 'Balance', 'Load/Unload'],
  'Liquid Handler': ['Transfer', 'Prime Tips', 'Wash Tips', 'Run Method'],
  'Plate Reader': ['Read Absorbance', 'Read Fluorescence', 'Kinetic Read'],
  'Plate Sealer': ['Heat Seal', 'Pressure Seal', 'Apply Film'],
  'Plate Peeler': ['Peel Seal', 'Remove Film'],
  'Incubator': ['Incubate', 'Set Temperature', 'Orbital Shake'],
  'Plate Shaker': ['Orbital Mix', 'Linear Shake', 'Vortex'],
  'Bulk Dispenser': ['Dispense Reagent', 'Prime Lines', 'Load Tips'],
  'Storage': ['Get', 'Store', 'Transfer']
} as const

export const DEFAULT_DURATIONS: Record<string, number> = {
  'Centrifuge': 12,
  'Liquid Handler': 15,
  'Plate Reader': 4,
  'Plate Sealer': 3,
  'Plate Peeler': 2,
  'Incubator': 60,
  'Plate Shaker': 20,
  'Bulk Dispenser': 8,
  'Storage': 2
}

export const INSTRUMENT_ICONS: Record<string, string> = {
  'Centrifuge': 'fas fa-circle-notch',
  'Liquid Handler': 'fas fa-syringe',
  'Plate Reader': 'fas fa-microscope',
  'Plate Sealer': 'fas fa-stamp',
  'Plate Peeler': 'fas fa-tape',
  'Incubator': 'fas fa-temperature-high',
  'Plate Shaker': 'fas fa-blender',
  'Bulk Dispenser': 'fas fa-tint',
  'Storage': 'fas fa-box'
}

// Color schemes for different themes
export const INSTRUMENT_COLOR_SCHEMES = {
  default: {
    'Centrifuge': '#3b82f6',        // Blue
    'Liquid Handler': '#10b981',    // Emerald
    'Plate Reader': '#8b5cf6',      // Violet
    'Plate Sealer': '#f59e0b',      // Amber
    'Plate Peeler': '#ef4444',      // Red
    'Incubator': '#f97316',         // Orange
    'Plate Shaker': '#06b6d4',      // Cyan
    'Bulk Dispenser': '#84cc16',    // Lime
    'Storage': '#6b7280'            // Gray
  },
  naturals: {
    'Centrifuge': '#059669',        // Emerald 600
    'Liquid Handler': '#0d9488',    // Teal 600
    'Plate Reader': '#7c2d12',      // Orange 900
    'Plate Sealer': '#92400e',      // Amber 800
    'Plate Peeler': '#991b1b',      // Red 800
    'Incubator': '#9a3412',         // Orange 800
    'Plate Shaker': '#155e75',      // Cyan 800
    'Bulk Dispenser': '#365314',    // Lime 900
    'Storage': '#374151'            // Gray 700
  },
  blues: {
    'Centrifuge': '#1e40af',        // Blue 800
    'Liquid Handler': '#1e3a8a',    // Blue 900
    'Plate Reader': '#312e81',      // Indigo 900
    'Plate Sealer': '#1e1b4b',      // Indigo 950
    'Plate Peeler': '#0c4a6e',      // Sky 900
    'Incubator': '#0e7490',         // Cyan 700
    'Plate Shaker': '#164e63',      // Cyan 800
    'Bulk Dispenser': '#0f172a',    // Slate 900
    'Storage': '#334155'            // Slate 700
  },
  monochrome: {
    'Centrifuge': '#1f2937',        // Gray 800
    'Liquid Handler': '#374151',    // Gray 700
    'Plate Reader': '#4b5563',      // Gray 600
    'Plate Sealer': '#6b7280',      // Gray 500
    'Plate Peeler': '#9ca3af',      // Gray 400
    'Incubator': '#d1d5db',         // Gray 300
    'Plate Shaker': '#e5e7eb',      // Gray 200
    'Bulk Dispenser': '#f3f4f6',    // Gray 100
    'Storage': '#111827'            // Gray 900
  }
} as const

// Function to get instrument color based on current theme
export function getInstrumentColor(instrument: string, theme: string = 'default'): string {
  const scheme = INSTRUMENT_COLOR_SCHEMES[theme as keyof typeof INSTRUMENT_COLOR_SCHEMES] || INSTRUMENT_COLOR_SCHEMES.default
  return scheme[instrument as keyof typeof scheme] || INSTRUMENT_COLOR_SCHEMES.default[instrument as keyof typeof INSTRUMENT_COLOR_SCHEMES.default] || '#6b7280'
}

// Function to get contrasting text color for instrument backgrounds
export function getInstrumentTextColor(instrument: string, theme: string = 'default'): string {
  const bgColor = getInstrumentColor(instrument, theme)
  
  // Simple luminance calculation to determine if we need light or dark text
  const hex = bgColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  return luminance > 0.5 ? '#1f2937' : '#ffffff' // Dark text for light bg, light text for dark bg
}

export type InstrumentType = keyof typeof INSTRUMENTS
export type ColorScheme = keyof typeof INSTRUMENT_COLOR_SCHEMES