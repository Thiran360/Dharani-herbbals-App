import { filterProductsByQuery, normalizeSearchText, FORMULATION_SYNONYMS } from '../src/utils/productSearch';

const MOCK_PRODUCTS = [
  {
    id: 1255,
    name: 'Chemparuthi Herbal Shampoo',
    tamil_name: 'செம்பருத்தி ஷாம்பு',
    category_name: 'Hair',
    category: 2,
    price: '70.00',
    description: 'Ramcare Hibiscus Herbal Shampoo is formulated with the natural goodness of hibiscus',
    brand: 'Ramcare',
  },
  {
    id: 1229,
    name: 'Vettiver Shampoo',
    tamil_name: 'வெட்டிவேர் ஷாம்பு',
    category_name: 'Hair',
    category: 2,
    price: '75.00',
    description: 'Ramcare Khus Root (Vetiver) Herbal Shampoo is enriched with amla and vetiver',
    brand: 'Ramcare',
  },
  {
    id: 1272,
    name: 'Sprouted Multigrain Health Mix',
    tamil_name: 'முளைக்கட்டிய சத்துமாவு',
    category_name: 'Health & Wellness',
    category: 7,
    price: '185.00',
    description: 'Sprouted Multigrain Health Mix is a nutrient-packed superfood powder',
    brand: 'Mahil',
  },
  {
    id: 1136,
    name: 'Siruthaniya Health Mix(500 GM)',
    tamil_name: 'சிறுதானியா சத்து மாவு',
    category_name: 'Health & Wellness',
    category: 7,
    price: '205.00',
    description: 'Mahil health mix powder is made for all ages and has a high nutritional value.',
    brand: 'Mahil',
  },
  {
    id: 1138,
    name: 'Siruthaniya Health Mix(250 GM)',
    tamil_name: 'சிறுதானிய சத்துமாவு (ஜார்)',
    category_name: 'Health & Wellness',
    category: 7,
    price: '110.00',
    description: 'Mahil health mix powder in jar format.',
    brand: 'Mahil',
  },
  {
    id: 1117,
    name: 'Karuppu Kavuni Health Mix (Jar)',
    tamil_name: 'கருப்பு கவுனி  சத்துமாவு',
    category_name: 'Health & Wellness',
    category: 7,
    price: '490.00',
    description: 'Traditional Karuppu Kavuni health mix.',
    brand: 'Mahil',
  },
  {
    id: 1099,
    name: 'Siruthaniya Health Mix(BOX)',
    tamil_name: 'சத்துமாவு (பாக்ஸ்)',
    category_name: 'Food',
    category: 5,
    price: '110.00',
    description: 'Siruthaniya health mix box.',
    brand: 'Mahil',
  },
  {
    id: 1227,
    name: 'Kuppaimeni Soap (75GM)',
    tamil_name: 'குப்பைமேனி சோப்பு',
    category_name: 'Body',
    category: 4,
    price: '55.00',
    description: 'Natural herbal soap with kuppaimeni leaves.',
    brand: 'Vedan',
  },
  {
    id: 1158,
    name: 'Nalangu Powder Jar',
    tamil_name: 'நலங்கு மாவு ஜார்',
    category_name: 'Baby',
    category: 8,
    price: '60.00',
    description: 'Traditional herbal bath powder for glowing skin.',
    brand: 'Vedan',
  },
  {
    id: 1137,
    name: 'Pirandai Pickle',
    tamil_name: 'பிரண்டை ஊறுகாய்',
    category_name: 'Food',
    category: 5,
    price: '55.00',
    description: 'Authentic digestive herbal pickle.',
    brand: 'Vedan',
  },
  {
    id: 1243,
    name: 'Wild Turmeric',
    tamil_name: 'கஸ்தூரி மஞ்சள்',
    category_name: 'Skin',
    category: 6,
    price: '65.00',
    description: 'Pure kasthuri manjal for natural skincare.',
    brand: 'Vedan',
  },
  {
    id: 1265,
    name: 'Deepa Oil',
    tamil_name: 'தீபா எண்ணெய்',
    category_name: 'Pooja',
    category: 9,
    price: '95.00',
    description: 'Traditional temple pooja lamp oil.',
    brand: 'Vedan',
  },
  {
    id: 1256,
    name: 'Aloe Vera Facepack Powder Jar (For Men)',
    tamil_name: 'கற்றாழை முக அழகுப் பவுடர்(ஆண்களுக்கு)',
    category_name: 'Skin',
    category: 6,
    price: '60.00',
    description: 'Herbal cooling facepack.',
    brand: 'Vedan',
  },
];

describe('Search Formulations - Chemparuthi Shampoo & Sathu Maavu', () => {
  test('Chemparuthi Shampoo returns Chemparuthi Herbal Shampoo', () => {
    const results = filterProductsByQuery(MOCK_PRODUCTS, 'Chemparuthi Shampoo');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe(1255);
    expect(results[0].name).toBe('Chemparuthi Herbal Shampoo');
  });

  test('Chemparuthi Shampoo in Tamil returns Chemparuthi Herbal Shampoo', () => {
    const results = filterProductsByQuery(MOCK_PRODUCTS, 'செம்பருத்தி ஷாம்பு');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe(1255);
  });

  test('Chemparuthi Shampoo is case and space insensitive', () => {
    const lower = filterProductsByQuery(MOCK_PRODUCTS, 'chemparuthi shampoo');
    const upper = filterProductsByQuery(MOCK_PRODUCTS, 'CHEMPARUTHI SHAMPOO');
    const multiSpace = filterProductsByQuery(MOCK_PRODUCTS, 'Chemparuthi   Shampoo');
    expect(lower.length).toBe(1);
    expect(upper.length).toBe(1);
    expect(multiSpace.length).toBe(1);
  });

  test('Sathu Maavu returns all authentic Health Mix / Sathu Maavu products', () => {
    const results = filterProductsByQuery(MOCK_PRODUCTS, 'Sathu Maavu');
    expect(results.length).toBe(5);
    const ids = results.map(r => r.id);
    expect(ids).toContain(1272); // Sprouted Multigrain Health Mix
    expect(ids).toContain(1136); // Siruthaniya Health Mix(500 GM)
    expect(ids).toContain(1138); // Siruthaniya Health Mix(250 GM)
    expect(ids).toContain(1117); // Karuppu Kavuni Health Mix (Jar)
    expect(ids).toContain(1099); // Siruthaniya Health Mix(BOX)
  });

  test('Sathu Maavu in Tamil (சத்துமாவு and சத்து மாவு) returns all 5 products', () => {
    const resNoSpace = filterProductsByQuery(MOCK_PRODUCTS, 'சத்துமாவு');
    const resWithSpace = filterProductsByQuery(MOCK_PRODUCTS, 'சத்து மாவு');
    expect(resNoSpace.length).toBe(5);
    expect(resWithSpace.length).toBe(5);
  });

  test('Other popular formulation buttons continue to work correctly', () => {
    expect(filterProductsByQuery(MOCK_PRODUCTS, 'Kuppaimeni Soap').length).toBe(1);
    expect(filterProductsByQuery(MOCK_PRODUCTS, 'Nalangu Powder').length).toBe(1);
    expect(filterProductsByQuery(MOCK_PRODUCTS, 'Pirandai Pickle').length).toBe(1);
    expect(filterProductsByQuery(MOCK_PRODUCTS, 'Wild Turmeric').length).toBe(1);
    expect(filterProductsByQuery(MOCK_PRODUCTS, 'Deepa Oil').length).toBe(1);
    expect(filterProductsByQuery(MOCK_PRODUCTS, 'Aloe Vera Facepack').length).toBe(1);
  });

  test('Returns empty array for non-existent items without throwing', () => {
    expect(filterProductsByQuery(MOCK_PRODUCTS, 'NonExistentWidget999')).toEqual([]);
    expect(filterProductsByQuery(MOCK_PRODUCTS, '')).toEqual([]);
    expect(filterProductsByQuery(null, 'Shampoo')).toEqual([]);
  });
});
