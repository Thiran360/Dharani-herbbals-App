/**
 * Order History Screen for Dharani Herbbals
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../../components/common/Header';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon } from '../../components/common/Icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';

export const OrderHistoryScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrders = async () => {
    if (!user?.id) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      const data = await api.getUserOrders(user.id, user.role || 'customer');
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (e) {
      console.warn('Failed to fetch user orders:', e.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchOrders();
  };

  const renderOrderItem = ({ item }) => {
    const orderId = item.order_id || item.id || 'N/A';
    const dateStr = item.created_at
      ? new Date(item.created_at).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : 'Recent Order';
    const total = parseFloat(item.total_amount || item.amount || 0).toFixed(0);
    const status = (item.status || 'Processing').toUpperCase();
    const isDelivered = status === 'DELIVERED';

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderCardHeader}>
          <View>
            <Text style={styles.orderNumber}>Order #{orderId}</Text>
            <Text style={styles.orderDate}>{dateStr}</Text>
          </View>
          <View style={[styles.statusBadge, isDelivered ? styles.statusDelivered : styles.statusProcessing]}>
            <Text style={[styles.statusText, isDelivered ? styles.statusTextDelivered : styles.statusTextProcessing]}>
              {status}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {item.items && Array.isArray(item.items) ? (
          <View style={styles.itemsList}>
            {item.items.map((prod, idx) => (
              <Text key={`item-${idx}`} style={styles.itemTitle} numberOfLines={1}>
                🌿 {prod.product_name || prod.name} (x{prod.quantity || 1})
              </Text>
            ))}
          </View>
        ) : (
          <Text style={styles.itemsSummary}>
            {item.shipping_address ? `Delivery to: ${item.shipping_address.slice(0, 48)}...` : 'Authentic herbal products package'}
          </Text>
        )}

        <View style={styles.orderCardFooter}>
          <View>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalAmount}>₹{total}</Text>
          </View>

          <TouchableOpacity
            style={styles.trackBtn}
            onPress={() => navigation.navigate('OrderTrackingScreen', { orderId })}
            activeOpacity={0.85}
          >
            <Icon name="truck" size={13} color="#FFFFFF" />
            <Text style={styles.trackBtnText}>Track Order ›</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="My Orders" showBack={true} showCart={true} showLogo={false} />

      {isLoading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color="#1B4D3E" />
          <Text style={styles.loadingText}>Retrieving your order records...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item, idx) => `hist-${item.order_id || item.id || idx}`}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#1B4D3E']} tintColor="#1B4D3E" />
          }
          ListEmptyComponent={
            <EmptyState
              icon="truck"
              title="No Past Orders Found"
              subtitle="You haven't placed any herbal orders yet. Once placed, you can follow delivery transit live right here."
              buttonText="Start Shopping"
              onButtonPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#5A6E62',
    fontWeight: '600',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.small,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1B4D3E',
  },
  orderDate: {
    fontSize: 11.5,
    color: '#8A9E92',
    marginTop: 2,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  statusDelivered: {
    backgroundColor: '#EBF2ED',
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.15)',
  },
  statusProcessing: {
    backgroundColor: '#FEF9EE',
    borderWidth: 1,
    borderColor: 'rgba(200, 150, 62, 0.2)',
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusTextDelivered: {
    color: '#1B4D3E',
  },
  statusTextProcessing: {
    color: '#C8963E',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(27, 77, 62, 0.08)',
    marginVertical: SPACING.sm + 2,
  },
  itemsList: {
    marginBottom: SPACING.sm + 2,
  },
  itemTitle: {
    fontSize: 12.5,
    color: '#14231A',
    lineHeight: 19,
    fontWeight: '500',
  },
  itemsSummary: {
    fontSize: 12,
    color: '#5A6E62',
    marginBottom: SPACING.sm,
    lineHeight: 16,
  },
  orderCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 10.5,
    color: '#8A9E92',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  totalAmount: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1B4D3E',
    marginTop: 1,
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B4D3E',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: RADIUS.full,
    gap: 6,
    ...SHADOWS.small,
  },
  trackBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

export default OrderHistoryScreen;

