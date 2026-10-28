async function run() {
  const res = await fetch('https://api.codingboss.in/herbal/products/');
  const prods = await res.json();
  console.log('Total products:', prods.length);
  prods.forEach(p => {
    console.log(`ID: ${p.id} | Name: "${p.name}" | Tamil: "${p.tamil_name}" | Cat: "${p.category_name}" | CatID: ${p.category_id || p.category}`);
  });
}
run();
