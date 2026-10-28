/**
 * Responsive Design Unit Tests for Dharani Herbbals
 */

import {
  scale,
  moderateScale,
  fontScale,
  isNarrowScreen,
  isTablet,
  getResponsiveCardWidth,
} from '../src/utils/responsive';

describe('Responsive Utilities', () => {
  describe('Screen category detection', () => {
    it('correctly detects narrow mobile screens (< 360dp)', () => {
      expect(isNarrowScreen(320)).toBe(true);
      expect(isNarrowScreen(359)).toBe(true);
      expect(isNarrowScreen(360)).toBe(false);
      expect(isNarrowScreen(412)).toBe(false);
    });

    it('correctly detects tablet/large screen devices (>= 600dp)', () => {
      expect(isTablet(360)).toBe(false);
      expect(isTablet(412)).toBe(false);
      expect(isTablet(599)).toBe(false);
      expect(isTablet(600)).toBe(true);
      expect(isTablet(768)).toBe(true);
      expect(isTablet(1024)).toBe(true);
    });
  });

  describe('Dimension Scaling', () => {
    it('scales dimensions linearly with screen width', () => {
      // 375 is baseline
      expect(scale(100, 375)).toBe(100);
      // On 320 (small device), scale should be smaller
      expect(scale(100, 320)).toBeLessThan(100);
      // On 450 (large device), scale should be larger
      expect(scale(100, 450)).toBeGreaterThan(100);
    });

    it('moderateScale dampens scaling to prevent extremes', () => {
      const base = 20;
      const smallWidth = 320;
      const linearScaled = scale(base, smallWidth);
      const moderatelyScaled = moderateScale(base, 0.5, smallWidth);

      expect(moderatelyScaled).toBeGreaterThanOrEqual(linearScaled);
      expect(moderatelyScaled).toBeLessThanOrEqual(base);
    });

    it('fontScale ensures readable text sizes across small and large phones', () => {
      const baseFont = 14;
      const smallScreenFont = fontScale(baseFont, 320);
      const largeScreenFont = fontScale(baseFont, 412);

      expect(smallScreenFont).toBeGreaterThanOrEqual(12);
      expect(largeScreenFont).toBeLessThanOrEqual(16);
    });
  });

  describe('Dynamic Product Card Width', () => {
    it('calculates 2-column widths on mobile devices', () => {
      const width320 = getResponsiveCardWidth(320, 24, 8);
      const width375 = getResponsiveCardWidth(375, 24, 8);
      const width412 = getResponsiveCardWidth(412, 24, 8);

      expect(width320).toBeGreaterThan(130);
      expect(width320).toBeLessThan(150);

      expect(width375).toBeGreaterThan(160);
      expect(width375).toBeLessThan(180);

      expect(width412).toBeGreaterThan(180);
    });

    it('calculates 3-column widths on tablet devices', () => {
      const width768 = getResponsiveCardWidth(768, 32, 12);
      expect(width768).toBeGreaterThan(200);
      // 3 cards + gaps + padding should fit within 768
      expect(width768 * 3 + 24 + 32).toBeLessThanOrEqual(768);
    });
  });
});
