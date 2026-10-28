/**
 * Automated Unit Tests for Dharani Herbbals Category Image Mapping
 */

import {
  STATIC_CATEGORIES,
  getCategoryLocalImage,
  getCategoryRemoteImage,
  CATEGORY_REMOTE_IMAGES,
} from '../src/constants/categories';

describe('Explore Categories Image & ID Mapping Validation', () => {
  test('all 8 authentic categories are present in STATIC_CATEGORIES with correct backend IDs', () => {
    expect(STATIC_CATEGORIES).toHaveLength(8);

    const categoryIds = STATIC_CATEGORIES.map(c => c.id).sort((a, b) => a - b);
    expect(categoryIds).toEqual([2, 4, 5, 6, 7, 8, 9, 10]);
  });

  test('Food category (ID 5) maps to Food assets (Pirandai Pickle), NOT Hair shampoo', () => {
    const foodCat = STATIC_CATEGORIES.find(c => c.id === 5);
    expect(foodCat).toBeDefined();
    expect(foodCat.name).toBe('Food');
    expect(foodCat.image).toContain('Pirandai_Pickel.jpeg');
    expect(foodCat.image).not.toContain('Chemparuthi');
    expect(foodCat.image).not.toContain('Hibiscus');

    const localImg = getCategoryLocalImage({ id: 5, name: 'Food' });
    expect(localImg).toBeDefined();

    const remoteImg = getCategoryRemoteImage({ id: 5, name: 'Food' });
    expect(remoteImg).toBe('https://vedanmart.com/images/category/Pirandai_Pickel.jpeg');
  });

  test('Poojas category (ID 9) maps to Poojas assets (Deepa Oil), NOT Food pickle', () => {
    const poojaCat = STATIC_CATEGORIES.find(c => c.id === 9);
    expect(poojaCat).toBeDefined();
    expect(poojaCat.name).toBe('Poojas');
    expect(poojaCat.image).toContain('Deepa_oil.jpeg');
    expect(poojaCat.image).not.toContain('Pirandai');

    const localImg = getCategoryLocalImage({ id: 9, name: 'Poojas' });
    expect(localImg).toBeDefined();

    const remoteImg = getCategoryRemoteImage({ id: 9, name: 'Poojas' });
    expect(remoteImg).toBe('https://vedanmart.com/images/category/Deepa_oil.jpeg');
  });

  test('Skin category (ID 6) maps to Skin assets (Multani Mitti / Aloe Face Pack), NOT Deepa Oil', () => {
    const skinCat = STATIC_CATEGORIES.find(c => c.id === 6);
    expect(skinCat).toBeDefined();
    expect(skinCat.name).toBe('Skin');
    expect(skinCat.image).toContain('MULTHANI_METTI_JAR.jpeg');
    expect(skinCat.image).not.toContain('Deepa');

    const localImg = getCategoryLocalImage({ id: 6, name: 'Skin' });
    expect(localImg).toBeDefined();

    const remoteImg = getCategoryRemoteImage({ id: 6, name: 'Skin' });
    expect(remoteImg).toBe('https://vedanmart.com/images/category/MULTHANI_METTI_JAR.jpeg');
  });

  test('Hair category (ID 2) maps to Hair assets (Hibiscus Shampoo)', () => {
    const hairCat = STATIC_CATEGORIES.find(c => c.id === 2);
    expect(hairCat).toBeDefined();
    expect(hairCat.name).toBe('Hair');
    expect(hairCat.image).toContain('HibiscusShampoo.jpeg');

    const localImg = getCategoryLocalImage({ id: 2, name: 'Hair' });
    expect(localImg).toBeDefined();

    const remoteImg = getCategoryRemoteImage({ id: 2, name: 'Hair' });
    expect(remoteImg).toBe('https://vedanmart.com/images/category/HibiscusShampoo.jpeg');
  });

  test('Baby (ID 8), Beverages (ID 10), Body (ID 4), and Health (ID 7) map correctly', () => {
    const baby = STATIC_CATEGORIES.find(c => c.id === 8);
    expect(baby.name).toBe('Baby');
    expect(baby.image).toContain('Nalangu_Powder.jpeg');

    const bev = STATIC_CATEGORIES.find(c => c.id === 10);
    expect(bev.name).toBe('Beverages');
    expect(bev.image).toContain('NannariSherbet.jpeg');

    const body = STATIC_CATEGORIES.find(c => c.id === 4);
    expect(body.name).toBe('Body');
    expect(body.image).toContain('Kuppaimeni_Soap.jpeg');

    const health = STATIC_CATEGORIES.find(c => c.id === 7);
    expect(health.name).toBe('Health & Wellness');
    expect(health.image).toContain('KARUPPU_KAVUNI_HEALTH_MIX(JAR).jpeg');
  });

  test('Simulating Django API response mapping does not cause image mismatch or cross-contamination', () => {
    const mockApiResponse = [
      { id: 8, name: 'Baby', image: 'https://vedanmart.com/images/category/Nalangu_Powder.jpeg' },
      { id: 10, name: 'Beverages', image: 'https://vedanmart.com/images/category/NannariSherbet.jpeg' },
      { id: 4, name: 'Body', image: 'https://vedanmart.com/images/category/Kuppaimeni_Soap.jpeg' },
      { id: 5, name: 'Food', image: 'https://vedanmart.com/images/category/Pirandai_Pickel.jpeg' },
      { id: 2, name: 'Hair', image: 'https://vedanmart.com/images/category/HibiscusShampoo.jpeg' },
      { id: 7, name: 'Health & Wellness', image: 'https://vedanmart.com/images/category/KARUPPU_KAVUNI_HEALTH_MIX(JAR).jpeg' },
      { id: 9, name: 'Poojas', image: 'https://vedanmart.com/images/category/Deepa_oil.jpeg' },
      { id: 6, name: 'Skin', image: 'https://vedanmart.com/images/category/MULTHANI_METTI_JAR.jpeg' },
    ];

    const mapped = mockApiResponse.map(apiCat => {
      const apiNameLower = (apiCat.name || '').trim().toLowerCase();
      const staticMatch = STATIC_CATEGORIES.find(
        s => s.id === apiCat.id || s.name.toLowerCase() === apiNameLower
      );
      const localImg = staticMatch?.localImage || getCategoryLocalImage(apiCat);
      const remoteImg = (apiCat.image && typeof apiCat.image === 'string' && apiCat.image.startsWith('http'))
        ? apiCat.image
        : (staticMatch?.image || getCategoryRemoteImage(apiCat));

      return {
        ...staticMatch,
        ...apiCat,
        id: apiCat.id ?? staticMatch?.id,
        name: apiCat.name || staticMatch?.name,
        nameTa: staticMatch?.nameTa || apiCat.nameTa,
        description: staticMatch?.description || apiCat.description,
        image: remoteImg,
        localImage: localImg,
      };
    });

    mapped.forEach(cat => {
      expect(cat.id).toBeDefined();
      expect(cat.name).toBeDefined();
      expect(cat.localImage).toBeDefined();
      expect(cat.image).toMatch(/^https:\/\/vedanmart\.com\/images\/category\//);

      // Verify strict name-to-image containment
      if (cat.name === 'Food') {
        expect(cat.image).toContain('Pirandai');
        expect(cat.image).not.toContain('Hibiscus');
      }
      if (cat.name === 'Hair') {
        expect(cat.image).toContain('Hibiscus');
        expect(cat.image).not.toContain('Pirandai');
      }
      if (cat.name === 'Poojas') {
        expect(cat.image).toContain('Deepa');
        expect(cat.image).not.toContain('Pirandai');
      }
      if (cat.name === 'Skin') {
        expect(cat.image).toContain('MULTHANI');
        expect(cat.image).not.toContain('Deepa');
      }
    });
  });
});
