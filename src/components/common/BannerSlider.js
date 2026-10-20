/**
 * Hero Banner Slider Component for Dharani Herbbals
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HERO_BANNERS } from '../../constants/banners';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH;
const BANNER_HEIGHT = 205;

export const BannerSlider = () => {
  const navigation = useNavigation();
  const { isTamil } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % HERO_BANNERS.length;
        flatListRef.current?.scrollToOffset({
          offset: nextIndex * SCREEN_WIDTH,
          animated: true,
        });
        return nextIndex;
      });
    }, 4800);

    return () => clearInterval(timer);
  }, []);

  const handleBannerPress = banner => {
    if (banner.categoryId) {
      navigation.navigate('ProductListScreen', {
        categoryId: banner.categoryId,
        categoryName: banner.categoryName,
      });
    }
  };

  const onMomentumScrollEnd = event => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / SCREEN_WIDTH
    );
    if (slideIndex >= 0 && slideIndex < HERO_BANNERS.length) {
      setActiveIndex(slideIndex);
    }
  };

  const renderBannerItem = ({ item }) => {
    const primaryBg = item.bgGradient ? item.bgGradient[0] : COLORS.primary;

    return (
      <TouchableOpacity
        style={styles.bannerContainer}
        onPress={() => handleBannerPress(item)}
        activeOpacity={0.92}
      >
        <View style={[styles.bannerCardBg, { backgroundColor: primaryBg }]}>
          {/* Subtle Decorative Ambient Rings */}
          <View style={styles.ambientCircleOne} />
          <View style={styles.ambientCircleTwo} />

          {/* Text Content */}
          <View style={styles.textContent}>
            {item.tag ? (
              <View
                style={[
                  styles.tagBadge,
                  {
                    backgroundColor: item.accentColor
                      ? `${item.accentColor}33`
                      : 'rgba(255, 255, 255, 0.2)',
                    borderColor: item.accentColor || '#D4A373',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: item.accentColor || '#FAF8F5' },
                  ]}
                >
                  {item.tag}
                </Text>
              </View>
            ) : null}

            <Text style={styles.title} numberOfLines={2}>
              {isTamil && item.titleTa ? item.titleTa : item.title}
            </Text>

            <Text style={styles.subtitle} numberOfLines={2}>
              {isTamil && item.subtitleTa ? item.subtitleTa : item.subtitle}
            </Text>

            <View style={styles.shopNowBtn}>
              <Text style={styles.shopNowText}>
                {isTamil ? 'இப்போதே வாங்கு ›' : 'Shop Collection ›'}
              </Text>
            </View>
          </View>

          {/* Product Image */}
          <View style={styles.imageContainer}>
            <Image
              source={item.image}
              style={styles.productImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={flatListRef}
        data={HERO_BANNERS}
        renderItem={renderBannerItem}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled={true}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="start"
        contentContainerStyle={styles.listContent}
      />

      {/* Pagination Dots */}
      <View style={styles.paginationDots}>
        {HERO_BANNERS.map((_, index) => (
          <View
            key={`dot-${index}`}
            style={[
              styles.dot,
              activeIndex === index ? styles.activeDot : null,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: SPACING.xs,
  },
  listContent: {
    paddingHorizontal: 0,
  },
  bannerContainer: {
    width: SCREEN_WIDTH,
    height: BANNER_HEIGHT,
    overflow: 'hidden',
  },
  bannerCardBg: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    overflow: 'hidden',
    position: 'relative',
  },
  ambientCircleOne: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  ambientCircleTwo: {
    position: 'absolute',
    left: '20%',
    bottom: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  textContent: {
    flex: 1.15,
    justifyContent: 'center',
    paddingRight: SPACING.sm,
    zIndex: 2,
  },
  tagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 23,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  shopNowBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  shopNowText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  imageContainer: {
    flex: 0.85,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1DCD4',
  },
  activeDot: {
    width: 22,
    backgroundColor: '#1B4D3E',
    borderRadius: 3,
  },
});

export default BannerSlider;
