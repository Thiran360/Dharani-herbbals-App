import {
  getLocalizedProductName,
  getLocalizedProductDescription,
  getLocalizedCategoryName,
} from '../src/utils/localization';

describe('Strict Product & Category Language Switching', () => {
  const nalanguProduct = {
    id: 1158,
    name: 'Nalangu Powder Jar',
    tamil_name: 'நலங்கு மாவு ஜார்',
    description: 'Nalangu maavu can make skin look better and have a natural glow when used regularly.',
    category_name: 'Baby',
  };

  const wildTurmericProduct = {
    id: 1243,
    name: 'Wild Turmeric',
    tamil_name: 'கஸ்தூரி மஞ்சள்',
    description: 'For black spots, pimples, mild wounds and cuts, to have healthy skin.',
    category_name: 'Skin',
  };

  const bilingualProduct = {
    id: 1263,
    name: 'Cucumber gel (GC)',
    tamil_name: 'வெள்ளரிக்காய் ஜெல் (GC)',
    description: `Makil Cucumber Gel is enriched with the natural freshness of cucumber to help soothe, hydrate, and refresh the skin.\n\nமகில் குக்கம்பர் ஜெல் இயற்கையான வெள்ளரிக்காயின் புத்துணர்ச்சியுடன் தயாரிக்கப்பட்டது. இது தோலை குளிர்ச்சியூட்டவும், ஈரப்பதமாக வைத்திருக்கவும், மென்மையாக்கவும் உதவுகிறது.`,
    category_name: 'Skin',
  };

  describe('Nalangu Powder Jar & Wild Turmeric Testing', () => {
    test('displays English product names strictly when English is selected', () => {
      expect(getLocalizedProductName(nalanguProduct, 'en')).toBe('Nalangu Powder Jar');
      expect(getLocalizedProductName(wildTurmericProduct, 'en')).toBe('Wild Turmeric');
    });

    test('displays Tamil product names strictly when Tamil is selected', () => {
      expect(getLocalizedProductName(nalanguProduct, 'ta')).toBe('நலங்கு மாவு ஜார்');
      expect(getLocalizedProductName(wildTurmericProduct, 'ta')).toBe('கஸ்தூரி மஞ்சள்');
    });
  });

  describe('Missing Translation Fallback Policy', () => {
    test('falls back to English name if Tamil translation is missing in Tamil mode', () => {
      const productNoTamil = { id: 9999, name: 'Rare Herbal Bark', tamil_name: '' };
      expect(getLocalizedProductName(productNoTamil, 'ta')).toBe('Rare Herbal Bark');
    });

    test('falls back to Tamil name if English name is missing in English mode', () => {
      const productNoEnglish = { id: 9998, name: '', tamil_name: 'அரிய மூலிகைப் பட்டை' };
      expect(getLocalizedProductName(productNoEnglish, 'en')).toBe('அரிய மூலிகைப் பட்டை');
    });

    test('handles empty / undefined product gracefully', () => {
      expect(getLocalizedProductName(null, 'en')).toBe('');
      expect(getLocalizedProductName(undefined, 'ta')).toBe('');
    });
  });

  describe('Product Description Localization', () => {
    test('isolates English description in English mode for bilingual content', () => {
      const descEn = getLocalizedProductDescription(bilingualProduct, 'en');
      expect(descEn).toContain('Makil Cucumber Gel is enriched');
      expect(descEn).not.toContain('மகில் குக்கம்பர் ஜெல்');
    });

    test('isolates Tamil description in Tamil mode for bilingual content', () => {
      const descTa = getLocalizedProductDescription(bilingualProduct, 'ta');
      expect(descTa).toContain('மகில் குக்கம்பர் ஜெல்');
      expect(descTa).not.toContain('Makil Cucumber Gel is enriched');
    });

    test('preserves English description as fallback when no Tamil section exists', () => {
      const descTa = getLocalizedProductDescription(nalanguProduct, 'ta');
      expect(descTa).toBe(nalanguProduct.description);
    });
  });

  describe('Category Localization', () => {
    test('localizes category names in English and Tamil', () => {
      expect(getLocalizedCategoryName('Baby', 'en')).toBe('Baby');
      expect(getLocalizedCategoryName('Baby', 'ta')).toBe('குழந்தை பராமரிப்பு');

      expect(getLocalizedCategoryName('Skin', 'en')).toBe('Skin');
      expect(getLocalizedCategoryName('Skin', 'ta')).toBe('தோல் பராமரிப்பு');

      expect(getLocalizedCategoryName('Health & Wellness', 'en')).toBe('Health & Wellness');
      expect(getLocalizedCategoryName('Health & Wellness', 'ta')).toBe('ஆரோக்கியம் & நலவாழ்வு');
    });

    test('localizes category objects with nameTa', () => {
      const catObj = { id: 8, name: 'Baby', nameTa: 'குழந்தை பராமரிப்பு' };
      expect(getLocalizedCategoryName(catObj, 'en')).toBe('Baby');
      expect(getLocalizedCategoryName(catObj, 'ta')).toBe('குழந்தை பராமரிப்பு');
    });
  });
});
