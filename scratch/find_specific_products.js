async function run() {
  const res = await fetch('https://api.codingboss.in/herbal/products/');
  const prods = await res.json();
  
  console.log('--- SHAMPOO / CHEMPARUTHI / HIBISCUS ---');
  prods.filter(p => {
    const text = `${p.name} ${p.tamil_name} ${p.category_name} ${p.description}`.toLowerCase();
    return text.includes('shampoo') || text.includes('chemparuthi') || text.includes('செம்பருத்தி') || text.includes('hibiscus');
  }).forEach(p => {
    console.log(`ID: ${p.id} | Name: "${p.name}" | Tamil: "${p.tamil_name}" | Cat: "${p.category_name}"`);
  });

  console.log('\n--- SATHU / MAAVU / HEALTH MIX / CEREAL ---');
  prods.filter(p => {
    const text = `${p.name} ${p.tamil_name} ${p.category_name} ${p.description}`.toLowerCase();
    return text.includes('sathu') || text.includes('maavu') || text.includes('சத்து') || text.includes('மாவு') || text.includes('health mix') || text.includes('கவுனி') || text.includes('kavuni');
  }).forEach(p => {
    console.log(`ID: ${p.id} | Name: "${p.name}" | Tamil: "${p.tamil_name}" | Cat: "${p.category_name}"`);
  });
}
run();
