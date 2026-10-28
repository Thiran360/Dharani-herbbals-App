/**
 * Product Search and Formulation Matching Utility for Dharani Herbbals
 * Handles multi-token search, cross-lingual Tamil/English mappings, and formulation aliases.
 */

export const FORMULATION_SYNONYMS = {
  // 1. Chemparuthi Shampoo
  'chemparuthi shampoo': {
    tokens: ['chemparuthi', 'shampoo'],
    synonyms: ['chemparuthi herbal shampoo', 'செம்பருத்தி ஷாம்பு', 'hibiscus shampoo', 'hibiscus herbal shampoo'],
    filter: p => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      const isChemparuthi = name.includes('chemparuthi') || ta.includes('செம்பருத்தி') || (name.includes('hibiscus') && desc.includes('chemparuthi'));
      const isShampoo = name.includes('shampoo') || ta.includes('ஷாம்பு') || ta.includes('ஷாம்பூ');
      return isChemparuthi && isShampoo;
    },
  },
  'செம்பருத்தி ஷாம்பு': {
    tokens: ['செம்பருத்தி', 'ஷாம்பு'],
    synonyms: ['chemparuthi herbal shampoo', 'chemparuthi shampoo', 'hibiscus shampoo'],
    filter: p => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      const isChemparuthi = name.includes('chemparuthi') || ta.includes('செம்பருத்தி') || name.includes('hibiscus');
      const isShampoo = name.includes('shampoo') || ta.includes('ஷாம்பு') || ta.includes('ஷாம்பூ');
      return isChemparuthi && isShampoo;
    },
  },

  // 2. Sathu Maavu (Tamil: சத்துமாவு / சத்து மாவு, English: Health Mix / Sprouted Health Mix)
  'sathu maavu': {
    tokens: ['sathu', 'maavu'],
    synonyms: ['sathumaavu', 'sathu mavu', 'health mix', 'சத்துமாவு', 'சத்து மாவு', 'sprouted multigrain health mix'],
    filter: p => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      return (
        ta.includes('சத்துமாவு') ||
        ta.includes('சத்து மாவு') ||
        name.includes('health mix') ||
        name.includes('sathu maavu') ||
        desc.includes('health mix') ||
        desc.includes('sathu maavu')
      );
    },
  },
  'sathumaavu': {
    tokens: ['sathumaavu'],
    synonyms: ['sathu maavu', 'health mix', 'சத்துமாவு', 'சத்து மாவு'],
    filter: p => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      return (
        ta.includes('சத்துமாவு') ||
        ta.includes('சத்து மாவு') ||
        name.includes('health mix') ||
        name.includes('sathu maavu') ||
        desc.includes('health mix') ||
        desc.includes('sathu maavu')
      );
    },
  },
  'சத்துமாவு': {
    tokens: ['சத்துமாவு'],
    synonyms: ['சத்து மாவு', 'sathu maavu', 'health mix'],
    filter: p => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      return (
        ta.includes('சத்துமாவு') ||
        ta.includes('சத்து மாவு') ||
        name.includes('health mix') ||
        name.includes('sathu maavu') ||
        desc.includes('health mix') ||
        desc.includes('sathu maavu')
      );
    },
  },
  'சத்து மாவு': {
    tokens: ['சத்து', 'மாவு'],
    synonyms: ['சத்துமாவு', 'sathu maavu', 'health mix'],
    filter: p => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      return (
        ta.includes('சத்துமாவு') ||
        ta.includes('சத்து மாவு') ||
        name.includes('health mix') ||
        name.includes('sathu maavu') ||
        desc.includes('health mix') ||
        desc.includes('sathu maavu')
      );
    },
  },

  // 3. Kuppaimeni Soap
  'kuppaimeni soap': {
    filter: p => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      return (name.includes('kuppaimeni') && name.includes('soap')) || (ta.includes('குப்பைமேனி') && (ta.includes('சோப்') || ta.includes('சோப்பு')));
    },
  },
  'குப்பைமேனி சோப்பு': {
    filter: p => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      return (name.includes('kuppaimeni') && name.includes('soap')) || (ta.includes('குப்பைமேனி') && (ta.includes('சோப்') || ta.includes('சோப்பு')));
    },
  },

  // 4. Nalangu Powder
  'nalangu powder': {
    filter: p => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      return name.includes('nalangu') || ta.includes('நலங்கு');
    },
  },
  'நலங்கு மாவு': {
    filter: p => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      return name.includes('nalangu') || ta.includes('நலங்கு');
    },
  },

  // 5. Pirandai Pickle
  'pirandai pickle': {
    filter: p => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      return (name.includes('pirandai') && name.includes('pickle')) || (ta.includes('பிரண்டை') && ta.includes('ஊறுகாய்'));
    },
  },
  'பிரண்டை ஊறுகாய்': {
    filter: p => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      return (name.includes('pirandai') && name.includes('pickle')) || (ta.includes('பிரண்டை') && ta.includes('ஊறுகாய்'));
    },
  },

  // 6. Wild Turmeric
  'wild turmeric': {
    filter: p => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      return name.includes('turmeric') || name.includes('kasthuri manjal') || ta.includes('கஸ்தூரி மஞ்சள்');
    },
  },
  'கஸ்தூரி மஞ்சள்': {
    filter: p => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      return name.includes('turmeric') || name.includes('kasthuri manjal') || ta.includes('கஸ்தூரி மஞ்சள்');
    },
  },

  // 7. Deepa Oil
  'deepa oil': {
    filter: p => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      return (name.includes('deepa') && name.includes('oil')) || (ta.includes('தீபா') && (ta.includes('எண்ணெய்') || ta.includes('தைலம்')));
    },
  },
  'தீபா எண்ணெய்': {
    filter: p => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      return (name.includes('deepa') && name.includes('oil')) || (ta.includes('தீபா') && (ta.includes('எண்ணெய்') || ta.includes('தைலம்')));
    },
  },

  // 8. Aloe Vera Facepack / Soap
  'aloe vera facepack': {
    filter: p => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      const isAloe = name.includes('aloe') || ta.includes('கற்றாழை');
      const isFace = name.includes('face') || ta.includes('முக அழகு');
      return (isAloe && isFace) || name.includes('facepack') || name.includes('face pack');
    },
  },
  'கற்றாழை சோப்பு': {
    filter: p => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      return (name.includes('aloe') && name.includes('soap')) || (ta.includes('கற்றாழை') && (ta.includes('சோப்') || ta.includes('சோப்பு')));
    },
  },
};

/**
 * Normalize text for robust token and phrase matching
 */
export function normalizeSearchText(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/[^\w\s\u0B80-\u0BFF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Filter an array of products matching a search query or formulation keyword
 */
export function filterProductsByQuery(products, query) {
  if (!Array.isArray(products) || !query || !query.trim()) {
    return [];
  }

  const qClean = query.trim().toLowerCase();
  const qNorm = normalizeSearchText(query);
  const qNoSpace = qNorm.replace(/\s+/g, '');

  // 1. Direct formulation definition matching
  if (FORMULATION_SYNONYMS[qClean]?.filter) {
    return products.filter(FORMULATION_SYNONYMS[qClean].filter);
  }
  if (FORMULATION_SYNONYMS[qNorm]?.filter) {
    return products.filter(FORMULATION_SYNONYMS[qNorm].filter);
  }
  if (FORMULATION_SYNONYMS[qNoSpace]?.filter) {
    return products.filter(FORMULATION_SYNONYMS[qNoSpace].filter);
  }

  // 2. Token-based smart matching
  const tokens = qNorm.split(' ').filter(t => t.length > 0);

  return products.filter(p => {
    const name = normalizeSearchText(p.name);
    const tamilName = normalizeSearchText(p.tamil_name);
    const cat = normalizeSearchText(p.category_name);
    const desc = normalizeSearchText(p.description);
    const brand = normalizeSearchText(p.brand);

    const fullText = `${name} ${tamilName} ${cat} ${desc} ${brand}`;
    const fullTextNoSpace = fullText.replace(/\s+/g, '');

    // Whole phrase match
    if (fullText.includes(qNorm) || fullTextNoSpace.includes(qNoSpace)) {
      return true;
    }

    // Multi-token match: every token must be present in the product details
    if (tokens.length > 1) {
      const allTokensMatch = tokens.every(tok => fullText.includes(tok) || fullTextNoSpace.includes(tok));
      if (allTokensMatch) return true;
    }

    return false;
  });
}
