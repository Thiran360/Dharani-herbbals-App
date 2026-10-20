/**
 * Categories Screen for Dharani Herbbals
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../../components/common/Header';
import { CategoryCard } from '../../components/common/CategoryCard';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { STATIC_CATEGORIES } from '../../constants/categories';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

export const CategoriesScreen = () => {
  const { isTamil } = useLanguage();
  const [categories, setCategories] = useState(STATIC_CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories();
      if (Array.isArray(data) && data.length > 0) {
        setCategories(data);
      }
    } catch (e) {
      console.warn('Failed to fetch categories:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchCategories();
  };

  return (
    <View style={styles.container}>
      <Header
        title={isTamil ? 'அனைத்து பிரிவுகள்' : 'Botanical Collections'}
        showLogo={false}
      />

      {isLoading ? (
        <View style={styles.loaderCenter}>
          <ActivityIndicator size="large" color="#1B4D3E" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* Editorial Category Header Card */}
          <View style={styles.heroIntroCard}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>HERBAL TAXONOMY</Text>
            </View>
            <Text style={styles.heroTitle}>Time-Honored Siddha Collections</Text>
            <Text style={styles.heroSubtitle}>
              {isTamil
                ? 'பாரம்பரிய சித்த & ஆயுர்வேத மூலிகை மருத்துவ தயாரிப்புகள். 100% இயற்கை முறையில் தயாரிக்கப்பட்டது.'
                : 'Explore our specialized herbal categories crafted strictly in accordance with traditional Siddha & Ayurvedic texts.'}
            </Text>
          </View>

          {categories.map(cat => (
            <CategoryCard
              key={`cat-grid-${cat.id}`}
              category={cat}
              variant="grid"
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.hero,
  },
  heroIntroCard: {
    backgroundColor: '#FAF8F5',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.35)',
    ...SHADOWS.small,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EBF2ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    marginBottom: 6,
  },
  heroBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#1B4D3E',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#133E2B',
    marginBottom: 4,
    letterSpacing: 0.1,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#5A6E62',
    lineHeight: 17,
  },
  loaderCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CategoriesScreen;
