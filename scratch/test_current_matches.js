async function testSearches() {
  const res = await fetch('https://api.codingboss.in/herbal/products/');
  const prods = await res.json();

  const EN = [
    'Chemparuthi Shampoo',
    'Kuppaimeni Soap',
    'Nalangu Powder',
    'Pirandai Pickle',
    'Sathu Maavu',
    'Wild Turmeric',
    'Deepa Oil',
    'Aloe Vera Facepack',
  ];

  const TA = [
    'செம்பருத்தி ஷாம்பு',
    'குப்பைமேனி சோப்பு',
    'நலங்கு மாவு',
    'பிரண்டை ஊறுகாய்',
    'சத்துமாவு',
    'கஸ்தூரி மஞ்சள்',
    'தீபா எண்ணெய்',
    'கற்றாழை சோப்பு',
  ];

  console.log('=== CURRENT MATCH LOGIC (EXACT SUBSTRING) ===');
  for (const q of EN) {
    const qLower = q.toLowerCase();
    const matches = prods.filter(p => {
      const name = (p.name || '').toLowerCase();
      const tamilName = (p.tamil_name || '').toLowerCase();
      const cat = (p.category_name || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      return name.includes(qLower) || tamilName.includes(qLower) || cat.includes(qLower) || desc.includes(qLower);
    });
    console.log(`[EN] "${q}": found ${matches.length} matches -> ${matches.map(m => m.name).join(', ')}`);
  }

  console.log('\n=== CURRENT MATCH LOGIC (TAMIL) ===');
  for (const q of TA) {
    const qLower = q.toLowerCase();
    const matches = prods.filter(p => {
      const name = (p.name || '').toLowerCase();
      const tamilName = (p.tamil_name || '').toLowerCase();
      const cat = (p.category_name || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      return name.includes(qLower) || tamilName.includes(qLower) || cat.includes(qLower) || desc.includes(qLower);
    });
    console.log(`[TA] "${q}": found ${matches.length} matches -> ${matches.map(m => m.name).join(', ')}`);
  }
}
testSearches();
