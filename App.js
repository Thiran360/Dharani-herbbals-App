/**
 * Official Dharani Herbbals Mobile Shopping App
 * React Native JavaScript Application
 * Reference: https://dharaniherbbals.in/
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from './src/context/LanguageContext';
import { AuthProvider } from './src/context/AuthContext';
import { WishlistProvider } from './src/context/WishlistContext';
import { CartProvider } from './src/context/CartContext';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <LanguageProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <AppNavigator />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

export default App;
