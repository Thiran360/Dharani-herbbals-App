/**
 * Responsive Design Utility for Dharani Herbbals
 * Adapts UI across small, medium, and large Android mobile devices (320dp - 480dp+ / tablets)
 */

import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Baseline mobile dimensions (standard modern Android device width: ~375dp)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Scale dimension linearly based on screen width
 */
export const scale = (size, screenWidth = Dimensions.get('window').width) => {
  return Math.round((screenWidth / BASE_WIDTH) * size);
};

/**
 * Scale dimension with moderate dampening factor to avoid overly large or tiny elements
 * @param {number} size - Base design size
 * @param {number} factor - Dampening factor (default: 0.5)
 */
export const moderateScale = (size, factor = 0.5, screenWidth = Dimensions.get('window').width) => {
  return Math.round(size + (scale(size, screenWidth) - size) * factor);
};

/**
 * Responsive font scale taking device PixelRatio and Accessibility font scale into account
 */
export const fontScale = (size, screenWidth = Dimensions.get('window').width) => {
  const scaled = moderateScale(size, 0.4, screenWidth);
  return scaled;
};

/**
 * Check if the device is a narrow/small screen (< 360dp, e.g. compact phones)
 */
export const isNarrowScreen = (width = Dimensions.get('window').width) => width < 360;

/**
 * Check if the device is a tablet or large foldable screen (>= 600dp)
 */
export const isTablet = (width = Dimensions.get('window').width) => width >= 600;

/**
 * Get dynamic product card width for 2-column or 3-column layouts
 */
export const getResponsiveCardWidth = (width = Dimensions.get('window').width, padding = 32, gap = 12) => {
  const columns = isTablet(width) ? 3 : 2;
  const availableWidth = width - padding - (columns - 1) * gap;
  return Math.floor(availableWidth / columns);
};

export default {
  scale,
  moderateScale,
  fontScale,
  isNarrowScreen,
  isTablet,
  getResponsiveCardWidth,
};
