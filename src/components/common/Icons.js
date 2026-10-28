/**
 * Professional Vector Icons for Dharani Herbbals Mobile App
 * 100% Native Pure Geometric Vector Components
 * NO EMOJIS - Clean, crisp, high-DPI responsive icons on all mobile screens.
 */

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

const ICON_ASSETS = {
  heart: require('../../assets/icons/heart.png'),
  heartFilled: require('../../assets/icons/heart_filled.png'),
  phone: require('../../assets/icons/phone_call.png'),
  whatsapp: require('../../assets/icons/whatsapp.png'),
  whatsappWhite: require('../../assets/icons/whatsapp_white.png'),
  shieldCheck: require('../../assets/icons/shield_check.png'),
  leaf: require('../../assets/icons/leaf.png'),
  traditionalHerbs: require('../../assets/icons/traditional_herbs.png'),
  heartHandshake: require('../../assets/icons/heart_handshake.png'),
  userProfile: require('../../assets/icons/user_profile.png'),
  share: require('../../assets/icons/share.png'),
};

export const Icon = ({ name, size = 22, color = '#64748b', focused = false }) => {
  const iconColor = focused ? COLORS.primaryDark : color;
  const strokeWidth = 1.8;

  switch (name) {
    // -------------------------------------------------------------
    // 1. HOME ICON (Modern house vector)
    // -------------------------------------------------------------
    case 'home': {
      const w = size * 0.9;
      const h = size * 0.9;
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: w, height: h, alignItems: 'center', justifyContent: 'flex-end' }}>
            {/* Roof Peak */}
            <View
              style={{
                width: w * 0.72,
                height: w * 0.72,
                borderTopWidth: strokeWidth + 0.2,
                borderLeftWidth: strokeWidth + 0.2,
                borderColor: iconColor,
                backgroundColor: focused ? iconColor : 'transparent',
                transform: [{ rotate: '45deg' }],
                position: 'absolute',
                top: 0,
                borderRadius: 2,
              }}
            />
            {/* House Body */}
            <View
              style={{
                width: w * 0.75,
                height: h * 0.54,
                borderWidth: focused ? 0 : strokeWidth,
                borderColor: iconColor,
                backgroundColor: focused ? iconColor : 'transparent',
                borderBottomLeftRadius: 3,
                borderBottomRightRadius: 3,
                alignItems: 'center',
                justifyContent: 'flex-end',
                zIndex: 2,
              }}
            >
              {/* Door Cutout */}
              <View
                style={{
                  width: w * 0.26,
                  height: h * 0.3,
                  backgroundColor: focused ? '#ffffff' : '#ffffff',
                  borderTopLeftRadius: 2,
                  borderTopRightRadius: 2,
                  borderWidth: focused ? 0 : strokeWidth,
                  borderColor: iconColor,
                  borderBottomWidth: 0,
                }}
              />
            </View>
          </View>
        </View>
      );
    }

    // -------------------------------------------------------------
    // 2. CATEGORIES / GRID ICON (Sleek 4-square App Grid)
    // -------------------------------------------------------------
    case 'categories':
    case 'grid': {
      const boxSize = Math.max(6, (size - 7) / 2);
      const gap = 2.5;
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: boxSize * 2 + gap, height: boxSize * 2 + gap }}>
            {/* Row 1 */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: gap }}>
              <View
                style={{
                  width: boxSize,
                  height: boxSize,
                  borderRadius: 2,
                  backgroundColor: focused ? iconColor : 'transparent',
                  borderWidth: focused ? 0 : strokeWidth,
                  borderColor: iconColor,
                }}
              />
              <View
                style={{
                  width: boxSize,
                  height: boxSize,
                  borderRadius: 2,
                  backgroundColor: focused ? iconColor : 'transparent',
                  borderWidth: focused ? 0 : strokeWidth,
                  borderColor: iconColor,
                }}
              />
            </View>
            {/* Row 2 */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View
                style={{
                  width: boxSize,
                  height: boxSize,
                  borderRadius: 2,
                  backgroundColor: focused ? iconColor : 'transparent',
                  borderWidth: focused ? 0 : strokeWidth,
                  borderColor: iconColor,
                }}
              />
              <View
                style={{
                  width: boxSize,
                  height: boxSize,
                  borderRadius: 2,
                  backgroundColor: focused ? iconColor : 'transparent',
                  borderWidth: focused ? 0 : strokeWidth,
                  borderColor: iconColor,
                }}
              />
            </View>
          </View>
        </View>
      );
    }

    // -------------------------------------------------------------
    // 3. SEARCH ICON (Minimalist Lens + Handle Vector)
    // -------------------------------------------------------------
    case 'search': {
      const lensRadius = Math.round(size * 0.32);
      const handleLen = Math.round(size * 0.32);
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: size * 0.9, height: size * 0.9, position: 'relative' }}>
            {/* Circular Glass Lens */}
            <View
              style={{
                width: lensRadius * 2,
                height: lensRadius * 2,
                borderRadius: lensRadius,
                borderWidth: strokeWidth + (focused ? 0.4 : 0),
                borderColor: iconColor,
                backgroundColor: focused ? 'rgba(46, 125, 50, 0.08)' : 'transparent',
                position: 'absolute',
                top: 1,
                left: 1,
              }}
            />
            {/* Angled Handle */}
            <View
              style={{
                width: strokeWidth + 0.4,
                height: handleLen,
                backgroundColor: iconColor,
                borderRadius: 1,
                position: 'absolute',
                bottom: 2,
                right: 3,
                transform: [{ rotate: '-45deg' }],
              }}
            />
          </View>
        </View>
      );
    }

    // -------------------------------------------------------------
    // 4. CART / SHOPPING TOTE ICON (Modern Ecommerce Bag)
    // -------------------------------------------------------------
    case 'cart': {
      const bagW = Math.round(size * 0.76);
      const bagH = Math.round(size * 0.64);
      const handleW = Math.round(bagW * 0.52);
      const handleH = Math.round(size * 0.28);
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ alignItems: 'center', position: 'relative' }}>
            {/* Bag Handle */}
            <View
              style={{
                width: handleW,
                height: handleH,
                borderTopLeftRadius: handleW / 2,
                borderTopRightRadius: handleW / 2,
                borderWidth: strokeWidth,
                borderColor: iconColor,
                borderBottomWidth: 0,
                marginBottom: -1,
              }}
            />
            {/* Bag Body */}
            <View
              style={{
                width: bagW,
                height: bagH,
                borderRadius: 3.5,
                borderWidth: focused ? 0 : strokeWidth,
                borderColor: iconColor,
                backgroundColor: focused ? iconColor : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Bag Logo Accent */}
              <View
                style={{
                  width: bagW * 0.36,
                  height: 1.5,
                  borderRadius: 1,
                  backgroundColor: focused ? '#ffffff' : iconColor,
                  opacity: 0.6,
                }}
              />
            </View>
          </View>
        </View>
      );
    }

    // -------------------------------------------------------------
    // 5. USER / ACCOUNT / PROFILE ICON (High-DPI Silhouette Vector)
    // -------------------------------------------------------------
    case 'user':
    case 'account':
    case 'profile':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={ICON_ASSETS.userProfile}
            style={{ width: size * 0.9, height: size * 0.9, tintColor: iconColor }}
            resizeMode="contain"
          />
        </View>
      );

    // -------------------------------------------------------------
    // 6. HEART / WISHLIST
    // -------------------------------------------------------------
    case 'heart':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={ICON_ASSETS.heart}
            style={{ width: size * 0.95, height: size * 0.95, tintColor: iconColor }}
            resizeMode="contain"
          />
        </View>
      );

    case 'heart-filled':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={ICON_ASSETS.heartFilled}
            style={{
              width: size * 0.95,
              height: size * 0.95,
              tintColor: color && color !== '#64748b' ? color : '#EF4444',
            }}
            resizeMode="contain"
          />
        </View>
      );

    // -------------------------------------------------------------
    // 7. STAR
    // -------------------------------------------------------------
    case 'star':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: size * 0.88, color: COLORS.gold, lineHeight: size }}>★</Text>
        </View>
      );

    case 'star-empty':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: size * 0.88, color: '#cbd5e1', lineHeight: size }}>☆</Text>
        </View>
      );

    // -------------------------------------------------------------
    // 8. ARROW BACK / NAVIGATION CHEVRONS
    // -------------------------------------------------------------
    case 'back':
    case 'arrow-left':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              width: size * 0.4,
              height: size * 0.4,
              borderLeftWidth: 2.2,
              borderBottomWidth: 2.2,
              borderColor: iconColor,
              transform: [{ rotate: '45deg' }],
              marginLeft: 3,
            }}
          />
        </View>
      );

    case 'chevron-right':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              width: size * 0.36,
              height: size * 0.36,
              borderTopWidth: 2,
              borderRightWidth: 2,
              borderColor: iconColor,
              transform: [{ rotate: '45deg' }],
              marginRight: 2,
            }}
          />
        </View>
      );

    case 'chevron-down':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              width: size * 0.36,
              height: size * 0.36,
              borderBottomWidth: 2,
              borderRightWidth: 2,
              borderColor: iconColor,
              transform: [{ rotate: '45deg' }],
              marginBottom: 2,
            }}
          />
        </View>
      );

    // -------------------------------------------------------------
    // 9. PLUS / MINUS / TRASH / CHECK / CLOSE
    // -------------------------------------------------------------
    case 'plus':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: size * 0.6, height: 2, backgroundColor: iconColor, borderRadius: 1 }} />
          <View style={{ width: 2, height: size * 0.6, backgroundColor: iconColor, borderRadius: 1, position: 'absolute' }} />
        </View>
      );

    case 'minus':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: size * 0.6, height: 2, backgroundColor: iconColor, borderRadius: 1 }} />
        </View>
      );

    case 'trash':
    case 'delete':
    case 'remove': {
      const canWidth = Math.max(9, Math.round(size * 0.65));
      const canHeight = Math.max(10, Math.round(size * 0.78));
      const lidWidth = Math.round(canWidth * 1.2);
      const handleWidth = Math.max(4, Math.round(canWidth * 0.45));
      const stroke = size <= 14 ? 1.3 : 1.6;

      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: lidWidth, height: canHeight, alignItems: 'center', justifyContent: 'center' }}>
            {/* Top Handle */}
            <View
              style={{
                width: handleWidth,
                height: 1.8,
                borderTopLeftRadius: 1.5,
                borderTopRightRadius: 1.5,
                backgroundColor: iconColor,
                marginBottom: 1,
              }}
            />
            {/* Horizontal Lid */}
            <View
              style={{
                width: lidWidth,
                height: stroke + 0.2,
                backgroundColor: iconColor,
                borderRadius: 1,
              }}
            />
            {/* Bin Body */}
            <View
              style={{
                width: canWidth,
                flex: 1,
                borderWidth: stroke,
                borderColor: iconColor,
                borderTopWidth: 0,
                borderBottomLeftRadius: 2.5,
                borderBottomRightRadius: 2.5,
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                paddingTop: 1.5,
                paddingBottom: 2,
              }}
            >
              {size >= 14 && (
                <>
                  <View style={{ width: stroke * 0.8, height: '65%', backgroundColor: iconColor, borderRadius: 0.5 }} />
                  <View style={{ width: stroke * 0.8, height: '65%', backgroundColor: iconColor, borderRadius: 0.5 }} />
                </>
              )}
            </View>
          </View>
        </View>
      );
    }

    case 'check':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              width: size * 0.55,
              height: size * 0.32,
              borderLeftWidth: 2.4,
              borderBottomWidth: 2.4,
              borderColor: iconColor,
              transform: [{ rotate: '-45deg' }],
              marginBottom: 2,
            }}
          />
        </View>
      );

    case 'close':
    case 'x':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: size * 0.65, height: 2, backgroundColor: iconColor, borderRadius: 1, transform: [{ rotate: '45deg' }] }} />
          <View style={{ width: size * 0.65, height: 2, backgroundColor: iconColor, borderRadius: 1, transform: [{ rotate: '-45deg' }], position: 'absolute' }} />
        </View>
      );

    // -------------------------------------------------------------
    // 10. TRUCK / DELIVERY
    // -------------------------------------------------------------
    case 'truck':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: size * 0.9, height: size * 0.62, flexDirection: 'row', alignItems: 'flex-end' }}>
            {/* Cargo Box */}
            <View
              style={{
                width: '60%',
                height: '100%',
                borderWidth: 1.6,
                borderColor: iconColor,
                borderRadius: 2,
                backgroundColor: focused ? iconColor : 'transparent',
              }}
            />
            {/* Cab */}
            <View
              style={{
                width: '38%',
                height: '75%',
                borderWidth: 1.6,
                borderLeftWidth: 0,
                borderColor: iconColor,
                borderTopRightRadius: 5,
                borderBottomRightRadius: 2,
                backgroundColor: focused ? iconColor : 'transparent',
                marginLeft: 1,
              }}
            />
          </View>
          {/* Wheels */}
          <View style={{ width: size * 0.8, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2, marginTop: -2 }}>
            <View style={{ width: 4.5, height: 4.5, borderRadius: 2.25, backgroundColor: iconColor }} />
            <View style={{ width: 4.5, height: 4.5, borderRadius: 2.25, backgroundColor: iconColor }} />
          </View>
        </View>
      );

    // -------------------------------------------------------------
    // 11. SHIELD / QUALITY / VERIFIED
    // -------------------------------------------------------------
    case 'shield':
    case 'quality':
    case 'shield-check':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={ICON_ASSETS.shieldCheck}
            style={{ width: size * 0.95, height: size * 0.95, tintColor: iconColor }}
            resizeMode="contain"
          />
        </View>
      );

    // -------------------------------------------------------------
    // 12. LEAF / NATURAL
    // -------------------------------------------------------------
    case 'leaf':
    case 'natural':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={ICON_ASSETS.leaf}
            style={{ width: size * 0.95, height: size * 0.95, tintColor: iconColor }}
            resizeMode="contain"
          />
        </View>
      );

    // -------------------------------------------------------------
    // 12B. ROOTED IN TRADITION / HERBAL SPRIG
    // -------------------------------------------------------------
    case 'tradition':
    case 'traditional':
    case 'herbal':
    case 'heritage':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={ICON_ASSETS.traditionalHerbs}
            style={{ width: size * 0.95, height: size * 0.95, tintColor: iconColor }}
            resizeMode="contain"
          />
        </View>
      );

    // -------------------------------------------------------------
    // 12C. CUSTOMER FOCUSED / HEART-HANDSHAKE CARE
    // -------------------------------------------------------------
    case 'customer':
    case 'customer-focused':
    case 'heart-handshake':
    case 'handshake':
    case 'care':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={ICON_ASSETS.heartHandshake}
            style={{ width: size * 0.95, height: size * 0.95, tintColor: iconColor }}
            resizeMode="contain"
          />
        </View>
      );

    // -------------------------------------------------------------
    // 13. PHONE / CALL
    // -------------------------------------------------------------
    case 'phone':
    case 'call':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={ICON_ASSETS.phone}
            style={{ width: size * 0.95, height: size * 0.95, tintColor: iconColor }}
            resizeMode="contain"
          />
        </View>
      );

    // -------------------------------------------------------------
    // 14. MAIL
    // -------------------------------------------------------------
    case 'mail':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              width: size * 0.85,
              height: size * 0.62,
              borderRadius: 2.5,
              borderWidth: 1.8,
              borderColor: iconColor,
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}
          >
            {/* Envelope V Flap */}
            <View
              style={{
                width: size * 0.44,
                height: size * 0.44,
                borderBottomWidth: 1.5,
                borderRightWidth: 1.5,
                borderColor: iconColor,
                transform: [{ rotate: '45deg' }],
                marginTop: -size * 0.15,
              }}
            />
          </View>
        </View>
      );

    // -------------------------------------------------------------
    // 15. WHATSAPP
    // -------------------------------------------------------------
    case 'whatsapp': {
      const isWhite = color === '#FFFFFF' || color === '#ffffff' || color === '#FFF';
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={isWhite ? ICON_ASSETS.whatsappWhite : ICON_ASSETS.whatsapp}
            style={{
              width: size,
              height: size,
              ...(isWhite ? { tintColor: '#FFFFFF' } : {}),
            }}
            resizeMode="contain"
          />
        </View>
      );
    }

    // -------------------------------------------------------------
    // 16. MAP PIN
    // -------------------------------------------------------------
    case 'map-pin':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ alignItems: 'center', marginTop: -2 }}>
            <View
              style={{
                width: size * 0.54,
                height: size * 0.54,
                borderRadius: (size * 0.54) / 2,
                borderWidth: 1.8,
                borderColor: iconColor,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: iconColor }} />
            </View>
            <View
              style={{
                width: 0,
                height: 0,
                borderLeftWidth: 3,
                borderRightWidth: 3,
                borderTopWidth: 5,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderTopColor: iconColor,
                marginTop: -1,
              }}
            />
          </View>
        </View>
      );

    // -------------------------------------------------------------
    // 17. CLOCK
    // -------------------------------------------------------------
    case 'clock':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              width: size * 0.8,
              height: size * 0.8,
              borderRadius: size * 0.4,
              borderWidth: 1.8,
              borderColor: iconColor,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View style={{ width: 1.5, height: '40%', backgroundColor: iconColor, position: 'absolute', top: 3 }} />
            <View style={{ width: '35%', height: 1.5, backgroundColor: iconColor, position: 'absolute', right: 3 }} />
          </View>
        </View>
      );

    // -------------------------------------------------------------
    // 17B. SHARE / SHARE-2 ICON
    // -------------------------------------------------------------
    case 'share':
    case 'share-2':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={ICON_ASSETS.share}
            style={{ width: size * 0.95, height: size * 0.95, tintColor: iconColor }}
            resizeMode="contain"
          />
        </View>
      );

    // -------------------------------------------------------------
    // 18. SPARKLES
    // -------------------------------------------------------------
    case 'sparkles':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              width: size * 0.44,
              height: size * 0.44,
              borderWidth: 1.8,
              borderColor: iconColor,
              transform: [{ rotate: '45deg' }],
              borderRadius: 2,
            }}
          />
        </View>
      );

    case 'list':
    case 'menu':
      return (
        <View style={{ width: size, height: size, justifyContent: 'space-evenly', alignItems: 'center', paddingVertical: size * 0.18 }}>
          <View style={{ width: size * 0.75, height: 2, backgroundColor: iconColor, borderRadius: 1 }} />
          <View style={{ width: size * 0.75, height: 2, backgroundColor: iconColor, borderRadius: 1 }} />
          <View style={{ width: size * 0.75, height: 2, backgroundColor: iconColor, borderRadius: 1 }} />
        </View>
      );

    case 'edit':
    case 'pencil':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              width: size * 0.68,
              height: size * 0.26,
              borderWidth: 1.8,
              borderColor: iconColor,
              borderRadius: 2,
              transform: [{ rotate: '-45deg' }],
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingLeft: 2,
            }}
          >
            <View style={{ width: 1.5, height: '100%', backgroundColor: iconColor }} />
          </View>
        </View>
      );

    // -------------------------------------------------------------
    // 19. GLOBE / LANGUAGES (Clean circular meridian globe)
    // -------------------------------------------------------------
    case 'globe':
    case 'language':
    case 'languages': {
      const d = Math.round(size * 0.82);
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              width: d,
              height: d,
              borderRadius: d / 2,
              borderWidth: strokeWidth,
              borderColor: iconColor,
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Equator line */}
            <View style={{ width: '100%', height: strokeWidth, backgroundColor: iconColor }} />
            {/* Meridian ellipse */}
            <View
              style={{
                position: 'absolute',
                width: d * 0.48,
                height: d,
                borderRadius: d * 0.24,
                borderWidth: strokeWidth,
                borderColor: iconColor,
              }}
            />
          </View>
        </View>
      );
    }

    // -------------------------------------------------------------
    // 20. PACKAGE / BOX (Ecommerce parcel)
    // -------------------------------------------------------------
    case 'package':
    case 'box':
    case 'order': {
      const w = Math.round(size * 0.82);
      const h = Math.round(size * 0.72);
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              width: w,
              height: h,
              borderWidth: strokeWidth,
              borderColor: iconColor,
              borderRadius: 3,
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}
          >
            {/* Top tape / flap line */}
            <View
              style={{
                width: '100%',
                height: strokeWidth,
                backgroundColor: iconColor,
                marginTop: h * 0.28,
              }}
            />
            {/* Vertical center tape */}
            <View
              style={{
                position: 'absolute',
                width: w * 0.28,
                height: h * 0.3,
                borderWidth: strokeWidth,
                borderColor: iconColor,
                borderTopWidth: 0,
                backgroundColor: focused ? iconColor : 'transparent',
              }}
            />
          </View>
        </View>
      );
    }

    // -------------------------------------------------------------
    // 21. HEADSET / SUPPORT
    // -------------------------------------------------------------
    case 'headset':
    case 'support': {
      const w = Math.round(size * 0.82);
      const h = Math.round(size * 0.8);
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: w, height: h, alignItems: 'center', position: 'relative' }}>
            {/* Headband Arc */}
            <View
              style={{
                width: w,
                height: h * 0.7,
                borderTopLeftRadius: w / 2,
                borderTopRightRadius: w / 2,
                borderWidth: strokeWidth,
                borderColor: iconColor,
                borderBottomWidth: 0,
              }}
            />
            {/* Left Ear Cushion */}
            <View
              style={{
                position: 'absolute',
                left: 0,
                bottom: h * 0.15,
                width: w * 0.2,
                height: h * 0.42,
                borderRadius: 2.5,
                backgroundColor: iconColor,
              }}
            />
            {/* Right Ear Cushion */}
            <View
              style={{
                position: 'absolute',
                right: 0,
                bottom: h * 0.15,
                width: w * 0.2,
                height: h * 0.42,
                borderRadius: 2.5,
                backgroundColor: iconColor,
              }}
            />
            {/* Microphone Boom */}
            <View
              style={{
                position: 'absolute',
                right: w * 0.1,
                bottom: 0,
                width: w * 0.42,
                height: strokeWidth + 0.2,
                backgroundColor: iconColor,
                borderRadius: 1,
              }}
            />
          </View>
        </View>
      );
    }

    // -------------------------------------------------------------
    // 22. FILE-TEXT / DOCUMENT / POLICIES
    // -------------------------------------------------------------
    case 'file-text':
    case 'document':
    case 'policy': {
      const w = Math.round(size * 0.68);
      const h = Math.round(size * 0.84);
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              width: w,
              height: h,
              borderWidth: strokeWidth,
              borderColor: iconColor,
              borderRadius: 2.5,
              padding: 3,
              justifyContent: 'space-evenly',
            }}
          >
            <View style={{ width: '80%', height: 1.5, backgroundColor: iconColor, borderRadius: 1 }} />
            <View style={{ width: '100%', height: 1.5, backgroundColor: iconColor, borderRadius: 1 }} />
            <View style={{ width: '60%', height: 1.5, backgroundColor: iconColor, borderRadius: 1 }} />
          </View>
        </View>
      );
    }

    // -------------------------------------------------------------
    // 23. LOGOUT / EXIT
    // -------------------------------------------------------------
    case 'logout':
    case 'log-out': {
      const w = Math.round(size * 0.8);
      const h = Math.round(size * 0.8);
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: w, height: h, position: 'relative', justifyContent: 'center' }}>
            {/* Door Frame (open) */}
            <View
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: w * 0.55,
                height: h,
                borderWidth: strokeWidth,
                borderRightWidth: 0,
                borderColor: iconColor,
                borderTopLeftRadius: 3,
                borderBottomLeftRadius: 3,
              }}
            />
            {/* Arrow shaft */}
            <View
              style={{
                position: 'absolute',
                left: w * 0.28,
                width: w * 0.54,
                height: strokeWidth,
                backgroundColor: iconColor,
              }}
            />
            {/* Arrow head */}
            <View
              style={{
                position: 'absolute',
                right: 0,
                width: w * 0.32,
                height: w * 0.32,
                borderTopWidth: strokeWidth,
                borderRightWidth: strokeWidth,
                borderColor: iconColor,
                transform: [{ rotate: '45deg' }],
              }}
            />
          </View>
        </View>
      );
    }

    default:
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: iconColor }} />
        </View>
      );
  }
};

export default Icon;
