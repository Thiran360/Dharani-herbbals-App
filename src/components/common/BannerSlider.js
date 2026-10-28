/**
 * Hero Banner Slider Component for Dharani Herbbals
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HERO_BANNERS } from '../../constants/banners';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';

const BANNER_HEIGHT = 205;

export const BannerSlider = () => {
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();
  const circleSize = Math.min(148, Math.round(screenWidth * 0.38));
  const productImageSize = Math.round(circleSize * 0.92);
  const { isTamil } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % HERO_BANNERS.length;
        flatListRef.current?.scrollToOffset({
          offset: nextIndex * screenWidth,
          animated: true,
        });
        return nextIndex;
      });
    }, 4800);

    return () => clearInterval(timer);
  }, [screenWidth]);

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
      event.nativeEvent.contentOffset.x / screenWidth
    );
    if (slideIndex >= 0 && slideIndex < HERO_BANNERS.length) {
      setActiveIndex(slideIndex);
    }
  };

  const renderBannerItem = ({ item }) => {
    const primaryBg = item.bgGradient ? item.bgGradient[0] : '#CEE5D6';
    const imageSource =
      Platform.OS === 'android' && item.drawableName
        ? { uri: item.drawableName }
        : item.image;

    return (
      <TouchableOpacity
        style={[styles.bannerContainer, { width: screenWidth }]}
        onPress={() => handleBannerPress(item)}
        activeOpacity={0.92}
      >
        <View style={[styles.bannerCardBg, { backgroundColor: primaryBg }]}>
          {/* Text Content */}
          <View style={styles.textContent}>
            {item.tag ? (
              <View
                style={[
                  styles.tagBadge,
                  {
                    backgroundColor: 'rgba(255, 255, 255, 0.90)',
                    borderColor: item.accentColor || '#14532D',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: item.accentColor || '#14532D' },
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

          {/* Product Image in Single Circular Frame */}
          <View style={styles.imageContainer}>
            <View
              style={[
                styles.sliderCircleFrame,
                {
                  width: circleSize,
                  height: circleSize,
                  borderRadius: circleSize / 2,
                },
              ]}
            >
              <Image
                source={imageSource}
                defaultSource={item.image}
                style={{ width: productImageSize, height: productImageSize }}
                resizeMode="contain"
              />
            </View>
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
        snapToInterval={screenWidth}
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
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.12)',
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
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  title: {
    color: '#0D3522',
    fontSize: 17.5,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  subtitle: {
    color: '#264E38',
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 10,
    fontWeight: '500',
  },
  shopNowBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#1B4D3E',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    ...Platform.select({
      ios: {
        shadowColor: '#1B4D3E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
        shadowColor: '#1B4D3E',
      },
    }),
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
  sliderCircleFrame: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#82BA9A',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#1B4D3E',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.14,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
        shadowColor: '#1B4D3E',
      },
    }),
  },
  productImage: {},
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
    backgroundColor: '#A3CBB3',
  },
  activeDot: {
    width: 22,
    backgroundColor: '#1B4D3E',
    borderRadius: 3,
  },
});

export default BannerSlider;
