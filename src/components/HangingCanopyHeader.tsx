import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
  Platform,
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Path,
  Circle,
  Rect,
  G,
  Ellipse,
  Polygon,
} from 'react-native-svg';

interface HangingCanopyHeaderProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onRestart: () => void;
}

/**
 * HangingCanopyHeader
 *
 * Storybook Hanging Carved Wooden Signboards suspended by natural hemp ropes
 * from an overhead lush canopy branch.
 *
 * Designed with Studio Ghibli / Yoshi's Crafted World / Ustwo storybook aesthetics.
 */
export const HangingCanopyHeader: React.FC<HangingCanopyHeaderProps> = ({
  isMuted,
  onToggleMute,
  onRestart,
}) => {
  const swayAnim = useRef(new Animated.Value(0)).current;

  // Gentle storybook breeze sway for the hanging wooden signboard
  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(swayAnim, {
          toValue: 1,
          duration: 3400,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(swayAnim, {
          toValue: -1,
          duration: 3400,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [swayAnim]);

  const rotateZ = swayAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-1.2deg', '0deg', '1.2deg'],
  });

  return (
    <View style={styles.container}>
      {/* 1. Overhead Canopy Branch & Natural Hemp Ropes SVG */}
      <View style={styles.svgOverlay} pointerEvents="none">
        <Svg width="100%" height={88} viewBox="0 0 420 88" preserveAspectRatio="xMidYMid meet">
          <Defs>
            {/* Canopy Branch Bark Gradient */}
            <LinearGradient id="branchBark" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#6D431D" />
              <Stop offset="40%" stopColor="#4E2E10" />
              <Stop offset="85%" stopColor="#3A2108" />
              <Stop offset="100%" stopColor="#241303" />
            </LinearGradient>

            {/* Hemp Rope Fiber Gradient */}
            <LinearGradient id="hempRope" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#8D6E42" />
              <Stop offset="30%" stopColor="#C9AC73" />
              <Stop offset="70%" stopColor="#E2CCA0" />
              <Stop offset="90%" stopColor="#A88753" />
              <Stop offset="100%" stopColor="#6E4F23" />
            </LinearGradient>

            {/* Signboard Wood Gradient */}
            <LinearGradient id="signboardWood" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#9C6632" />
              <Stop offset="35%" stopColor="#7E4A1E" />
              <Stop offset="80%" stopColor="#5E3210" />
              <Stop offset="100%" stopColor="#432107" />
            </LinearGradient>

            {/* Leaf Gradient */}
            <LinearGradient id="leafGradH" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#A5D6A7" />
              <Stop offset="50%" stopColor="#66BB6A" />
              <Stop offset="100%" stopColor="#2E7D32" />
            </LinearGradient>

            {/* Medallion Wood Gradient */}
            <RadialGradient id="medallionWood" cx="40%" cy="35%" r="65%">
              <Stop offset="0%" stopColor="#C28854" />
              <Stop offset="60%" stopColor="#8D5B28" />
              <Stop offset="100%" stopColor="#5A3312" />
            </RadialGradient>
          </Defs>

          {/* 1. OVERHEAD CANOPY BRANCH */}
          {/* Main Branch Trunk */}
          <Path
            d="M -10 12 
               Q 110 6 210 14 
               Q 310 8 430 13 
               L 430 -5 L -10 -5 Z"
            fill="url(#branchBark)"
          />
          {/* Branch Underside Shadow */}
          <Path
            d="M -10 12 Q 110 6 210 14 Q 310 8 430 13"
            stroke="#1B0C02"
            strokeWidth="3.5"
            fill="none"
          />
          {/* Branch Top Sunlight Highlight */}
          <Path
            d="M -10 4 Q 110 0 210 6 Q 310 1 430 5"
            stroke="#BCA073"
            strokeWidth="2"
            fill="none"
            opacity="0.6"
          />

          {/* Sprouting Forest Leaves & Ivy Sprigs on Branch */}
          {/* Leaf cluster 1 (Left) */}
          <Path d="M 28 8 C 24 -2, 42 -6, 52 4 C 42 12, 34 14, 28 8 Z" fill="url(#leafGradH)" />
          <Path d="M 28 8 Q 40 2 52 4" stroke="#DCEDC8" strokeWidth="1" fill="none" />
          <Path d="M 44 10 C 48 2, 64 2, 70 12 C 60 16, 50 16, 44 10 Z" fill="#43A047" />

          {/* Leaf cluster 2 (Center) */}
          <Path d="M 178 10 C 182 -4, 202 -2, 206 8 C 196 16, 186 16, 178 10 Z" fill="url(#leafGradH)" />
          <Path d="M 178 10 Q 192 2 206 8" stroke="#DCEDC8" strokeWidth="1" fill="none" />

          {/* Leaf cluster 3 (Right) */}
          <Path d="M 310 9 C 306 -3, 326 -5, 334 5 C 324 13, 316 15, 310 9 Z" fill="url(#leafGradH)" />
          <Path d="M 390 10 C 386 -2, 404 -4, 412 6 C 404 14, 396 16, 390 10 Z" fill="url(#leafGradH)" />

          {/* 2. NATURAL HEMP ROPES SUSPENDING MAIN SIGNBOARD */}
          {/* Left Hemp Rope */}
          <Path
            d="M 96 11 L 96 46"
            stroke="url(#hempRope)"
            strokeWidth="5"
            strokeDasharray="4 2"
            strokeLinecap="round"
          />
          {/* Rope shadow cord */}
          <Path d="M 94 11 L 94 46" stroke="#45240E" strokeWidth="1" opacity="0.6" />
          {/* Top Knotted Coil on Branch */}
          <Ellipse cx="96" cy="12" rx="5" ry="3.5" fill="#C9AC73" stroke="#5C3C15" strokeWidth="1" />
          {/* Bottom Tied Ring on Signboard */}
          <Circle cx="96" cy="45" r="4.5" fill="#C9AC73" stroke="#5C3C15" strokeWidth="1.2" />

          {/* Right Hemp Rope */}
          <Path
            d="M 234 12 L 234 46"
            stroke="url(#hempRope)"
            strokeWidth="5"
            strokeDasharray="4 2"
            strokeLinecap="round"
          />
          <Path d="M 232 12 L 232 46" stroke="#45240E" strokeWidth="1" opacity="0.6" />
          <Ellipse cx="234" cy="13" rx="5" ry="3.5" fill="#C9AC73" stroke="#5C3C15" strokeWidth="1" />
          <Circle cx="234" cy="45" r="4.5" fill="#C9AC73" stroke="#5C3C15" strokeWidth="1.2" />

          {/* 3. NATURAL HEMP ROPES SUSPENDING CONTROL MEDALLIONS */}
          {/* Sound button rope */}
          <Path
            d="M 346 11 L 346 36"
            stroke="url(#hempRope)"
            strokeWidth="3.5"
            strokeDasharray="3 2"
            strokeLinecap="round"
          />
          <Circle cx="346" cy="35" r="3.5" fill="#C9AC73" stroke="#5C3C15" strokeWidth="1" />

          {/* Restart button rope */}
          <Path
            d="M 390 12 L 390 36"
            stroke="url(#hempRope)"
            strokeWidth="3.5"
            strokeDasharray="3 2"
            strokeLinecap="round"
          />
          <Circle cx="390" cy="35" r="3.5" fill="#C9AC73" stroke="#5C3C15" strokeWidth="1" />
        </Svg>
      </View>

      {/* 2. Interactive Layer: Hanging Signboard & Action Medallions */}
      <View style={styles.contentRow}>
        {/* Main Hanging Carved Wooden Signboard (with storybook breeze sway) */}
        <Animated.View
          style={[
            styles.signboardAnimatedWrapper,
            {
              transform: [{ rotateZ }],
            },
          ]}
        >
          <View style={styles.signboardBody}>
            {/* Wooden Plank Texture & Relief Bevel */}
            <View style={styles.signboardPlank}>
              {/* Wood Nails / Eyelet Pegs */}
              <View style={[styles.nailPeg, styles.nailPegLeft]} />
              <View style={[styles.nailPeg, styles.nailPegRight]} />

              {/* Title Content */}
              <View style={styles.signboardContent}>
                <View style={styles.mainTitlePill}>
                  <Text style={styles.titlePetPals}>🐾 PET PALS</Text>
                </View>
                <View style={styles.subtitleBanner}>
                  <Text style={styles.subtitleMagic}>✨ MAGIC MATCH ✨</Text>
                </View>
              </View>

              {/* Bottom decorative carved wood notch */}
              <View style={styles.signboardNotch} />
            </View>
          </View>
        </Animated.View>

        {/* Action Controls: Hanging Wooden Medallions */}
        <View style={styles.controlsCluster}>
          {/* Sound Toggle Medallion */}
          <TouchableOpacity
            style={styles.medallionButton}
            onPress={onToggleMute}
            activeOpacity={0.75}
            accessibilityLabel={isMuted ? 'Unmute sound' : 'Mute sound'}
          >
            {/* Golden Beveled Wooden Rim */}
            <View style={styles.medallionFace}>
              <Text style={styles.medallionIcon}>{isMuted ? '🔇' : '🔊'}</Text>
            </View>
            <View style={styles.medallionHangerRope} />
          </TouchableOpacity>

          {/* Restart Game Medallion */}
          <TouchableOpacity
            style={styles.medallionButton}
            onPress={onRestart}
            activeOpacity={0.75}
            accessibilityLabel="Restart game"
          >
            <View style={styles.medallionFace}>
              <Text style={styles.medallionIcon}>🔄</Text>
            </View>
            <View style={styles.medallionHangerRope} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 440,
    height: 86,
    position: 'relative',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    marginBottom: 2,
    zIndex: 20,
  },
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 88,
    zIndex: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
    zIndex: 2,
    paddingBottom: 4,
  },

  // Main Hanging Carved Wooden Signboard
  signboardAnimatedWrapper: {
    marginLeft: 62, // Aligns cleanly under the twin hanging ropes
    transformOrigin: 'top center',
  },
  signboardBody: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  signboardPlank: {
    backgroundColor: '#8D5B28', // Rich chestnut wood
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderWidth: 3,
    borderTopColor: '#D7A15C', // Sunlit chamfer highlight
    borderLeftColor: '#C28854',
    borderBottomColor: '#3E1F09', // Deep carved drop shadow
    borderRightColor: '#5A3312',
    position: 'relative',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow:
          '0 8px 18px rgba(45, 22, 7, 0.45), inset 0 2px 4px rgba(255, 235, 170, 0.3)',
      },
      default: {
        shadowColor: '#3E1F09',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.45,
        shadowRadius: 8,
        elevation: 6,
      },
    }),
  },
  signboardContent: {
    alignItems: 'center',
    gap: 2,
  },
  mainTitlePill: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFA000',
  },
  titlePetPals: {
    color: '#D84315',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(255, 213, 79, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitleBanner: {
    backgroundColor: '#FF6F00',
    paddingHorizontal: 8,
    paddingVertical: 1.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFE082',
    marginTop: -2,
  },
  subtitleMagic: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  nailPeg: {
    position: 'absolute',
    top: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#42210B',
    borderWidth: 1,
    borderColor: '#FFD54F',
  },
  nailPegLeft: {
    left: 8,
  },
  nailPegRight: {
    right: 8,
  },
  signboardNotch: {
    position: 'absolute',
    bottom: -4,
    width: 24,
    height: 4,
    backgroundColor: '#5A3312',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },

  // Action Controls Cluster (Hanging Medallions)
  controlsCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 4,
  },
  medallionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  medallionFace: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#8D5B28', // Carved wood medallion
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderTopColor: '#FFE082',
    borderLeftColor: '#C28854',
    borderBottomColor: '#3E1F09',
    borderRightColor: '#5A3312',
    ...Platform.select({
      web: {
        boxShadow:
          '0 5px 12px rgba(45, 22, 7, 0.4), inset 0 2px 4px rgba(255, 235, 170, 0.25)',
      },
      default: {
        shadowColor: '#3E1F09',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 5,
      },
    }),
  },
  medallionIcon: {
    fontSize: 17,
  },
  medallionHangerRope: {
    position: 'absolute',
    top: -6,
    width: 4,
    height: 6,
    backgroundColor: '#C9AC73',
    borderRadius: 2,
  },
});
