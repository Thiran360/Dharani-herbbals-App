/**
 * Category Card Component for Dharani Herbbals
 * Luxury botanical category card with touch micro-interactions
 */

import React, { useRef, useState, memo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { Icon } from './Icons';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalizedCategoryName } from '../../utils/localization';
import { getCategoryLocalImage } from '../../constants/categories';
import { getOptimizedImageSource } from '../../utils/imageOptimizer';

const CategoryCardComponent = ({ category, variant = 'circle' }) => {
  const navigation = useNavigation();
  const { isTamil, language } = useLanguage();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [imageError, setImageError] = useState(false);

  if (!category) return null;

  const handlePress = () => {
    navigation.navigate('ProductListScreen', {
      categoryId: category.id,
      categoryName: category.name,
      categoryTamil: category.nameTa,
      title: getLocalizedCategoryName(category, language),
    });
  };

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  // 1. Guaranteed category-specific local asset
  const localAsset = category.localImage || getCategoryLocalImage(category);

  // 2. Verified backend remote image from Django API with native disk cache
  const remoteUri = !imageError && typeof category.image === 'string' && category.image.startsWith('http')
    ? getOptimizedImageSource(category.image, localAsset)
    : null;

  // Prefer remote image with automatic fallback to verified category-specific local asset
  const imageSource = remoteUri || localAsset || require('../../assets/logo.png');

  if (variant === 'grid') {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.gridCard}
          onPress={handlePress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={0.92}
        >
          {/* Image Container with Studio Herbal Backdrop */}
          <View style={styles.gridImageContainer}>
            <Image
              source={imageSource}
              style={styles.gridImage}
              resizeMode="contain"
              onError={() => setImageError(true)}
              defaultSource={localAsset || require('../../assets/logo.png')}
            />
          </View>

          {/* Info Block */}
          <View style={styles.gridInfo}>
            <View style={styles.collectionBadge}>
              <Text style={styles.collectionBadgeText}>
                {isTamil ? 'மூலிகை தயாரிப்பு' : 'HERBAL FORMULATION'}
              </Text>
            </View>

            <Text style={styles.gridTitle} numberOfLines={1}>
              {getLocalizedCategoryName(category, language)}
            </Text>

            {category.description ? (
              <Text style={styles.gridDesc} numberOfLines={2}>
                {category.description}
              </Text>
            ) : null}

            <View style={styles.exploreRow}>
              <Text style={styles.exploreText}>
                {isTamil ? 'ஆராய்ந்து பார்க்க ›' : 'Explore Formulations ›'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Circular variant for Home screen horizontal scroll
  const ringIndex = typeof category.id === 'number' ? Math.abs(category.id) % 6 : 0;
  const ringColors = [
    { border: '#1B4D3E', bg: '#F0F7F4' }, // Emerald Botanical
    { border: '#D4A373', bg: '#FAF5EE' }, // Botanical Gold
    { border: '#2A9D8F', bg: '#EEF8F6' }, // Sage Green
    { border: '#E76F51', bg: '#FDF2E9' }, // Terracotta
    { border: '#8A5A44', bg: '#F7F3EE' }, // Warm Herbal
    { border: '#588157', bg: '#F2F6F1' }, // Forest Herb
  ];
  const currentRing = ringColors[ringIndex] || ringColors[0];

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.circleContainer}
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.88}
      >
        {/* Dual-ring Botanical Ring with Dynamic Herbal Accents */}
        <View style={[styles.outerRing, { borderColor: currentRing.border, backgroundColor: currentRing.bg }]}>
          <View style={styles.circleImageWrapper}>
            <Image
              source={imageSource}
              style={styles.circleImage}
              resizeMode="contain"
              onError={() => setImageError(true)}
              defaultSource={localAsset || require('../../assets/logo.png')}
            />
          </View>
        </View>

        <Text style={styles.circleTitle} numberOfLines={2}>
          {getLocalizedCategoryName(category, language)}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Circle variant (Home screen horizontal scroll)
  circleContainer: {
    alignItems: 'center',
    width: 84,
    marginRight: SPACING.md,
  },
  outerRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 163, 115, 0.45)', // warm botanical gold ring
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
  },
  circleImageWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    ...SHADOWS.small,
  },
  circleImage: {
    width: '84%',
    height: '84%',
  },
  circleTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#14231A',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 15,
    letterSpacing: 0.1,
    minHeight: 30,
  },

  // Grid variant (Categories tab)
  gridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    marginBottom: SPACING.lg,
    flexDirection: 'row',
    ...SHADOWS.small,
  },
  gridImageContainer: {
    width: '32%',
    minWidth: 95,
    maxWidth: 125,
    aspectRatio: 0.95,
    backgroundColor: '#F9F7F4', // Warm ivory backdrop
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xs,
  },
  gridImage: {
    width: '90%',
    height: '90%',
  },
  gridInfo: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'center',
  },
  collectionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    marginBottom: 4,
  },
  collectionBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#666666',
    letterSpacing: 0.6,
  },
  gridTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#133E2B',
    letterSpacing: 0.1,
  },
  gridSubtitle: {
    fontSize: 12,
    color: '#1B4D3E',
    fontWeight: '600',
    marginTop: 1,
  },
  gridDesc: {
    fontSize: 11.5,
    color: '#5A6E62',
    marginTop: 4,
    lineHeight: 16,
  },
  exploreRow: {
    marginTop: 8,
  },
  exploreText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1B4D3E',
    letterSpacing: 0.2,
  },
});

export const CategoryCard = memo(CategoryCardComponent);
export default CategoryCard;

