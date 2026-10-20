/**
 * AnimatedLogo Component for Dharani Herbbals
 * Uses a single unified 6x6 GPU SpriteSheet for 100% flicker-free,
 * zero-blank-frame, hardware-accelerated 3D rotating emblem.
 */

import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

const SPRITE_SHEET = require('../../assets/logo_spritesheet.png');
const COLS = 6;
const ROWS = 6;
const TOTAL_FRAMES = 36;

export const AnimatedLogo = ({ size = 38, style, fps = 20 }) => {
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    const intervalTime = Math.max(30, Math.floor(1000 / fps));
    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % TOTAL_FRAMES);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [fps]);

  const col = currentFrame % COLS;
  const row = Math.floor(currentFrame / COLS);

  return (
    <View style={[{ width: size, height: size }, styles.container, style]}>
      <Image
        source={SPRITE_SHEET}
        style={{
          position: 'absolute',
          width: size * COLS,
          height: size * ROWS,
          left: -col * size,
          top: -row * size,
        }}
        resizeMode="stretch"
        fadeDuration={0}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AnimatedLogo;
