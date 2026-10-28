/**
 * Product Size and Weight Formatting Utilities for Dharani Herbbals
 * Clean, human-readable display across all screens.
 */

export function isArppuShampoo(p) {
  if (!p) return false;
  const name = typeof p === 'object' ? (p.name || '') : String(p);
  const ta = typeof p === 'object' ? (p.tamil_name || p.name_ta || p.nameTa || '') : '';
  return (
    /arppu.*shampoo/i.test(name) ||
    /arappu.*shampoo/i.test(name) ||
    (/ar[ap]+u/i.test(name) && /shampoo/i.test(name)) ||
    ((/அரப்பு/.test(ta) || /அரப்பு/.test(name)) && (/ஷாம்பு|ஷாம்பூ/.test(ta) || /ஷாம்பு|ஷாம்பூ/.test(name)))
  );
}

export function isAloeVeraShampoo(p) {
  if (!p) return false;
  const id = typeof p === 'object' ? p.id : null;
  const name = typeof p === 'object' ? (p.name || '') : String(p);
  const ta = typeof p === 'object' ? (p.tamil_name || p.name_ta || p.nameTa || '') : '';
  return (
    id === 1250 ||
    (/aloe\s*vera/i.test(name) && /shampoo/i.test(name)) ||
    ((/கற்றாழை/.test(ta) || /கற்றாழை/.test(name)) && (/ஷாம்பு|ஷாம்பூ/.test(ta) || /ஷாம்பு|ஷாம்பூ/.test(name)))
  );
}

export function isKadalaiMittai(p) {
  if (!p) return false;
  const id = typeof p === 'object' ? p.id : null;
  const name = typeof p === 'object' ? (p.name || '') : String(p);
  const ta = typeof p === 'object' ? (p.tamil_name || p.name_ta || p.nameTa || '') : '';
  return (
    id === 1305 ||
    /kadalai\s*mittai/i.test(name) ||
    /கடலை\s*மிட்டாய்/i.test(ta) ||
    /கடலை\s*மிட்டாய்/i.test(name)
  );
}

export function formatProductSize(product, optUnit, optName) {
  if (!product) return '';

  // Requirement: For the Food category product Kadalai Mittai, do not display the gram/weight label at all
  if (isKadalaiMittai(product)) {
    return '';
  }

  let rawVal = typeof product === 'object' ? (product.weight_volume ?? product.size ?? '') : product;
  let rawUnit = typeof product === 'object' ? (product.unit ?? optUnit ?? '') : (optUnit ?? '');
  const name = typeof product === 'object' ? (product.name || optName || '') : (optName || '');
  const id = typeof product === 'object' ? product.id : null;

  // Specific catalog item net weights & overrides
  if (id === 1158 || /nalangu\s+powder\s+jar/i.test(name)) {
    return '100 G';
  }
  if (id === 1255 || /chemparuthi.*shampoo/i.test(name)) {
    return '125 ML';
  }
  if (id === 1250 || isAloeVeraShampoo(product) || /aloe\s*vera.*shampoo/i.test(name)) {
    return '125 ML';
  }
  if (isArppuShampoo(product) || /arppu.*shampoo/i.test(name) || /arappu.*shampoo/i.test(name)) {
    if (rawVal && parseFloat(rawVal) > 0) {
      // Allow below volume logic to format if valid number present
    } else {
      return '125 ML';
    }
  }
  if (id === 1073 || /kandakathiri.*powder/i.test(name)) {
    return '50 G';
  }

  rawVal = String(rawVal || '').trim();
  rawUnit = String(rawUnit || '').trim();

  // If unit is embedded in the value string e.g. '500 gm', '50g'
  const valUnitMatch = rawVal.match(/^([\d.]+)\s*([a-zA-Z]+)$/);
  if (valUnitMatch) {
    rawVal = valUnitMatch[1];
    if (!rawUnit) rawUnit = valUnitMatch[2];
  }

  // If value is 0 or missing, check name for size e.g. 'Siruthaniya Health Mix(500 GM)'
  if ((!rawVal || parseFloat(rawVal) === 0) && name) {
    const nameMatch = name.match(/\((\d+(?:\.\d+)?)\s*(GM|Gm|gm|G|g|GMS|Gms|gms|ML|Ml|ml|KG|Kg|kg|L|l)\)/i) ||
                      name.match(/\b(\d+(?:\.\d+)?)\s*(GM|Gm|gm|G|g|GMS|Gms|gms|ML|Ml|ml|KG|Kg|kg)\b/i);
    if (nameMatch) {
      rawVal = nameMatch[1];
      rawUnit = nameMatch[2];
    }
  }

  if (!rawVal || isNaN(parseFloat(rawVal)) || parseFloat(rawVal) <= 0) return '';

  let num = parseFloat(rawVal);
  let u = rawUnit.toUpperCase();

  // In herbal catalog, 'mg' was mistakenly selected instead of 'GM' / 'G'
  if (u === 'MG' || u === 'GM' || u === 'GMS') u = 'G';

  // Kilograms
  if (u === 'KG') {
    if (num < 1 && num > 0) {
      return `${Math.round(num * 1000)} G`;
    }
    return `${num % 1 === 0 ? num.toFixed(0) : num} KG`;
  }

  // Litres
  if (u === 'L' || u === 'LTR' || u === 'LITRE') {
    if (num < 1 && num > 0) {
      return `${Math.round(num * 1000)} ML`;
    }
    return `${num % 1 === 0 ? num.toFixed(0) : num} L`;
  }

  // Grams: Always display 'G' (e.g., '50 G', '100 G') instead of 'GM'
  if (u === 'G') {
    if (num < 1 && num > 0) {
      return `${Math.round(num * 1000)} G`;
    }
    return `${num % 1 === 0 ? num.toFixed(0) : num} G`;
  }

  // Millilitres
  if (u === 'ML') {
    if (num < 1 && num > 0 && num < 0.5) {
      return `${Math.round(num * 1000)} ML`;
    }
    return `${num % 1 === 0 ? num.toFixed(0) : num} ML`;
  }

  if (num > 0) {
    const cleanUnit = (rawUnit || '').toUpperCase() === 'GM' ? 'G' : (rawUnit || '').toUpperCase();
    return `${num % 1 === 0 ? num.toFixed(0) : num} ${cleanUnit}`.trim();
  }
  return '';
}

export default {
  formatProductSize,
  isArppuShampoo,
  isAloeVeraShampoo,
  isKadalaiMittai,
};
