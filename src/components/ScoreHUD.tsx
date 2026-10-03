import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Circle,
  Path,
  Rect,
  G,
  Ellipse,
  Polygon,
  Text as SvgText,
} from 'react-native-svg';
import { GAME_RULES } from '../constants/theme';

interface ScoreHUDProps {
  score: number;
  moves: number;
  combo: number;
  praiseMessage: string | null;
}

/**
 * 3D Golden Paw Badge with glowing jewel numbers
 */
const GoldenPawBadge: React.FC<{ moves: number }> = ({ moves }) => {
  const isWarning = moves <= 5;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const prevMovesRef = useRef(moves);

  // Tactile bounce on move decrement
  useEffect(() => {
    if (prevMovesRef.current !== moves) {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.14,
          duration: 90,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(bounceAnim, {
          toValue: 1,
          friction: 4,
          tension: 160,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
      prevMovesRef.current = moves;
    }
  }, [moves, bounceAnim]);

  // Warning pulse when moves <= 5
  useEffect(() => {
    if (isWarning) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 450,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 450,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isWarning, pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.pawWrapper,
        {
          transform: [{ scale: Animated.multiply(bounceAnim, pulseAnim) }],
        },
      ]}
    >
      <Svg width={96} height={102} viewBox="0 0 100 106">
        <Defs>
          {/* Rich 3D Golden Bevel Gradient */}
          <LinearGradient id="pawGoldRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFF9C4" />
            <Stop offset="25%" stopColor="#FFD54F" />
            <Stop offset="65%" stopColor="#FFA000" />
            <Stop offset="90%" stopColor="#C67C00" />
            <Stop offset="100%" stopColor="#794300" />
          </LinearGradient>

          {/* Golden Surface Gradient */}
          <RadialGradient id="pawGoldFace" cx="35%" cy="30%" r="70%">
            <Stop offset="0%" stopColor="#FFFDE7" />
            <Stop offset="40%" stopColor="#FFEB3B" />
            <Stop offset="75%" stopColor="#FFC107" />
            <Stop offset="100%" stopColor="#FF8F00" />
          </RadialGradient>

          {/* Glowing Topaz / Amber Jewel Gradient (Normal) */}
          <RadialGradient id="jewelAmber" cx="35%" cy="30%" r="70%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="25%" stopColor="#FFE082" />
            <Stop offset="60%" stopColor="#FFA000" />
            <Stop offset="90%" stopColor="#E65100" />
            <Stop offset="100%" stopColor="#BF360C" />
          </RadialGradient>

          {/* Glowing Ruby Danger Jewel Gradient (Warning <= 5) */}
          <RadialGradient id="jewelRuby" cx="35%" cy="30%" r="70%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="30%" stopColor="#FF80AB" />
            <Stop offset="65%" stopColor="#FF1744" />
            <Stop offset="90%" stopColor="#C2185B" />
            <Stop offset="100%" stopColor="#880E4F" />
          </RadialGradient>

          {/* Jewel Starlight Halo */}
          <RadialGradient id="jewelGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <Stop
              offset="60%"
              stopColor={isWarning ? '#FF1744' : '#FFD54F'}
              stopOpacity="0.5"
            />
            <Stop offset="100%" stopColor="#FFA000" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* 1. Heavy Outer Drop Shadow */}
        <Ellipse cx="50" cy="98" rx="36" ry="7" fill="rgba(69, 36, 14, 0.4)" />

        {/* 2. 4 Sculpted Golden Toe Pads with Faceted Gold Bevels */}
        {/* Toe 1 (Far Left) */}
        <Circle cx="18" cy="30" r="13" fill="url(#pawGoldRim)" />
        <Circle cx="18" cy="30" r="10.5" fill="url(#pawGoldFace)" />
        <Circle cx="16" cy="27" r="3.5" fill="#FFFFFF" opacity="0.6" />

        {/* Toe 2 (Center Left - High) */}
        <Circle cx="38" cy="18" r="14.5" fill="url(#pawGoldRim)" />
        <Circle cx="38" cy="18" r="12" fill="url(#pawGoldFace)" />
        <Circle cx="35.5" cy="15" r="4" fill="#FFFFFF" opacity="0.65" />

        {/* Toe 3 (Center Right - High) */}
        <Circle cx="62" cy="18" r="14.5" fill="url(#pawGoldRim)" />
        <Circle cx="62" cy="18" r="12" fill="url(#pawGoldFace)" />
        <Circle cx="59.5" cy="15" r="4" fill="#FFFFFF" opacity="0.65" />

        {/* Toe 4 (Far Right) */}
        <Circle cx="82" cy="30" r="13" fill="url(#pawGoldRim)" />
        <Circle cx="82" cy="30" r="10.5" fill="url(#pawGoldFace)" />
        <Circle cx="80" cy="27" r="3.5" fill="#FFFFFF" opacity="0.6" />

        {/* 3. Main Palm Pad Rim & Bevel */}
        {/* Outer Golden Rim */}
        <Path
          d="M 50 40 
             C 74 38, 88 56, 84 76 
             C 80 92, 66 94, 50 94 
             C 34 94, 20 92, 16 76 
             C 12 56, 26 38, 50 40 Z"
          fill="url(#pawGoldRim)"
        />

        {/* Inner Golden Floor */}
        <Path
          d="M 50 43 
             C 71 41, 84 57, 80 75 
             C 77 89, 64 91, 50 91 
             C 36 91, 23 89, 20 75 
             C 16 57, 29 41, 50 43 Z"
          fill="url(#pawGoldFace)"
        />

        {/* 4. Recessed Jewel Chamber (Topaz or Danger Ruby) */}
        {/* Sunken Socket Border */}
        <Circle
          cx="50"
          cy="67"
          r="24"
          fill="#45240E"
          stroke="#794300"
          strokeWidth="1.5"
        />

        {/* Glowing Jewel Cabochon */}
        <Circle
          cx="50"
          cy="67"
          r="22.5"
          fill={isWarning ? 'url(#jewelRuby)' : 'url(#jewelAmber)'}
        />

        {/* Jewel Glow Aura */}
        <Circle cx="50" cy="67" r="22.5" fill="url(#jewelGlow)" />

        {/* Faceted Jewel Sparkle Bevel Rings */}
        <Path
          d="M 32 67 Q 50 56 68 67"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          fill="none"
          opacity="0.45"
        />
        <Circle cx="40" cy="56" r="3.5" fill="#FFFFFF" opacity="0.8" />
        <Circle cx="45" cy="53" r="1.5" fill="#FFFFFF" opacity="0.9" />

        {/* Golden Paw Crest Carved Title Tag */}
        <Rect x="26" y="91" width="48" height="13" rx="6.5" fill="#4E2A0E" stroke="#FFD54F" strokeWidth="1.5" />
        <SvgText
          x="50"
          y="100.5"
          fill="#FFE082"
          fontSize={8.5}
          fontWeight="900"
          letterSpacing={1}
          textAnchor="middle"
        >
          MOVES
        </SvgText>
      </Svg>

      {/* 5. Glowing Jewel Number Display */}
      <View style={styles.jewelNumberWrapper}>
        <Text
          style={[
            styles.jewelNumberText,
            isWarning && styles.jewelNumberWarning,
          ]}
        >
          {moves}
        </Text>
      </View>
    </Animated.View>
  );
};

// ============================================================================
// POP-UP WOODEN STAR PEG COMPONENT
// ============================================================================
interface StarPegProps {
  hasStar: boolean;
  starIndex: number;
}

const StarPeg: React.FC<StarPegProps> = ({ hasStar, starIndex }) => {
  const popAnim = useRef(new Animated.Value(hasStar ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(popAnim, {
      toValue: hasStar ? 1 : 0,
      friction: 4,
      tension: 130,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [hasStar, popAnim]);

  const translateY = popAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [3, -9],
  });

  const scale = popAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1.1],
  });

  return (
    <Animated.View
      style={[
        styles.starPegContainer,
        {
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <Svg width={30} height={34} viewBox="0 0 30 34">
        <Defs>
          {/* Active Golden Star Facet Gradients */}
          <RadialGradient id={`starGold_${starIndex}`} cx="35%" cy="30%" r="70%">
            <Stop offset="0%" stopColor="#FFFDE7" />
            <Stop offset="40%" stopColor="#FFEB3B" />
            <Stop offset="80%" stopColor="#FFA000" />
            <Stop offset="100%" stopColor="#FF6F00" />
          </RadialGradient>
          <RadialGradient id="woodStarDim" cx="40%" cy="35%" r="65%">
            <Stop offset="0%" stopColor="#A1887F" />
            <Stop offset="60%" stopColor="#795548" />
            <Stop offset="100%" stopColor="#4E342E" />
          </RadialGradient>
        </Defs>

        {/* Wooden Dowel Peg Stem */}
        <Rect
          x="12"
          y="18"
          width="6"
          height="14"
          rx="2"
          fill={hasStar ? '#8D5B28' : '#5D4037'}
          stroke="#42210B"
          strokeWidth="1"
        />

        {/* Star Head */}
        {hasStar ? (
          <G>
            {/* Golden Star Drop Shadow */}
            <Path
              d="M 15 2 L 18 10 L 27 10 L 20 16 L 23 24 L 15 19 L 7 24 L 10 16 L 3 10 L 12 10 Z"
              fill="#E65100"
              stroke="#BF360C"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Faceted Golden Star */}
            <Path
              d="M 15 2 L 18 10 L 27 10 L 20 16 L 23 24 L 15 19 L 7 24 L 10 16 L 3 10 L 12 10 Z"
              fill={`url(#starGold_${starIndex})`}
            />
            {/* Diamond Sparkle Glint */}
            <Polygon points="15,4 16,10 20,10 16,12 15,16 14,12 10,10 14,10" fill="#FFFFFF" opacity="0.9" />
          </G>
        ) : (
          <G opacity="0.6">
            {/* Carved Unlit Wooden Star Peg */}
            <Path
              d="M 15 2 L 18 10 L 27 10 L 20 16 L 23 24 L 15 19 L 7 24 L 10 16 L 3 10 L 12 10 Z"
              fill="url(#woodStarDim)"
              stroke="#3E2723"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </G>
        )}
      </Svg>
    </Animated.View>
  );
};

// ============================================================================
// WOVEN WICKER BERRY BASKET HUD (Points & Harvest)
// ============================================================================
interface WickerBerryBasketProps {
  score: number;
  star1: number;
  star2: number;
  star3: number;
}

const WickerBerryBasket: React.FC<WickerBerryBasketProps> = ({
  score,
  star1,
  star2,
  star3,
}) => {
  const hasStar1 = score >= star1;
  const hasStar2 = score >= star2;
  const hasStar3 = score >= star3;

  const progressRatio = Math.min(1, score / star3);

  // Strawberry visual fill tiers based on score
  const showBerry1 = score > 150;
  const showBerry2 = score >= star1 * 0.45;
  const showBerry3 = score >= star1;
  const showBerry4 = score >= star2 * 0.7;
  const showBerry5 = score >= star2;
  const showBerry6 = score >= star3 * 0.85;
  const showBerry7 = score >= star3;

  return (
    <View style={styles.wickerBasketContainer}>
      <Svg width="100%" height={102} viewBox="0 0 280 102" preserveAspectRatio="none">
        <Defs>
          {/* Braided Wicker Reed Gradient */}
          <LinearGradient id="wickerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#F5BA72" />
            <Stop offset="25%" stopColor="#D79347" />
            <Stop offset="60%" stopColor="#B36E27" />
            <Stop offset="100%" stopColor="#784210" />
          </LinearGradient>

          {/* Wicker Highlight Rib */}
          <LinearGradient id="wickerRibH" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#D79347" />
            <Stop offset="50%" stopColor="#FFE0B2" />
            <Stop offset="100%" stopColor="#B36E27" />
          </LinearGradient>

          {/* Strawberry Gloss Gradient */}
          <RadialGradient id="strawberryGrad" cx="35%" cy="30%" r="70%">
            <Stop offset="0%" stopColor="#FF8A80" />
            <Stop offset="35%" stopColor="#FF1744" />
            <Stop offset="80%" stopColor="#D50000" />
            <Stop offset="100%" stopColor="#880E4F" />
          </RadialGradient>

          {/* Green Calyx / Leaf Cap */}
          <LinearGradient id="calyxGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#81C784" />
            <Stop offset="100%" stopColor="#2E7D32" />
          </LinearGradient>
        </Defs>

        {/* 1. Heavy Base Shadow */}
        <Ellipse cx="140" cy="98" rx="120" ry="5" fill="rgba(69, 36, 14, 0.45)" />

        {/* 2. Braided Wicker Basket Handle Overarching */}
        <Path
          d="M 38 48 C 38 2, 242 2, 242 48"
          stroke="#8D5300"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M 38 48 C 38 2, 242 2, 242 48"
          stroke="url(#wickerGrad)"
          strokeWidth="6"
          strokeDasharray="9 5"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M 40 48 C 40 4, 240 4, 240 48"
          stroke="#FFE0B2"
          strokeWidth="1.8"
          strokeDasharray="4 10"
          fill="none"
          opacity="0.8"
        />

        {/* 3. Deep Basket Interior Well (Dark shadow under strawberries) */}
        <Path
          d="M 28 42 Q 140 34 252 42 L 244 58 Q 140 50 36 58 Z"
          fill="#3E2008"
        />

        {/* 4. Lush Strawberries Inside the Basket */}
        {/* Strawberry 1 (Center bottom) */}
        {showBerry1 && (
          <G id="sb1">
            <Path
              d="M 125 32 C 122 24, 142 24, 144 32 C 146 42, 134 46, 134 46 C 134 46, 124 42, 125 32 Z"
              fill="url(#strawberryGrad)"
            />
            {/* Calyx */}
            <Polygon points="134,25 130,22 133,26 128,27 134,28 140,27 135,26 138,22" fill="url(#calyxGrad)" />
            {/* Golden Seeds */}
            <Circle cx="131" cy="32" r="1.2" fill="#FFF59D" />
            <Circle cx="137" cy="34" r="1.2" fill="#FFF59D" />
            <Circle cx="133" cy="39" r="1" fill="#FFF59D" />
          </G>
        )}

        {/* Strawberry 2 (Left nest) */}
        {showBerry2 && (
          <G id="sb2">
            <Path
              d="M 90 34 C 88 26, 108 26, 110 34 C 112 44, 100 48, 100 48 C 100 48, 90 44, 90 34 Z"
              fill="url(#strawberryGrad)"
            />
            <Polygon points="100,27 96,24 99,28 94,29 100,30 106,29 101,28 104,24" fill="url(#calyxGrad)" />
            <Circle cx="96" cy="34" r="1.2" fill="#FFF59D" />
            <Circle cx="102" cy="36" r="1.2" fill="#FFF59D" />
            <Circle cx="99" cy="41" r="1" fill="#FFF59D" />
          </G>
        )}

        {/* Strawberry 3 (Right nest) */}
        {showBerry3 && (
          <G id="sb3">
            <Path
              d="M 160 34 C 158 26, 178 26, 180 34 C 182 44, 170 48, 170 48 C 170 48, 160 44, 160 34 Z"
              fill="url(#strawberryGrad)"
            />
            <Polygon points="170,27 166,24 169,28 164,29 170,30 176,29 171,28 174,24" fill="url(#calyxGrad)" />
            <Circle cx="166" cy="34" r="1.2" fill="#FFF59D" />
            <Circle cx="172" cy="36" r="1.2" fill="#FFF59D" />
            <Circle cx="169" cy="41" r="1" fill="#FFF59D" />
          </G>
        )}

        {/* Strawberry 4 (Far Left overflow) */}
        {showBerry4 && (
          <G id="sb4">
            <Path
              d="M 58 36 C 56 28, 76 28, 78 36 C 80 46, 68 49, 68 49 C 68 49, 58 46, 58 36 Z"
              fill="url(#strawberryGrad)"
            />
            <Polygon points="68,29 64,26 67,30 62,31 68,32 74,31 69,30 72,26" fill="url(#calyxGrad)" />
            <Circle cx="64" cy="36" r="1.2" fill="#FFF59D" />
            <Circle cx="70" cy="38" r="1.2" fill="#FFF59D" />
          </G>
        )}

        {/* Strawberry 5 (Far Right overflow) */}
        {showBerry5 && (
          <G id="sb5">
            <Path
              d="M 198 36 C 196 28, 216 28, 218 36 C 220 46, 208 49, 208 49 C 208 49, 198 46, 198 36 Z"
              fill="url(#strawberryGrad)"
            />
            <Polygon points="208,29 204,26 207,30 202,31 208,32 214,31 209,30 212,26" fill="url(#calyxGrad)" />
            <Circle cx="204" cy="36" r="1.2" fill="#FFF59D" />
            <Circle cx="210" cy="38" r="1.2" fill="#FFF59D" />
          </G>
        )}

        {/* Strawberry 6 & 7 (High Top Heap) */}
        {showBerry6 && (
          <G id="sb6">
            <Path
              d="M 108 20 C 106 13, 124 13, 126 20 C 128 29, 116 33, 116 33 C 116 33, 107 29, 108 20 Z"
              fill="url(#strawberryGrad)"
            />
            <Polygon points="116,14 112,11 115,15 111,16 116,17 121,16 117,15 120,11" fill="url(#calyxGrad)" />
            <Circle cx="113" cy="20" r="1" fill="#FFF59D" />
            <Circle cx="118" cy="22" r="1" fill="#FFF59D" />
          </G>
        )}

        {showBerry7 && (
          <G id="sb7">
            <Path
              d="M 144 20 C 142 13, 160 13, 162 20 C 164 29, 152 33, 152 33 C 152 33, 143 29, 144 20 Z"
              fill="url(#strawberryGrad)"
            />
            <Polygon points="152,14 148,11 151,15 147,16 152,17 157,16 153,15 156,11" fill="url(#calyxGrad)" />
            <Circle cx="149" cy="20" r="1" fill="#FFF59D" />
            <Circle cx="154" cy="22" r="1" fill="#FFF59D" />
            {/* Sparkle star */}
            <Polygon points="152,8 153,12 157,12 154,14 155,18 152,15 149,18 150,14 147,12 151,12" fill="#FFEB3B" />
          </G>
        )}

        {/* 5. Physical Woven Wicker Basket Body */}
        {/* Main Basket Tapered Base Shell */}
        <Path
          d="M 22 46 
             L 44 94 
             Q 140 98 236 94 
             L 258 46 
             Q 140 40 22 46 Z"
          fill="url(#wickerGrad)"
          stroke="#5E300B"
          strokeWidth="2.5"
        />

        {/* Interlaced Horizontal Wicker Rib Bands */}
        <Path
          d="M 27 57 Q 140 52 253 57"
          stroke="url(#wickerRibH)"
          strokeWidth="4"
          fill="none"
        />
        <Path
          d="M 33 69 Q 140 64 247 69"
          stroke="url(#wickerRibH)"
          strokeWidth="4"
          fill="none"
        />
        <Path
          d="M 39 81 Q 140 76 241 81"
          stroke="url(#wickerRibH)"
          strokeWidth="4"
          fill="none"
        />

        {/* Vertical Woven Reed Splines */}
        <Path
          d="M 52 47 L 66 94 M 78 47 L 88 94 M 104 47 L 110 94 M 130 47 L 132 94 M 150 47 L 148 94 M 176 47 L 170 94 M 202 47 L 192 94 M 228 47 L 214 94"
          stroke="#784210"
          strokeWidth="3.2"
          strokeDasharray="4 8"
          fill="none"
        />

        {/* 6. Braided Top Wicker Rim Rail */}
        <Path
          d="M 18 45 Q 140 38 262 45"
          stroke="#5E300B"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M 18 45 Q 140 38 262 45"
          stroke="url(#wickerGrad)"
          strokeWidth="6"
          strokeDasharray="6 4"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M 20 44 Q 140 37 260 44"
          stroke="#FFE082"
          strokeWidth="1.5"
          fill="none"
          opacity="0.8"
        />

        {/* 7. Wooden Harvest Chalkboard Plaque on Front */}
        {/* Carved Wood Plank Border */}
        <Rect
          x="68"
          y="62"
          width="144"
          height="28"
          rx="6"
          fill="#4E2A0E"
          stroke="#C28241"
          strokeWidth="2"
        />
        {/* Golden Chamfer Rim */}
        <Rect
          x="70"
          y="64"
          width="140"
          height="24"
          rx="4"
          fill="#2C1605"
        />

        {/* Harvest Juice Progress Bar Track */}
        <Rect
          x="75"
          y="80"
          width="130"
          height="5"
          rx="2.5"
          fill="rgba(255, 255, 255, 0.15)"
        />
        {/* Harvest Fill (Lush Strawberry Green/Red) */}
        <Rect
          x="75"
          y="80"
          width={Math.max(6, 130 * progressRatio)}
          height="5"
          rx="2.5"
          fill="#43A047"
        />
        <Rect
          x="75"
          y="80"
          width={Math.max(6, 130 * progressRatio)}
          height="2"
          rx="1"
          fill="#C8E6C9"
          opacity="0.7"
        />

        {/* Wood Nails on Plaque */}
        <Circle cx="73" cy="76" r="1.8" fill="#FFD54F" stroke="#3E2008" strokeWidth="0.8" />
        <Circle cx="207" cy="76" r="1.8" fill="#FFD54F" stroke="#3E2008" strokeWidth="0.8" />
      </Svg>

      {/* Floating 3 Pop-up Wooden Star Pegs over Basket Rim */}
      <View style={styles.starPegsRow}>
        <StarPeg hasStar={hasStar1} starIndex={1} />
        <StarPeg hasStar={hasStar2} starIndex={2} />
        <StarPeg hasStar={hasStar3} starIndex={3} />
      </View>

      {/* Chalkboard Text Overlay */}
      <View style={styles.plaqueContent}>
        <Text style={styles.plaqueTitle}>🍓 HARVEST POINTS</Text>
        <Text style={styles.plaqueScore}>
          {score.toLocaleString()} <Text style={styles.plaqueGoal}>/ {star3.toLocaleString()}</Text>
        </Text>
      </View>
    </View>
  );
};

// ============================================================================
// MAIN EXPORT: ScoreHUD
// ============================================================================
export const ScoreHUD: React.FC<ScoreHUDProps> = ({
  score,
  moves,
  combo,
  praiseMessage,
}) => {
  const [star1, star2, star3] = GAME_RULES.STAR_THRESHOLDS;

  return (
    <View style={styles.hudContainer}>
      <View style={styles.hudRow}>
        {/* Left: 3D Golden Paw Moves Badge */}
        <GoldenPawBadge moves={moves} />

        {/* Right: Woven Wicker Berry Basket HUD */}
        <WickerBerryBasket
          score={score}
          star1={star1}
          star2={star2}
          star3={star3}
        />
      </View>

      {/* Floating Combo / Praise Woodland Streamer Banner */}
      {praiseMessage && (
        <View style={styles.praiseBanner}>
          <Text style={styles.praiseText}>✨ {praiseMessage} ✨</Text>
        </View>
      )}

      {combo > 1 && !praiseMessage && (
        <View style={styles.comboBadge}>
          <Text style={styles.comboText}>COMBO x{combo}! 🐾🔥</Text>
        </View>
      )}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  hudContainer: {
    width: '100%',
    maxWidth: 440,
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 2,
    alignItems: 'center',
    position: 'relative',
    zIndex: 10,
  },
  hudRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  // Golden Paw Badge Styles
  pawWrapper: {
    width: 96,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  jewelNumberWrapper: {
    position: 'absolute',
    top: 50,
    width: 48,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jewelNumberText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textAlign: 'center',
    ...Platform.select({
      web: {
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))',
      },
    }),
  },
  jewelNumberWarning: {
    color: '#FFF9C4',
    textShadowColor: 'rgba(183, 28, 28, 0.95)',
    textShadowRadius: 6,
  },

  // Wicker Basket Styles
  wickerBasketContainer: {
    flex: 1,
    height: 104,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starPegsRow: {
    position: 'absolute',
    top: 8,
    width: 140,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 12,
  },
  starPegContainer: {
    width: 30,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plaqueContent: {
    position: 'absolute',
    top: 61,
    width: 136,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
  },
  plaqueTitle: {
    color: '#FFE082',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  plaqueScore: {
    color: '#FFFDE7',
    fontSize: 14,
    fontWeight: '900',
    marginTop: -1,
  },
  plaqueGoal: {
    color: '#D7CCC8',
    fontSize: 9.5,
    fontWeight: '700',
  },

  // Praise / Combo Streamers
  praiseBanner: {
    position: 'absolute',
    top: 96,
    backgroundColor: '#7C4DFF',
    paddingVertical: 6,
    paddingHorizontal: 22,
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#FFD700',
    shadowColor: '#512DA8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 12,
    zIndex: 99,
  },
  praiseText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 3,
  },
  comboBadge: {
    position: 'absolute',
    top: 98,
    backgroundColor: '#FF6F00',
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFE082',
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 90,
  },
  comboText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
