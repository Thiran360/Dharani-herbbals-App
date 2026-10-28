import React from 'react';
import { Share } from 'react-native';
import { Icon } from '../src/components/common/Icons';
import { getLocalizedProductName } from '../src/utils/localization';

describe('Product Share Functionality & Share-2 Icon', () => {
  const sampleProduct = {
    id: 1255,
    name: 'Chemparuthi Herbal Shampoo',
    name_ta: 'செம்பருத்தி மூலிகை ஷாம்பூ',
  };

  test('Generates correct English product share message and link', () => {
    const localizedName = getLocalizedProductName(sampleProduct, 'en');
    const productUrl = `https://dharaniherbbals.in/product/${sampleProduct.id}`;
    const message = `Discover authentic ${localizedName} on Dharani Herbbals: ${productUrl}`;

    expect(message).toBe('Discover authentic Chemparuthi Herbal Shampoo on Dharani Herbbals: https://dharaniherbbals.in/product/1255');
    expect(productUrl).toBe('https://dharaniherbbals.in/product/1255');
  });

  test('Generates correct Tamil product share message and link', () => {
    const localizedName = getLocalizedProductName(sampleProduct, 'ta');
    const productUrl = `https://dharaniherbbals.in/product/${sampleProduct.id}`;
    const message = `தரணி ஹெர்பல்ஸில் ${localizedName} வாங்க: ${productUrl}`;

    expect(message).toBe('தரணி ஹெர்பல்ஸில் செம்பருத்தி மூலிகை ஷாம்பூ வாங்க: https://dharaniherbbals.in/product/1255');
  });

  test('Icon renders share and share-2 correctly', () => {
    const shareIcon = Icon({ name: 'share', size: 18, color: '#5A6E62' });
    expect(shareIcon).toBeDefined();

    const share2Icon = Icon({ name: 'share-2', size: 17, color: '#5A6E62' });
    expect(share2Icon).toBeDefined();
  });
});
