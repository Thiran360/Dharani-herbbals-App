import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { Icon } from './Icons';

export const EmptyState = ({
  icon = 'cart',
  title = 'No items found',
  subtitle = 'Try checking other categories or products.',
  buttonText = 'Browse Products',
  onButtonPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircleOuter}>
        <View style={styles.iconCircle}>
          <Icon name={icon} size={34} color={COLORS.primary} />
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {buttonText && onButtonPress ? (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onButtonPress}
          activeOpacity={0.85}
        >
          <Text style={styles.actionBtnText}>{buttonText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  iconCircleOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(27, 77, 62, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EBF2ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(27, 77, 62, 0.12)',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryDarker,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 290,
    marginBottom: SPACING.lg,
  },
  actionBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 26,
    paddingVertical: 13,
    borderRadius: RADIUS.full,
    ...SHADOWS.small,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

export default EmptyState;

