/**
 * Localization Helpers for Dharani Herbbals
 * Handles strict language-based product name, description, and category display.
 */

// Tamil Unicode character detection regex
const TAMIL_REGEX = /[\u0B80-\u0BFF]/;

/**
 * Category translation dictionary mapping standard category names to Tamil and English.
 */
export const CATEGORY_TRANSLATIONS = {
  'Hair': { en: 'Hair', ta: 'கூந்தல் பராமரிப்பு' },
  'Body': { en: 'Body', ta: 'உடல் பராமரிப்பு' },
  'Face': { en: 'Face', ta: 'முக பராமரிப்பு' },
  'Skin': { en: 'Skin', ta: 'தோல் பராமரிப்பு' },
  'Health & Wellness': { en: 'Health & Wellness', ta: 'ஆரோக்கியம் & நலவாழ்வு' },
  'Baby': { en: 'Baby', ta: 'குழந்தை பராமரிப்பு' },
  'Food': { en: 'Food', ta: 'பாரம்பரிய உணவு வகைகள்' },
  'Traditional Food': { en: 'Traditional Food', ta: 'பாரம்பரிய உணவு வகைகள்' },
  'Beverages': { en: 'Beverages', ta: 'மூலிகை பானங்கள்' },
  'Poojas': { en: 'Poojas', ta: 'பூஜை பொருட்கள்' },
  'Pooja': { en: 'Pooja', ta: 'பூஜை பொருட்கள்' },
  'All Products': { en: 'All Products', ta: 'அனைத்து தயாரிப்புகள்' },
  'All': { en: 'All', ta: 'அனைத்தும்' },
};

/**
 * Returns localized product name based on current language.
 *
 * Strict Language Policy:
 * - When language === 'ta': returns Tamil name (from tamil_name or name_ta) if available;
 *   falls back to English name only if Tamil translation is missing.
 * - When language === 'en' (or default): returns English name (from name or product_name or name_en);
 *   falls back to Tamil name ONLY if English name is missing.
 *
 * @param {Object|string} product - The product object or name string
 * @param {string} [language='en'] - 'en' or 'ta'
 * @returns {string} The localized product name
 */
export function getLocalizedProductName(product, language = 'en') {
  if (!product) return '';
  if (typeof product === 'string') return product;

  const isTa = language === 'ta';

  const englishName = (
    product.name ||
    product.name_en ||
    product.product_name ||
    ''
  ).trim();

  const tamilName = (
    product.tamil_name ||
    product.name_ta ||
    product.tamil_title ||
    ''
  ).trim();

  if (isTa) {
    // In Tamil mode, prefer Tamil name
    if (tamilName) return tamilName;
    return englishName;
  }

  // In English mode, prefer English name
  if (englishName) return englishName;
  return tamilName;
}

/**
 * Returns localized product description.
 *
 * If the description contains both English and Tamil sections (e.g. separated by paragraphs),
 * it isolates and returns only the section corresponding to the active language.
 * If translation for the selected language is not present, falls back gracefully.
 *
 * @param {Object|string} product - The product object or description string
 * @param {string} [language='en'] - 'en' or 'ta'
 * @returns {string} The localized description
 */
export function getLocalizedProductDescription(product, language = 'en') {
  if (!product) return '';

  const isTa = language === 'ta';

  // Check explicit fields first
  if (isTa && product.description_ta) return product.description_ta.trim();
  if (isTa && product.tamil_description) return product.tamil_description.trim();
  if (!isTa && product.description_en) return product.description_en.trim();

  const rawDesc = typeof product === 'string'
    ? product
    : (product.description || '');

  if (!rawDesc) return '';

  // Clean Excel export artifacts like _x000D_ and \r
  const cleanDesc = rawDesc.replace(/_x000D_/g, '').replace(/\r/g, '').trim();

  // If there are no Tamil characters, return cleanDesc directly
  if (!TAMIL_REGEX.test(cleanDesc)) {
    return cleanDesc;
  }

  // Split into paragraphs / blocks
  const blocks = cleanDesc.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);

  if (blocks.length > 1) {
    const taBlocks = blocks.filter(b => TAMIL_REGEX.test(b));
    const enBlocks = blocks.filter(b => !TAMIL_REGEX.test(b));

    if (isTa && taBlocks.length > 0) {
      return taBlocks.join('\n\n');
    }
    if (!isTa && enBlocks.length > 0) {
      return enBlocks.join('\n\n');
    }
  }

  // Fallback to the full cleaned description
  return cleanDesc;
}

/**
 * Returns localized category name.
 *
 * @param {Object|string} category - Category object or category name string
 * @param {string} [language='en'] - 'en' or 'ta'
 * @returns {string} The localized category name
 */
export function getLocalizedCategoryName(category, language = 'en') {
  if (!category) return '';

  const isTa = language === 'ta';

  let rawName = '';
  let rawNameTa = '';

  if (typeof category === 'object') {
    rawName = (category.name || category.title || category.category_name || '').trim();
    rawNameTa = (category.nameTa || category.name_ta || category.tamil_name || '').trim();
  } else if (typeof category === 'string') {
    rawName = category.trim();
  }

  // Check dictionary
  const dictEntry = CATEGORY_TRANSLATIONS[rawName] || Object.values(CATEGORY_TRANSLATIONS).find(
    e => e.ta === rawName || e.en === rawName
  );

  if (isTa) {
    if (rawNameTa) return rawNameTa;
    if (dictEntry && dictEntry.ta) return dictEntry.ta;
    return rawName;
  }

  // English mode
  if (dictEntry && dictEntry.en) return dictEntry.en;
  if (rawName && !TAMIL_REGEX.test(rawName)) return rawName;
  return rawName || rawNameTa;
}

export default {
  CATEGORY_TRANSLATIONS,
  getLocalizedProductName,
  getLocalizedProductDescription,
  getLocalizedCategoryName,
};
