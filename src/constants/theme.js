/**
 * Dharani Herbbals Premium Design System & Theme
 * Refined botanical wellness luxury palette
 */

export const COLORS = {
  // Brand Greens - Deep Forest & Botanical
  primary: '#1B4D3E',        // Deep forest green (luxury botanical anchor)
  primaryLight: '#2D6A56',   // Medium forest green
  primaryDark: '#133E2B',    // Deep evergreen
  primaryDarker: '#0B291B',  // Rich dark pine
  secondary: '#5B8266',      // Soft sage herbal green
  accent: '#10B981',         // Fresh emerald accent
  accentLight: '#E8F5E9',    // Pale mint tint

  // Botanical Warmth & Gold Accents
  accentGold: '#C8963E',     // Subtle champagne gold
  accentWarm: '#D4A373',     // Warm earth / sandalwood
  accentTerracotta: '#C25E3E', // Refined terracotta

  // Soft Sage & Earth Tones
  sage: '#E8EFE9',           // Soft sage background
  sageLight: '#F3F7F4',      // Ultra soft sage tint
  sageMedium: '#A3B899',     // Muted sage border/pill
  sageDark: '#4A6B53',       // Deep sage text

  // Backgrounds & Warm Ivory Surfaces
  background: '#FAF8F5',     // Warm ivory / natural cream
  backgroundAlt: '#F4EFE6',  // Natural herbal beige
  card: '#FFFFFF',           // Crisp pure white cards
  surface: '#FFFFFF',
  surfaceSubtle: '#F7F5F0',  // Warm cream surface
  surfaceElevated: '#FFFFFF',

  // Typography - Deep Slate Forest
  text: '#14231A',           // Deep charcoal forest
  textSecondary: '#5A6E62',  // Muted sage slate
  textLight: '#8F9F94',      // Subtle placeholder
  textInverse: '#FFFFFF',
  textTamil: '#1B4D3E',      // Highlight for Tamil script

  // Accents, Badges & Status
  badgeNew: '#1B4D3E',       // Forest green badge
  badgeOffer: '#D9534F',     // Refined botanical terracotta red
  badgeGold: '#F59E0B',
  gold: '#D97706',           // Rating stars
  starEmpty: '#E2E8F0',

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Borders & Dividers
  border: 'rgba(27, 77, 62, 0.08)',
  borderLight: 'rgba(27, 77, 62, 0.05)',
  borderActive: '#1B4D3E',
  divider: 'rgba(27, 77, 62, 0.06)',

  // Shadows
  shadowColor: '#0B291B',
};

export const TYPOGRAPHY = {
  fontFamily: 'System',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    hero: 28,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  hero: 32,
};

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 7,
  },
};

export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  SHADOWS,
};

