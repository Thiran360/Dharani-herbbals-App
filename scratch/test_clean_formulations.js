// Targeted formulation mappings and search resolver
const FORMULATION_MAPPINGS = {
  // Chemparuthi Shampoo
  'chemparuthi shampoo': {
    tokens: ['chemparuthi', 'shampoo'],
    synonyms: ['chemparuthi herbal shampoo', 'செம்பருத்தி ஷாம்பு', 'hibiscus shampoo', 'hibiscus herbal shampoo'],
    filter: (p) => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      return (
        (name.includes('chemparuthi') && name.includes('shampoo')) ||
        (name.includes('hibiscus') && name.includes('shampoo')) ||
        (ta.includes('செம்பருத்தி') && ta.includes('ஷாம்பு'))
      );
    }
  },
  'செம்பருத்தி ஷாம்பு': {
    tokens: ['செம்பருத்தி', 'ஷாம்பு'],
    synonyms: ['chemparuthi herbal shampoo', 'chemparuthi shampoo', 'hibiscus shampoo'],
    filter: (p) => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      return (
        (name.includes('chemparuthi') && name.includes('shampoo')) ||
        (name.includes('hibiscus') && name.includes('shampoo')) ||
        (ta.includes('செம்பருத்தி') && ta.includes('ஷாம்பு'))
      );
    }
  },

  // Sathu Maavu
  'sathu maavu': {
    tokens: ['sathu', 'maavu'],
    synonyms: ['sathumaavu', 'sathu mavu', 'health mix', 'சத்துமாவு', 'சத்து மாவு'],
    filter: (p) => {
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
    }
  },
  'சத்துமாவு': {
    tokens: ['சத்துமாவு'],
    synonyms: ['சத்து மாவு', 'sathu maavu', 'health mix'],
    filter: (p) => {
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
    }
  },
  'சத்து மாவு': {
    tokens: ['சத்து', 'மாவு'],
    synonyms: ['சத்துமாவு', 'sathu maavu', 'health mix'],
    filter: (p) => {
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
    }
  },

  // Kuppaimeni Soap
  'kuppaimeni soap': {
    filter: (p) => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      return (name.includes('kuppaimeni') && name.includes('soap')) || (ta.includes('குப்பைமேனி') && ta.includes('சோப்'));
    }
  },
  'குப்பைமேனி சோப்பு': {
    filter: (p) => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      return (name.includes('kuppaimeni') && name.includes('soap')) || (ta.includes('குப்பைமேனி') && ta.includes('சோப்'));
    }
  },

  // Nalangu Powder
  'nalangu powder': {
    filter: (p) => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      return name.includes('nalangu') || ta.includes('நலங்கு');
    }
  },
  'நலங்கு மாவு': {
    filter: (p) => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      return name.includes('nalangu') || ta.includes('நலங்கு');
    }
  },

  // Pirandai Pickle
  'pirandai pickle': {
    filter: (p) => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      return (name.includes('pirandai') && name.includes('pickle')) || (ta.includes('பிரண்டை') && ta.includes('ஊறுகாய்'));
    }
  },
  'பிரண்டை ஊறுகாய்': {
    filter: (p) => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      return (name.includes('pirandai') && name.includes('pickle')) || (ta.includes('பிரண்டை') && ta.includes('ஊறுகாய்'));
    }
  },

  // Wild Turmeric
  'wild turmeric': {
    filter: (p) => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      return name.includes('turmeric') || name.includes('kasthuri manjal') || ta.includes('கஸ்தூரி மஞ்சள்');
    }
  },
  'கஸ்தூரி மஞ்சள்': {
    filter: (p) => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      return name.includes('turmeric') || name.includes('kasthuri manjal') || ta.includes('கஸ்தூரி மஞ்சள்');
    }
  },

  // Deepa Oil
  'deepa oil': {
    filter: (p) => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      return (name.includes('deepa') && name.includes('oil')) || (ta.includes('தீபா') && ta.includes('எண்ணெய்'));
    }
  },
  'தீபா எண்ணெய்': {
    filter: (p) => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      return (name.includes('deepa') && name.includes('oil')) || (ta.includes('தீபா') && ta.includes('எண்ணெய்'));
    }
  },

  // Aloe Vera Facepack
  'aloe vera facepack': {
    filter: (p) => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      return (name.includes('aloe') && (name.includes('face') || name.includes('facepack'))) ||
             (name.includes('facepack') || name.includes('face pack'));
    }
  },
  'கற்றாழை சோப்பு': {
    filter: (p) => {
      const name = (p.name || '').toLowerCase();
      const ta = (p.tamil_name || '').toLowerCase();
      return (name.includes('aloe') && name.includes('soap')) || (ta.includes('கற்றாழை') && ta.includes('சோப்'));
    }
  },
};

function searchProducts(products, query) {
  if (!query || !query.trim()) return [];
  const qClean = query.trim().toLowerCase();

  // 1. Direct formulation mapping match
  if (FORMULATION_MAPPINGS[qClean]) {
    return products.filter(FORMULATION_MAPPINGS[qClean].filter);
  }

  // Check normalized form (e.g. without punctuation / spaces)
  const qNoSpace = qClean.replace(/\s+/g, '');
  if (FORMULATION_MAPPINGS[qNoSpace]) {
    return products.filter(FORMULATION_MAPPINGS[qNoSpace].filter);
  }

  // 2. Token-based smart matching
  const tokens = qClean.split(/\s+/).filter(Boolean);
  return products.filter(p => {
    const name = (p.name || '').toLowerCase();
    const tamilName = (p.tamil_name || '').toLowerCase();
    const cat = (p.category_name || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    const brand = (p.brand || '').toLowerCase();
    const full = `${name} ${tamilName} ${cat} ${desc} ${brand}`;

    // Direct whole substring
    if (full.includes(qClean)) return true;

    // All tokens present
    if (tokens.length > 1 && tokens.every(tok => full.includes(tok))) {
      return true;
    }

    return false;
  });
}

async function testAll() {
  const res = await fetch('https://api.codingboss.in/herbal/products/');
  const prods = await res.json();

  const queries = [
    'Chemparuthi Shampoo',
    'Sathu Maavu',
    'Kuppaimeni Soap',
    'Nalangu Powder',
    'Pirandai Pickle',
    'Wild Turmeric',
    'Deepa Oil',
    'Aloe Vera Facepack',
    'செம்பருத்தி ஷாம்பு',
    'சத்துமாவு',
    'சத்து மாவு',
    'குப்பைமேனி சோப்பு',
    'நலங்கு மாவு',
    'பிரண்டை ஊறுகாய்',
    'கஸ்தூரி மஞ்சள்',
    'தீபா எண்ணெய்',
    'கற்றாழை சோப்பு',
  ];

  for (const q of queries) {
    const res = searchProducts(prods, q);
    console.log(`=== "${q}" (${res.length} items) ===`);
    res.forEach(p => console.log(`  - [${p.id}] ${p.name} | ${p.tamil_name} | ₹${p.price}`));
  }
}

testAll();
