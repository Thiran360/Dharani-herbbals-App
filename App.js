/**
 * Official Dharani Herbbals Mobile Shopping App
 * React Native JavaScript Application
 * Reference: https://dharaniherbbals.in/
 */

import React from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from './src/context/LanguageContext';
import { AuthProvider } from './src/context/AuthContext';
import { WishlistProvider } from './src/context/WishlistContext';
import { CartProvider } from './src/context/CartContext';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <LanguageProvider>
            <AuthProvider>
              <WishlistProvider>
                <CartProvider>
                  <AppNavigator />
                </CartProvider>
              </WishlistProvider>
            </AuthProvider>
          </LanguageProvider>
        </View>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

export default App;
