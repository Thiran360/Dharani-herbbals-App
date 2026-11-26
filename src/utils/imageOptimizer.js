/**
 * Image Optimization and Caching Utilities for Dharani Herbbals
 * Uses React Native's native disk caching, prefetching, and smooth transitions
 */

import { Image } from 'react-native';

/**
 * Sanitize and properly encode image URLs for React Native Android Image component
 * Fixes unencoded spaces, special characters, and duplicate slashes in paths
 */
export function sanitizeImageUrl(url) {
  if (!url || typeof url !== 'string') return null;
  let clean = url.trim();
  if (!clean || clean.length < 4) return null;

  // Clean duplicate slashes in path (e.g. https://vedanmart.com/images//hair/Hibiscus.jpg)
  clean = clean.replace(/([^:])\/\/+/g, '$1/');

  // Ensure URI is properly encoded so spaces (%20) and '&' don't fail in React Native Android
  try {
    clean = encodeURI(decodeURI(clean));
  } catch {
    clean = clean.replace(/ /g, '%20');
  }
  return clean;
}

/**
 * Returns an optimized Image source object configured with native disk caching ('force-cache')
 */
export function getOptimizedImageSource(uri, defaultSource = require('../assets/logo.png')) {
  if (!uri) return defaultSource;
  if (typeof uri === 'number') return uri;

  if (typeof uri === 'object' && uri !== null) {
    if (uri.uri) {
      const sanitized = sanitizeImageUrl(uri.uri);
      return sanitized ? { ...uri, uri: sanitized } : defaultSource;
    }
    const extracted =
      uri.image ||
      uri.image_url ||
      uri.product_image ||
      uri.thumbnail ||
      uri.thumb ||
      uri.url ||
      (Array.isArray(uri.images) && uri.images[0]);
    if (extracted) {
      return getOptimizedImageSource(extracted, defaultSource);
    }
    return defaultSource;
  }

  if (typeof uri === 'string') {
    let clean = uri.trim();
    if (!clean || clean.length < 4) return defaultSource;

    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      const sanitized = sanitizeImageUrl(clean);
      return sanitized ? { uri: sanitized, cache: 'force-cache' } : defaultSource;
    }
    if (clean.startsWith('//')) {
      const sanitized = sanitizeImageUrl(`https:${clean}`);
      return sanitized ? { uri: sanitized, cache: 'force-cache' } : defaultSource;
    }
    if (clean.startsWith('/')) {
      const sanitized = sanitizeImageUrl(`https://api.codingboss.in${clean}`);
      return sanitized ? { uri: sanitized, cache: 'force-cache' } : defaultSource;
    }

    // Relative path fallback (prefer vedanmart.com image server, with dharaniherbbals.in backup)
    const sanitized = sanitizeImageUrl(`https://vedanmart.com/images/${clean}`);
    return sanitized ? { uri: sanitized, cache: 'force-cache' } : defaultSource;
  }

  return defaultSource;
}

/**
 * Prefetch an array of image URLs or product objects into the native disk cache asynchronously
 * Prevents blocking the JS thread and suppresses network errors silently
 */
const prefetchedSet = new Set();

export function prefetchImages(items, limit = 16) {
  if (!Array.isArray(items) || items.length === 0) return;

  const urls = items
    .map(item => {
      if (!item) return null;
      if (typeof item === 'string') return sanitizeImageUrl(item);
      if (typeof item === 'object') {
        const raw = item.image || item.image_url || item.thumbnail || item.product_image || null;
        return typeof raw === 'string' ? sanitizeImageUrl(raw) : null;
      }
      return null;
    })
    .filter(url => typeof url === 'string' && url.startsWith('http') && !prefetchedSet.has(url))
    .slice(0, limit);

  urls.forEach(url => {
    prefetchedSet.add(url);
    Image.prefetch(url).catch(() => {
      prefetchedSet.delete(url);
    });
  });
}

/**
 * Extract thumbnail or best-resolution image for cards
 */
export function getProductThumbnail(product) {
  if (!product || typeof product !== 'object') return null;
  return (
    product.image ||
    product.image_url ||
    product.product_image ||
    product.thumbnail ||
    product.thumb ||
    product.image_thumb ||
    (Array.isArray(product.images) && product.images[0]) ||
    null
  );
}

export default {
  sanitizeImageUrl,
  getOptimizedImageSource,
  prefetchImages,
  getProductThumbnail,
};
