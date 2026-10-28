/**
 * Image Optimization and Caching Utilities for Dharani Herbbals
 * Uses React Native's native disk caching, prefetching, and smooth transitions
 */

import { Image } from 'react-native';

/**
 * Returns an optimized Image source object configured with native disk caching ('force-cache')
 */
export function getOptimizedImageSource(uri, defaultSource = require('../assets/logo.png')) {
  if (typeof uri === 'string' && uri.startsWith('http')) {
    return {
      uri,
      cache: 'force-cache',
    };
  }
  if (typeof uri === 'number' || (typeof uri === 'object' && uri !== null && uri.uri)) {
    return uri;
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
      if (typeof item === 'string') return item;
      if (typeof item === 'object') return item.image || item.image_url || item.thumbnail || null;
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
    product.thumbnail ||
    product.thumb ||
    product.image_thumb ||
    product.image ||
    null
  );
}

export default {
  getOptimizedImageSource,
  prefetchImages,
  getProductThumbnail,
};
