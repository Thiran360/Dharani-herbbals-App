/**
 * Authentic Categories for Dharani Herbbals
 * Sourced directly from GET https://api.codingboss.in/herbal/categories/
 * Verified with Django backend IDs, category names, CDN images, and local studio assets.
 */

export const STATIC_CATEGORIES = [
  {
    id: 8,
    name: 'Baby',
    nameTa: 'குழந்தை பராமரிப்பு',
    image: 'https://vedanmart.com/images/category/Nalangu_Powder.jpeg',
    localImage: require('../assets/nalangu_powder_transparent_v2-DZchULZk.png'),
    description: 'Gentle Nalangu Maavu, baby bath powders, and soft herbal care.',
    status: 'active',
  },
  {
    id: 10,
    name: 'Beverages',
    nameTa: 'மூலிகை பானங்கள்',
    image: 'https://vedanmart.com/images/category/NannariSherbet.jpeg',
    localImage: require('../assets/beverage_transparent-DJ3emEXD.png'),
    description: 'Nannari sherbet, herbal health drinks, and natural refreshments.',
    status: 'active',
  },
  {
    id: 4,
    name: 'Body',
    nameTa: 'உடல் பராமரிப்பு',
    image: 'https://vedanmart.com/images/category/Kuppaimeni_Soap.jpeg',
    localImage: require('../assets/body_soap_transparent-BNlIXnY2.png'),
    description: 'Handcrafted herbal soaps, bath powders, and moisturizing skin remedies.',
    status: 'active',
  },
  {
    id: 5,
    name: 'Food',
    nameTa: 'பாரம்பரிய உணவு வகைகள்',
    image: 'https://vedanmart.com/images/category/Pirandai_Pickel.jpeg',
    localImage: require('../assets/pirandai_pickle_transparent_v2-CmtHv3jP.png'),
    description: 'Authentic pickles, karuppu kavuni rice, nattu charkkarai, and village staples.',
    status: 'active',
  },
  {
    id: 2,
    name: 'Hair',
    nameTa: 'கூந்தல் பராமரிப்பு',
    image: 'https://vedanmart.com/images/category/HibiscusShampoo.jpeg',
    localImage: require('../assets/hair_banner_transparent-C6ZbZnzF.png'),
    description: 'Natural shampoos, herbal oils, and hair packs for strong, vibrant roots.',
    status: 'active',
  },
  {
    id: 7,
    name: 'Health & Wellness',
    nameTa: 'ஆரோக்கியம் & நலவாழ்வு',
    image: 'https://vedanmart.com/images/category/KARUPPU_KAVUNI_HEALTH_MIX(JAR).jpeg',
    localImage: require('../assets/sathu_maavu_transparent-BQkYbCxR.png'),
    description: 'Sprouted health mixes, herbal teas, malts, and daily vitality boosters.',
    status: 'active',
  },
  {
    id: 9,
    name: 'Poojas',
    nameTa: 'பூஜை பொருட்கள்',
    image: 'https://vedanmart.com/images/category/Deepa_oil.jpeg',
    localImage: require('../assets/pooja_oil_transparent_v2-Cxoxfrc6.png'),
    description: 'Pure deepa pooja oil and spiritual herbal preparations.',
    status: 'active',
  },
  {
    id: 6,
    name: 'Skin',
    nameTa: 'தோல் பராமரிப்பு',
    image: 'https://vedanmart.com/images/category/MULTHANI_METTI_JAR.jpeg',
    localImage: require('../assets/aloe_vera_face_pack_transparent-pX6HUvSp.png'),
    description: 'Wild turmeric, aloe vera packs, and herbal glowing creams.',
    status: 'active',
  },
];

/**
 * Maps any category identifier (id or name) to its verified local studio image asset.
 */
export function getCategoryLocalImage(category) {
  if (!category) return null;
  const id = typeof category === 'object' ? Number(category.id || category.categoryId || category.category) : Number(category) || null;
  const rawName = typeof category === 'string'
    ? category.toLowerCase().trim()
    : ((category.name || category.category_name || '') + '').toLowerCase().trim();

  if (id === 8 || rawName === 'baby') {
    return require('../assets/nalangu_powder_transparent_v2-DZchULZk.png');
  }
  if (id === 10 || rawName === 'beverages') {
    return require('../assets/beverage_transparent-DJ3emEXD.png');
  }
  if (id === 4 || rawName === 'body') {
    return require('../assets/body_soap_transparent-BNlIXnY2.png');
  }
  if (id === 5 || rawName === 'food' || rawName === 'traditional food') {
    return require('../assets/pirandai_pickle_transparent_v2-CmtHv3jP.png');
  }
  if (id === 2 || rawName === 'hair') {
    return require('../assets/hair_banner_transparent-C6ZbZnzF.png');
  }
  if (id === 7 || rawName === 'health & wellness') {
    return require('../assets/sathu_maavu_transparent-BQkYbCxR.png');
  }
  if (id === 9 || rawName === 'poojas' || rawName === 'pooja') {
    return require('../assets/pooja_oil_transparent_v2-Cxoxfrc6.png');
  }
  if (id === 6 || rawName === 'skin' || rawName === 'face') {
    return require('../assets/aloe_vera_face_pack_transparent-pX6HUvSp.png');
  }
  return null;
}

/**
 * Verified CDN images from Django backend API.
 */
export const CATEGORY_REMOTE_IMAGES = {
  8: 'https://vedanmart.com/images/category/Nalangu_Powder.jpeg',
  10: 'https://vedanmart.com/images/category/NannariSherbet.jpeg',
  4: 'https://vedanmart.com/images/category/Kuppaimeni_Soap.jpeg',
  5: 'https://vedanmart.com/images/category/Pirandai_Pickel.jpeg',
  2: 'https://vedanmart.com/images/category/HibiscusShampoo.jpeg',
  7: 'https://vedanmart.com/images/category/KARUPPU_KAVUNI_HEALTH_MIX(JAR).jpeg',
  9: 'https://vedanmart.com/images/category/Deepa_oil.jpeg',
  6: 'https://vedanmart.com/images/category/MULTHANI_METTI_JAR.jpeg',
};

export function getCategoryRemoteImage(category) {
  if (!category) return null;
  const id = typeof category === 'object' ? Number(category.id || category.categoryId || category.category) : Number(category) || null;
  if (id && CATEGORY_REMOTE_IMAGES[id]) {
    return CATEGORY_REMOTE_IMAGES[id];
  }
  const rawName = typeof category === 'string'
    ? category.toLowerCase().trim()
    : ((category.name || category.category_name || '') + '').toLowerCase().trim();

  if (rawName === 'baby') return CATEGORY_REMOTE_IMAGES[8];
  if (rawName === 'beverages') return CATEGORY_REMOTE_IMAGES[10];
  if (rawName === 'body') return CATEGORY_REMOTE_IMAGES[4];
  if (rawName === 'food' || rawName === 'traditional food') return CATEGORY_REMOTE_IMAGES[5];
  if (rawName === 'hair') return CATEGORY_REMOTE_IMAGES[2];
  if (rawName === 'health & wellness') return CATEGORY_REMOTE_IMAGES[7];
  if (rawName === 'poojas' || rawName === 'pooja') return CATEGORY_REMOTE_IMAGES[9];
  if (rawName === 'skin' || rawName === 'face') return CATEGORY_REMOTE_IMAGES[6];

  return null;
}

export default STATIC_CATEGORIES;
