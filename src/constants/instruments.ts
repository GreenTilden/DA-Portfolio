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

export type InstrumentType = keyof typeof INSTRUMENTS