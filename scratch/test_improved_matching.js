// Test formulation search logic
const SYNONYM_MAP = {
  'sathu maavu': ['sathu maavu', 'sathumaavu', 'sathu mavu', 'health mix', 'சத்துமாவு', 'சத்து மாவு', 'சத்து'],
  'sathumaavu': ['sathu maavu', 'sathumaavu', 'sathu mavu', 'health mix', 'சத்துமாவு', 'சத்து மாவு', 'சத்து'],
  'சத்துமாவு': ['சத்துமாவு', 'சத்து மாவு', 'சத்து', 'sathu maavu', 'sathumaavu', 'health mix'],
  'சத்து மாவு': ['சத்துமாவு', 'சத்து மாவு', 'சத்து', 'sathu maavu', 'sathumaavu', 'health mix'],
  'chemparuthi shampoo': ['chemparuthi shampoo', 'chemparuthi herbal shampoo', 'செம்பருத்தி ஷாம்பு', 'hibiscus shampoo'],
  'செம்பருத்தி ஷாம்பு': ['செம்பருத்தி ஷாம்பு', 'chemparuthi herbal shampoo', 'chemparuthi shampoo', 'hibiscus shampoo'],
  'chemparuthi': ['chemparuthi', 'செம்பருத்தி', 'hibiscus'],
  'hibiscus': ['hibiscus', 'chemparuthi', 'செம்பருத்தி'],
  'wild turmeric': ['wild turmeric', 'kasthuri manjal', 'கஸ்தூரி மஞ்சள்'],
  'கஸ்தூரி மஞ்சள்': ['கஸ்தூரி மஞ்சள்', 'kasthuri manjal', 'wild turmeric'],
  'nalangu powder': ['nalangu powder', 'nalangu maavu', 'நலங்கு மாவு', 'நலங்கு பவுடர்'],
  'நலங்கு மாவு': ['நலங்கு மாவு', 'nalangu powder', 'nalangu maavu'],
  'aloe vera facepack': ['aloe vera facepack', 'aloe vera face pack', 'கற்றாழை', 'facepack', 'face pack'],
};

function normalizeText(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^\w\s\u0B80-\u0BFF]/g, ' ').replace(/\s+/g, ' ').trim();
}

function matchProduct(product, rawQuery) {
  if (!rawQuery || !rawQuery.trim()) return false;

  const queryNorm = normalizeText(rawQuery);
  const queryNoSpace = queryNorm.replace(/\s+/g, '');
  if (!queryNorm) return false;

  const pName = normalizeText(product.name);
  const pTamil = normalizeText(product.tamil_name);
  const pCat = normalizeText(product.category_name);
  const pDesc = normalizeText(product.description);
  const pBrand = normalizeText(product.brand);

  const pFullText = `${pName} ${pTamil} ${pCat} ${pDesc} ${pBrand}`;
  const pFullTextNoSpace = pFullText.replace(/\s+/g, '');

  // 1. Direct whole-phrase / unbroken match
  if (pFullText.includes(queryNorm) || pFullTextNoSpace.includes(queryNoSpace)) {
    return true;
  }

  // 2. Check synonyms / formulation aliases
  const synonyms = SYNONYM_MAP[queryNorm] || SYNONYM_MAP[queryNoSpace];
  if (synonyms) {
    for (const syn of synonyms) {
      const synNorm = normalizeText(syn);
      const synNoSpace = synNorm.replace(/\s+/g, '');
      if (pFullText.includes(synNorm) || pFullTextNoSpace.includes(synNoSpace)) {
        return true;
      }
      // Check all tokens of synonym
      const synTokens = synNorm.split(' ').filter(Boolean);
      if (synTokens.length > 1 && synTokens.every(tok => pFullText.includes(tok) || pFullTextNoSpace.includes(tok))) {
        return true;
      }
    }
  }

  // 3. Multi-token match: all tokens from user query must exist in product text
  const tokens = queryNorm.split(' ').filter(Boolean);
  if (tokens.length > 1) {
    const allTokensMatch = tokens.every(token => {
      // Allow synonym expansion per token if known
      const tokenSyns = SYNONYM_MAP[token] || [token];
      return tokenSyns.some(st => pFullText.includes(normalizeText(st)) || pFullTextNoSpace.includes(st.replace(/\s+/g, '')));
    });
    if (allTokensMatch) return true;
  }

  return false;
}

async function run() {
  const res = await fetch('https://api.codingboss.in/herbal/products/');
  const prods = await res.json();

  const testQueries = [
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

  for (const q of testQueries) {
    const matches = prods.filter(p => matchProduct(p, q));
    console.log(`Query "${q}": ${matches.length} matches -> ${matches.map(m => `${m.id}: ${m.name}`).join(' | ')}`);
  }
}
run();
