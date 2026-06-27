/**
 * Accessibility color palettes for target rendering.
 * Provides alternative color schemes for common color vision deficiencies.
 */

export type ColorVisionMode = 'default' | 'protanopia' | 'deuteranopia' | 'tritanopia';

export interface ColorPalette {
  id: ColorVisionMode;
  name: string;
  description: string;
  colors: {
    targetPrimary: string;
    targetSecondary: string;
    targetHit: string;
    targetMiss: string;
    crosshair: string;
    background: string;
  };
  cssVariables: Record<string, string>;
}

export const COLOR_PALETTES: Record<ColorVisionMode, ColorPalette> = {
  default: {
    id: 'default',
    name: 'Default',
    description: 'Standard color palette',
    colors: {
      targetPrimary: '#ff4444',
      targetSecondary: '#ff8800',
      targetHit: '#44ff44',
      targetMiss: '#ff0000',
      crosshair: '#ffffff',
      background: '#1a1a2e',
    },
    cssVariables: {
      '--target-primary': '#ff4444',
      '--target-secondary': '#ff8800',
      '--target-hit': '#44ff44',
      '--target-miss': '#ff0000',
      '--crosshair-color': '#ffffff',
      '--game-background': '#1a1a2e',
    },
  },
  protanopia: {
    id: 'protanopia',
    name: 'Protanopia',
    description: 'Optimized for red-blind color vision (protanopia)',
    colors: {
      targetPrimary: '#0077bb',
      targetSecondary: '#ffdd00',
      targetHit: '#00ccff',
      targetMiss: '#ff9900',
      crosshair: '#ffffff',
      background: '#1a1a2e',
    },
    cssVariables: {
      '--target-primary': '#0077bb',
      '--target-secondary': '#ffdd00',
      '--target-hit': '#00ccff',
      '--target-miss': '#ff9900',
      '--crosshair-color': '#ffffff',
      '--game-background': '#1a1a2e',
    },
  },
  deuteranopia: {
    id: 'deuteranopia',
    name: 'Deuteranopia',
    description: 'Optimized for green-blind color vision (deuteranopia)',
    colors: {
      targetPrimary: '#cc79a7',
      targetSecondary: '#0072b2',
      targetHit: '#56b4e9',
      targetMiss: '#d55e00',
      crosshair: '#ffffff',
      background: '#1a1a2e',
    },
    cssVariables: {
      '--target-primary': '#cc79a7',
      '--target-secondary': '#0072b2',
      '--target-hit': '#56b4e9',
      '--target-miss': '#d55e00',
      '--crosshair-color': '#ffffff',
      '--game-background': '#1a1a2e',
    },
  },
  tritanopia: {
    id: 'tritanopia',
    name: 'Tritanopia',
    description: 'Optimized for blue-blind color vision (tritanopia)',
    colors: {
      targetPrimary: '#e73c3c',
      targetSecondary: '#44aa44',
      targetHit: '#66dd66',
      targetMiss: '#cc3333',
      crosshair: '#ffffff',
      background: '#1a1a2e',
    },
    cssVariables: {
      '--target-primary': '#e73c3c',
      '--target-secondary': '#44aa44',
      '--target-hit': '#66dd66',
      '--target-miss': '#cc3333',
      '--crosshair-color': '#ffffff',
      '--game-background': '#1a1a2e',
    },
  },
};

const PALETTE_STORAGE_KEY = 'aimtrainer-color-palette';

/**
 * Checks if a string is a valid color vision mode.
 */
export function isValidColorMode(mode: string): mode is ColorVisionMode {
  return mode === 'default' || mode === 'protanopia' || mode === 'deuteranopia' || mode === 'tritanopia';
}

/**
 * Gets the color palette for a given mode.
 * Returns the default palette if the mode is invalid.
 */
export function getColorPalette(mode: ColorVisionMode): ColorPalette {
  return COLOR_PALETTES[mode] ?? COLOR_PALETTES.default;
}

/**
 * Applies a color palette by setting CSS custom properties on the document root.
 */
export function applyColorPalette(mode: ColorVisionMode): void {
  const palette = getColorPalette(mode);
  const root = document.documentElement;

  for (const [variable, value] of Object.entries(palette.cssVariables)) {
    root.style.setProperty(variable, value);
  }

  // Persist selection in localStorage
  localStorage.setItem(PALETTE_STORAGE_KEY, mode);
}

/**
 * Loads the persisted color palette preference from localStorage.
 * Returns 'default' if no preference is stored or the stored value is invalid.
 */
export function loadPersistedPalette(): ColorVisionMode {
  const stored = localStorage.getItem(PALETTE_STORAGE_KEY);
  if (stored && isValidColorMode(stored)) {
    return stored;
  }
  return 'default';
}

/**
 * Returns all available color palette options (for UI rendering).
 */
export function getAvailablePalettes(): ColorPalette[] {
  return Object.values(COLOR_PALETTES);
}
