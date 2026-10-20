/**
 * App Navigation Architecture for Dharani Herbbals
 * Responsive on ALL mobile screens (iPhone Dynamic Island, Android punch-holes, notch, bottom gesture bars)
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { Icon } from '../components/common/Icons';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

// Screens
import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import CategoriesScreen from '../screens/Categories/CategoriesScreen';
import ProductListScreen from '../screens/Products/ProductListScreen';
import ProductDetailsScreen from '../screens/ProductDetails/ProductDetailsScreen';
import SearchScreen from '../screens/Search/SearchScreen';
import CartScreen from '../screens/Cart/CartScreen';
import CheckoutScreen from '../screens/Checkout/CheckoutScreen';
import OrderSuccessScreen from '../screens/Orders/OrderSuccessScreen';
import OrderTrackingScreen from '../screens/Orders/OrderTrackingScreen';
import OrderHistoryScreen from '../screens/Orders/OrderHistoryScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import OtpScreen from '../screens/Auth/OtpScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import AddressesScreen from '../screens/Profile/AddressesScreen';
import WishlistScreen from '../screens/Profile/WishlistScreen';
import AboutScreen from '../screens/About/AboutScreen';
import ContactScreen from '../screens/Contact/ContactScreen';
import PoliciesScreen from '../screens/Policies/PoliciesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const { totalItemCount } = useCart();
  const { isTamil } = useLanguage();

  // Bottom inset adapts across all mobile devices
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 12);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#7D8E83',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: 'rgba(27, 77, 62, 0.08)',
          height: 60 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 6,
          ...SHADOWS.medium,
        },
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: '700',
          letterSpacing: 0.2,
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: isTamil ? 'முகப்பு' : 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconWrapper, focused && styles.tabIconWrapperFocused]}>
              <Icon name="home" size={22} color={color} focused={focused} />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="CategoriesTab"
        component={CategoriesScreen}
        options={{
          tabBarLabel: isTamil ? 'பிரிவுகள்' : 'Categories',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconWrapper, focused && styles.tabIconWrapperFocused]}>
              <Icon name="categories" size={21} color={color} focused={focused} />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{
          tabBarLabel: isTamil ? 'தேடல்' : 'Search',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconWrapper, focused && styles.tabIconWrapperFocused]}>
              <Icon name="search" size={21} color={color} focused={focused} />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          tabBarLabel: isTamil ? 'கூடை' : 'Cart',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconWrapper, focused && styles.tabIconWrapperFocused]}>
              <View style={{ position: 'relative' }}>
                <Icon name="cart" size={22} color={color} focused={focused} />
                {totalItemCount > 0 ? (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>
                      {totalItemCount > 9 ? '9+' : totalItemCount}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="AccountTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: isTamil ? 'கணக்கு' : 'Account',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconWrapper, focused && styles.tabIconWrapperFocused]}>
              <Icon name="account" size={22} color={color} focused={focused} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Fallback redirectors: ensures any navigation to tab names directly from the root stack seamlessly redirects to MainTabs without warnings
const createTabRedirect = (tabName) => {
  const TabRedirect = ({ navigation }) => {
    React.useEffect(() => {
      navigation.replace('MainTabs', { screen: tabName });
    }, [navigation]);
    return null;
  };
  return TabRedirect;
};

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SplashScreen"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
        <Stack.Screen name="ProductListScreen" component={ProductListScreen} />
        <Stack.Screen name="ProductDetailsScreen" component={ProductDetailsScreen} />
        <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
        <Stack.Screen name="OrderSuccessScreen" component={OrderSuccessScreen} />
        <Stack.Screen name="OrderTrackingScreen" component={OrderTrackingScreen} />
        <Stack.Screen name="OrderHistoryScreen" component={OrderHistoryScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="OtpScreen" component={OtpScreen} />
        <Stack.Screen name="AddressesScreen" component={AddressesScreen} />
        <Stack.Screen name="WishlistScreen" component={WishlistScreen} />
        <Stack.Screen name="AboutScreen" component={AboutScreen} />
        <Stack.Screen name="ContactScreen" component={ContactScreen} />
        <Stack.Screen name="PoliciesScreen" component={PoliciesScreen} />

        {/* Tab Route Aliases on Root Stack to prevent unhandled navigation warnings */}
        <Stack.Screen name="HomeTab" component={createTabRedirect('HomeTab')} />
        <Stack.Screen name="CategoriesTab" component={createTabRedirect('CategoriesTab')} />
        <Stack.Screen name="SearchTab" component={createTabRedirect('SearchTab')} />
        <Stack.Screen name="CartTab" component={createTabRedirect('CartTab')} />
        <Stack.Screen name="AccountTab" component={createTabRedirect('AccountTab')} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabIconWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapperFocused: {
    backgroundColor: '#EBF2ED',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -9,
    backgroundColor: '#D9534F',
    minWidth: 17,
    height: 17,
    borderRadius: 8.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});

export default AppNavigator;
