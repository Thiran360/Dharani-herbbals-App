import { HERO_BANNERS } from '../src/constants/banners';

describe('Hero Banners & Slider Styling Validation', () => {
  test('HERO_BANNERS contains 5 coordinated herbal banners', () => {
    expect(HERO_BANNERS).toHaveLength(5);
  });

  test('All banners have non-white herbal background colors (soft sage / mint / herbal green)', () => {
    HERO_BANNERS.forEach(banner => {
      expect(banner.bgGradient).toBeDefined();
      expect(banner.bgGradient.length).toBeGreaterThanOrEqual(1);

      const primaryColor = banner.bgGradient[0];
      // Must not be white or near-white (#F...)
      expect(primaryColor.toUpperCase()).not.toMatch(/^#F/);
      expect(primaryColor.toUpperCase()).not.toBe('#FFFFFF');

      // Must be a soft green/sage/mint hex code starting with #C or #D
      expect(primaryColor.toUpperCase()).toMatch(/^#[CD][0-9A-F]{5}$/);
    });
  });

  test('All banners contain required fields for layout and navigation', () => {
    HERO_BANNERS.forEach(banner => {
      expect(banner.id).toBeDefined();
      expect(banner.title).toBeTruthy();
      expect(banner.titleTa).toBeTruthy();
      expect(banner.subtitle).toBeTruthy();
      expect(banner.subtitleTa).toBeTruthy();
      expect(banner.image).toBeDefined();
      expect(banner.drawableName).toBeTruthy();
      expect(banner.accentColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(banner.tag).toBeTruthy();
      expect(banner.categoryName).toBeTruthy();
      expect(banner.categoryId).toBeGreaterThan(0);
    });
  });

  test('Each banner has a distinct complementary herbal shade', () => {
    const primaryColors = HERO_BANNERS.map(b => b.bgGradient[0]);
    const uniqueColors = new Set(primaryColors);
    expect(uniqueColors.size).toBe(5);
  });

  test('Every slide maps to its own distinct and correct product image asset', () => {
    const hairBanner = HERO_BANNERS.find(b => b.id === 'b1');
    expect(hairBanner.title).toContain('Chemparuthi');
    expect(hairBanner.drawableName).toBe('src_assets_hair_banner_transparentc6zbznzf');
    expect(hairBanner.categoryName).toBe('Hair');

    const soapBanner = HERO_BANNERS.find(b => b.id === 'b2');
    expect(soapBanner.title).toContain('Kuppaimeni Soaps');
    expect(soapBanner.drawableName).toBe('src_assets_body_soap_transparentbnlixny2');
    expect(soapBanner.categoryName).toBe('Body');

    const foodBanner = HERO_BANNERS.find(b => b.id === 'b3');
    expect(foodBanner.title).toContain('Pirandai');
    expect(foodBanner.drawableName).toBe('src_assets_pirandai_pickle_transparent_v2cmthv3jp');
    expect(foodBanner.categoryName).toBe('Food');

    const healthBanner = HERO_BANNERS.find(b => b.id === 'b4');
    expect(healthBanner.title).toContain('Health Mix');
    expect(healthBanner.drawableName).toBe('src_assets_sathu_maavu_transparentbqkybcxr');
    expect(healthBanner.categoryName).toBe('Health & Wellness');

    const skinBanner = HERO_BANNERS.find(b => b.id === 'b5');
    expect(skinBanner.title).toContain('Face Pack');
    expect(skinBanner.drawableName).toBe('src_assets_aloe_vera_face_pack_transparentpx6huvsp');
    expect(skinBanner.categoryName).toBe('Skin');

    // Ensure all 5 drawables are unique
    const drawables = HERO_BANNERS.map(b => b.drawableName);
    expect(new Set(drawables).size).toBe(5);
  });

  test('BannerSlider module exports both named and default component safely', () => {
    const { BannerSlider, default: DefaultBannerSlider } = require('../src/components/common/BannerSlider');
    expect(BannerSlider).toBeDefined();
    expect(typeof BannerSlider).toBe('function');
    expect(DefaultBannerSlider).toBeDefined();
    expect(DefaultBannerSlider).toBe(BannerSlider);
  });
});

