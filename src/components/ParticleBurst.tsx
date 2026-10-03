import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Ellipse,
  G,
  Defs,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { AnimalType, SpecialType } from '../types/game';
import { ANIMAL_THEMES } from '../constants/theme';

export type ParticleType =
  | 'diamond'
  | 'berry'
  | 'paw'
  | 'banner'
  | 'star'
  | 'sparkle';

export interface BurstEvent {
  id: string;
  x: number;
  y: number;
  color?: string;
  accentColor?: string;
  species?: AnimalType;
  special?: SpecialType;
  count?: number;
  combo?: number;
  scorePoints?: number;
  label?: string;
}

export interface ParticleConfig {
  id: string;
  type: ParticleType;
  color: string;
  accentColor: string;
  size: number;
  dx: number;
  dy: number;
  upwardBias: number;
  gravity: number;
  spinDeg: number;
  duration: number;
  delay: number;
  scaleFactor: number;
  emoji?: string;
}

const RAINBOW_COLORS = [
  '#FF1744', // Red
  '#FF9100', // Orange
  '#FFEA00', // Yellow
  '#00E676', // Lime
  '#00E5FF', // Cyan
  '#D500F9', // Purple
  '#FF4081', // Pink
  '#FFD700', // Gold
  '#FFFFFF', // Starlight White
];

// Helper to pick random item
const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ==========================================
// DISTINCT SVG PARTICLE GRAPHICS
// ==========================================

/**
 * 1. Golden Starlight Diamonds
 * 8-point faceted starlight diamond with golden gradient aura, crisp white core, and specular glints.
 */
export const GoldenDiamondSvg: React.FC<{ size: number; color?: string }> = ({
  size,
  color = '#FFD700',
}) => {
  const gradId = useMemo(
    () => `gold_diam_${Math.random().toString(36).substring(2, 8)}`,
    []
  );

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Defs>
        <RadialGradient id={gradId} cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <Stop offset="30%" stopColor="#FFF9C4" stopOpacity="1" />
          <Stop offset="70%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor="#FFA000" stopOpacity="1" />
        </RadialGradient>
      </Defs>
      {/* 4 Diagonal accent rays */}
      <Path
        d="M16 16 L22 10 L20 16 L22 22 L16 20 L10 22 L12 16 L10 10 Z"
        fill="#FFE082"
        opacity={0.85}
      />
      {/* Main 4-point elongated diamond star */}
      <Path
        d="M16 1.5 L20.8 13.5 L30.5 16 L20.8 18.5 L16 30.5 L11.2 18.5 L1.5 16 L11.2 13.5 Z"
        fill={`url(#${gradId})`}
        stroke="#FFFFFF"
        strokeWidth={0.85}
      />
      {/* Central specular highlight diamond */}
      <Path
        d="M16 8 L18.2 14.5 L24 16 L18.2 17.5 L16 24 L13.8 17.5 L8 16 L13.8 14.5 Z"
        fill="#FFFFFF"
        opacity={0.92}
      />
    </Svg>
  );
};

/**
 * 2. Bouncing Strawberry / Berry Tokens
 * Stylized candy strawberry/berry with juicy magenta/ruby body, seed pips, crisp leafy cap, and specular shine.
 */
export const BerryTokenSvg: React.FC<{ size: number; color?: string }> = ({
  size,
  color = '#FF1744',
}) => {
  const gradId = useMemo(
    () => `berry_grad_${Math.random().toString(36).substring(2, 8)}`,
    []
  );

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Defs>
        <RadialGradient id={gradId} cx="35%" cy="35%" rx="60%" ry="60%">
          <Stop offset="0%" stopColor="#FF80AB" stopOpacity="1" />
          <Stop offset="45%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor="#880E4F" stopOpacity="1" />
        </RadialGradient>
      </Defs>
      {/* Berry Body */}
      <Path
        d="M16 29.5 C10 29.5 4.5 24 4.5 17.5 C4.5 11.5 10 9.5 16 9.5 C22 9.5 27.5 11.5 27.5 17.5 C27.5 24 22 29.5 16 29.5 Z"
        fill={`url(#${gradId})`}
        stroke="#FFFFFF"
        strokeWidth={0.8}
      />
      {/* Glossy Curved Specular Highlight */}
      <Path
        d="M9.5 15.5 C9.5 12.5 12.5 11 15 11"
        stroke="#FFFFFF"
        strokeWidth={1.8}
        strokeLinecap="round"
        opacity={0.88}
      />
      {/* Strawberry Seed Pips */}
      <Circle cx="12" cy="18" r="0.9" fill="#FFF59D" />
      <Circle cx="16" cy="16.5" r="0.9" fill="#FFF59D" />
      <Circle cx="20" cy="18" r="0.9" fill="#FFF59D" />
      <Circle cx="14" cy="22" r="0.9" fill="#FFF59D" />
      <Circle cx="18" cy="22" r="0.9" fill="#FFF59D" />
      <Circle cx="16" cy="26" r="0.8" fill="#FFF59D" />
      {/* Green Leafy Calyx Cap */}
      <Path
        d="M16 10.5 C14 6.5 11 5 8 5.5 C10 7.5 12 9 14 10.5 Z"
        fill="#00E676"
        stroke="#00C853"
        strokeWidth={0.4}
      />
      <Path
        d="M16 10.5 C18 6.5 21 5 24 5.5 C22 7.5 20 9 18 10.5 Z"
        fill="#00E676"
        stroke="#00C853"
        strokeWidth={0.4}
      />
      <Path
        d="M16 10.5 C15.2 6 16.8 6 16 2.5 C15.5 5 15.8 7 16 10.5 Z"
        fill="#76FF03"
      />
    </Svg>
  );
};

/**
 * 3. Animal Paw Sparks
 * High-contrast energetic animal paw spark with central bean pad, 4 toe pads, and radiant aura rays.
 */
export const PawSparkSvg: React.FC<{
  size: number;
  color: string;
  accentColor?: string;
}> = ({ size, color, accentColor = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32">
    <G>
      {/* Outer Spark Flare Rays */}
      <Path
        d="M16 1.5 L16 4.5 M16 27.5 L16 30.5 M2 16 L5 16 M27 16 L30 16"
        stroke={accentColor}
        strokeWidth={1.3}
        strokeLinecap="round"
        opacity={0.85}
      />
      {/* Palm Pad */}
      <Ellipse
        cx="16"
        cy="20"
        rx="7.0"
        ry="5.4"
        fill={color}
        stroke="#FFFFFF"
        strokeWidth={1.1}
      />
      {/* Glossy Highlight on palm */}
      <Ellipse cx="14.2" cy="18.5" rx="3.3" ry="2.0" fill="#FFFFFF" opacity={0.45} />
      {/* 4 Toe Bean Pads */}
      <Circle cx="8.2" cy="12" r="2.9" fill={color} stroke="#FFFFFF" strokeWidth={0.9} />
      <Circle cx="13.2" cy="8.8" r="3.1" fill={color} stroke="#FFFFFF" strokeWidth={0.9} />
      <Circle cx="18.8" cy="8.8" r="3.1" fill={color} stroke="#FFFFFF" strokeWidth={0.9} />
      <Circle cx="23.8" cy="12" r="2.9" fill={color} stroke="#FFFFFF" strokeWidth={0.9} />
      {/* Crisp White Toe Highlights */}
      <Circle cx="7.7" cy="11.2" r="1.1" fill="#FFFFFF" opacity={0.65} />
      <Circle cx="12.6" cy="8.0" r="1.2" fill="#FFFFFF" opacity={0.65} />
      <Circle cx="18.2" cy="8.0" r="1.2" fill="#FFFFFF" opacity={0.65} />
      <Circle cx="23.2" cy="11.2" r="1.1" fill="#FFFFFF" opacity={0.65} />
    </G>
  </Svg>
);

/**
 * 4. Floating Celebratory Banners
 * Chevron swallowtail celebratory pennant ribbon with dual-tone shading and 3D fluttering.
 */
export const CelebratoryBannerSvg: React.FC<{
  size: number;
  color: string;
  accentColor?: string;
}> = ({ size, color, accentColor = '#FFD700' }) => (
  <Svg width={size * 1.35} height={size * 0.9} viewBox="0 0 36 24">
    {/* Chevron swallowtail pennant ribbon */}
    <Path
      d="M2 3 L33 3 L28 12 L33 21 L2 21 L6 12 Z"
      fill={color}
      stroke="#FFFFFF"
      strokeWidth={0.9}
    />
    {/* Inner celebratory accent chevron */}
    <Path
      d="M7 6.5 L30 6.5 L26 12 L30 17.5 L7 17.5 L10 12 Z"
      fill={accentColor}
      opacity={0.8}
    />
    {/* Specular ribbon highlight */}
    <Path
      d="M6 4.5 L29 4.5"
      stroke="#FFFFFF"
      strokeWidth={1}
      strokeLinecap="round"
      opacity={0.9}
    />
  </Svg>
);

/**
 * Golden Star Spark
 */
const StarSvg: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 1.8l3.09 6.26L22 9.07l-5 4.87 1.18 6.88L12 17.57l-6.18 3.25L7 13.94 2 9.07l6.91-1.01L12 1.8z"
      fill={color}
      stroke="#FFFFFF"
      strokeWidth={0.9}
    />
  </Svg>
);

/**
 * 4-Point High-Velocity Sparkle
 */
const SparkleSvg: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 0L14.4 9.2L24 12L14.4 14.8L12 24L9.6 14.8L0 12L9.6 9.2L12 0Z"
      fill={color}
      stroke="#FFFFFF"
      strokeWidth={0.7}
    />
  </Svg>
);

// ==========================================
// DETONATION RADIAL FLASH (120ms BLOOM)
// ==========================================

/**
 * Radial flash overlay at detonation center
 * Intense white-hot burst that blooms and dissolves in exactly 120ms.
 */
const DetonationFlash: React.FC<{
  x: number;
  y: number;
  color: string;
}> = React.memo(({ x, y, color }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const FLASH_SIZE = 80;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 120, // Exactly 120ms requirement!
      easing: Easing.bezier(0.1, 0.9, 0.2, 1),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [anim]);

  // White-hot radial bloom expands rapidly
  const scale = anim.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0.2, 1.85, 2.6],
  });

  // Dissolves rapidly: blinding white core that vanishes within 120ms
  const opacity = anim.interpolate({
    inputRange: [0, 0.25, 1],
    outputRange: [1, 0.9, 0],
  });

  const gradId = useMemo(
    () => `flash_core_${Math.random().toString(36).substring(2, 8)}`,
    []
  );

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.detonationFlash,
        {
          left: x - FLASH_SIZE / 2,
          top: y - FLASH_SIZE / 2,
          width: FLASH_SIZE,
          height: FLASH_SIZE,
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <Svg width={FLASH_SIZE} height={FLASH_SIZE} viewBox={`0 0 ${FLASH_SIZE} ${FLASH_SIZE}`}>
        <Defs>
          <RadialGradient id={gradId} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="25%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <Stop offset="55%" stopColor="#FFF9C4" stopOpacity="0.85" />
            <Stop offset="80%" stopColor={color} stopOpacity="0.6" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle
          cx={FLASH_SIZE / 2}
          cy={FLASH_SIZE / 2}
          r={FLASH_SIZE / 2}
          fill={`url(#${gradId})`}
        />
        {/* Blinding Starlight Cross Glare */}
        <Path
          d={`M${FLASH_SIZE / 2} 4 L${FLASH_SIZE / 2} ${FLASH_SIZE - 4} M4 ${FLASH_SIZE / 2} L${FLASH_SIZE - 4} ${FLASH_SIZE / 2}`}
          stroke="#FFFFFF"
          strokeWidth={3}
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
});

// ==========================================
// EXPANDING SHOCKWAVE BLAST RING
// ==========================================

/**
 * Expanding neon/golden shockwave blast ring with crisp glowing edge
 */
const ShockwaveBlastRing: React.FC<{
  x: number;
  y: number;
  color: string;
  combo?: number;
}> = React.memo(({ x, y, color, combo = 1 }) => {
  const ringProgress = useRef(new Animated.Value(0)).current;
  const RING_SIZE = 64;

  useEffect(() => {
    Animated.timing(ringProgress, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [ringProgress]);

  const maxScale = Math.min(3.2, 2.2 + combo * 0.25);
  const scale = ringProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, maxScale],
  });

  const opacity = ringProgress.interpolate({
    inputRange: [0, 0.2, 0.65, 1],
    outputRange: [1, 0.9, 0.45, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.shockwaveWrapper,
        {
          left: x - RING_SIZE / 2,
          top: y - RING_SIZE / 2,
          width: RING_SIZE,
          height: RING_SIZE,
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <Svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
        {/* Outer neon halo ring */}
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_SIZE / 2 - 3}
          fill="none"
          stroke={color}
          strokeWidth={4.2}
          opacity={0.65}
        />
        {/* Crisp golden neon ring */}
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_SIZE / 2 - 3}
          fill="none"
          stroke="#FFD700"
          strokeWidth={2.4}
        />
        {/* Razor-sharp white starlight inner edge */}
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_SIZE / 2 - 4.2}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={1.2}
          opacity={0.92}
        />
      </Svg>
    </Animated.View>
  );
});

// ==========================================
// FLOATING BOUNCY SCORE PILL (+120!, SUPER POP!)
// ==========================================

/**
 * Floating bouncy score pill (+120!, SUPER POP!)
 */
const FloatingScorePill: React.FC<{
  x: number;
  y: number;
  score: number;
  combo?: number;
  label?: string;
  special?: SpecialType;
}> = React.memo(({ x, y, score, combo = 1, label, special }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 760,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [anim]);

  // Tactile overshoot bounce on launch
  const scale = anim.interpolate({
    inputRange: [0, 0.22, 0.45, 0.8, 1],
    outputRange: [0.2, 1.34, 1.0, 0.95, 0.72],
  });

  // Upward float
  const translateY = anim.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [4, -28, -52],
  });

  // Playful bouncy tilt
  const rotate = anim.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: ['-5deg', '3deg', '-2deg', '0deg'],
  });

  // Smooth dissolve
  const opacity = anim.interpolate({
    inputRange: [0, 0.12, 0.78, 1],
    outputRange: [0, 1, 1, 0],
  });

  // Celebratory banner tag logic
  const celebrationTag = useMemo(() => {
    if (label) return label;
    if (special === 'color_bomb') return 'RAINBOW BLAST!';
    if (special === 'wrapped') return 'HONEY SPLASH!';
    if (special === 'striped_h' || special === 'striped_v') return 'LINE BLAST!';
    if (combo >= 5) return 'PAWESOME!';
    if (combo === 4) return 'TASTY!';
    if (combo === 3) return 'SUPER POP!';
    if (combo === 2) return 'SWEET!';
    return 'POP!';
  }, [label, special, combo]);

  const isCombo = combo > 1;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.scorePillContainer,
        isCombo && styles.comboScorePillContainer,
        {
          left: x - 64,
          top: y - 24,
          opacity,
          transform: [{ translateY }, { scale }, { rotate }],
        },
      ]}
    >
      <View style={[styles.scorePillInner, isCombo && styles.comboScorePillInner]}>
        <Text style={styles.scorePointsText}>+{score}!</Text>
        <View style={[styles.scoreTagBadge, isCombo && styles.comboScoreTagBadge]}>
          <Text style={styles.scoreTagText}>{celebrationTag}</Text>
        </View>
      </View>
    </Animated.View>
  );
});

// ==========================================
// HIGH-VELOCITY ANIMATED PARTICLE
// ==========================================

/**
 * Single animated particle with realistic acceleration, air drag, gravity arc, and 3D rotational spin.
 */
const AnimatedParticle: React.FC<{
  particle: ParticleConfig;
  originX: number;
  originY: number;
}> = React.memo(({ particle, originX, originY }) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: particle.duration,
      delay: particle.delay,
      easing: Easing.bezier(0.18, 0.85, 0.32, 1),
      useNativeDriver: Platform.OS !== 'web',
    });
    anim.start();

    return () => {
      anim.stop();
    };
  }, [particle.duration, particle.delay, progress]);

  const {
    dx,
    dy,
    upwardBias,
    gravity,
    spinDeg,
    scaleFactor,
    size,
    color,
    accentColor,
    type,
    emoji,
  } = particle;

  // Horizontal motion: fast initial kick, decelerating due to realistic air drag
  const translateX = progress.interpolate({
    inputRange: [0, 0.18, 0.45, 0.75, 1],
    outputRange: [0, dx * 0.52, dx * 0.82, dx * 0.95, dx],
  });

  // Vertical motion: launch up with upward bias, reach apex, then accelerate down with gravity
  const translateY = progress.interpolate({
    inputRange: [0, 0.18, 0.45, 0.75, 1],
    outputRange: [
      0,
      dy * 0.52 + upwardBias * 0.82,
      dy * 0.82 + upwardBias * 0.95 + gravity * 0.20,
      dy * 0.95 + upwardBias * 0.45 + gravity * 0.60,
      dy + upwardBias * 0.12 + gravity,
    ],
  });

  // Elastic squash-and-stretch pop: pops large on launch, settles, then shrinks away
  const scale = progress.interpolate({
    inputRange: [0, 0.12, 0.45, 0.75, 1],
    outputRange: [0.15, 1.45 * scaleFactor, 1.15 * scaleFactor, 0.85 * scaleFactor, 0],
  });

  // 3D Rotational spin around Z axis
  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${spinDeg}deg`],
  });

  // 3D tumble & flutter perspective simulation (scaleX flip)
  const scaleX = progress.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
    outputRange: [1, -0.85, 0.75, -0.65, 0.45, -0.2],
  });

  // Opacity: vibrant and solid for 75% of life, then dissolves smoothly
  const opacity = progress.interpolate({
    inputRange: [0, 0.75, 1],
    outputRange: [1, 1, 0],
  });

  const renderContent = () => {
    if (emoji) {
      return (
        <Text style={[styles.emojiParticle, { fontSize: size * 0.9 }]}>
          {emoji}
        </Text>
      );
    }

    switch (type) {
      case 'diamond':
        return <GoldenDiamondSvg size={size} color={color} />;
      case 'berry':
        return <BerryTokenSvg size={size} color={color} />;
      case 'paw':
        return <PawSparkSvg size={size} color={color} accentColor={accentColor} />;
      case 'banner':
        return (
          <CelebratoryBannerSvg
            size={size}
            color={color}
            accentColor={accentColor}
          />
        );
      case 'star':
        return <StarSvg size={size} color={color} />;
      case 'sparkle':
      default:
        return <SparkleSvg size={size} color={color} />;
    }
  };

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particleWrapper,
        {
          left: originX - size / 2,
          top: originY - size / 2,
          opacity,
          transform: [
            { translateX },
            { translateY },
            { scale },
            { rotate },
            { scaleX },
          ],
        },
      ]}
    >
      {renderContent()}
    </Animated.View>
  );
});

// ==========================================
// PARTICLE BURST (DETONATION EPICENTER)
// ==========================================

/**
 * ParticleBurst: Renders intense visual punch:
 * - Radial flash overlay at detonation center (120ms bloom)
 * - High-velocity spark spray: 28-40 energetic particles per blast
 * - Golden starlight diamonds, bouncing berry tokens, paw sparks, celebratory banners
 * - Expanding neon/golden shockwave blast ring with crisp glowing edge
 * - Floating bouncy score pill (+120!, SUPER POP!)
 */
export const ParticleBurst: React.FC<
  BurstEvent & { onComplete?: (id: string) => void }
> = ({
  id,
  x,
  y,
  color,
  accentColor,
  species,
  special,
  count,
  combo = 1,
  scorePoints,
  label,
  onComplete,
}) => {
  // Theme palette setup
  const theme = species ? ANIMAL_THEMES[species] : null;
  const primaryColor = color || theme?.primaryColor || '#FFD700';
  const secondaryColor = accentColor || theme?.accentColor || '#FF4081';

  // Generate 28-40 energetic particles with realistic physics
  const particles = useMemo<ParticleConfig[]>(() => {
    const isRainbow = special === 'color_bomb';
    const isSpecialCombo = special && special !== 'normal';

    // Satisfies requirement: 28-40 energetic particles per blast
    const baseCount =
      count ||
      Math.min(
        42,
        Math.max(28, 30 + (combo - 1) * 3 + (isSpecialCombo ? 6 : 0))
      );

    const particleList: ParticleConfig[] = [];

    // Distinct particle types: golden starlight diamonds, bouncing berries, paw sparks, celebratory banners
    const distinctTypes: ParticleType[] = [
      'diamond',
      'berry',
      'paw',
      'banner',
      'diamond',
      'berry',
      'paw',
      'star',
      'sparkle',
    ];

    // Celebratory emoji accents
    const emojiPool = ['⭐', '🐾', '🍓', '✨', '💖', '🎉'];

    for (let i = 0; i < baseCount; i++) {
      // 360-degree radial spray with natural jitter
      const baseAngle = (i / baseCount) * 2 * Math.PI;
      const angle = baseAngle + (Math.random() - 0.5) * 0.4;

      // High-velocity spark spray distance
      const minDist = 48 + Math.min(combo, 4) * 12;
      const maxDist = 95 + Math.min(combo, 4) * 25;
      const distance = minDist + Math.random() * (maxDist - minDist);

      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      // Fireworks fountain upward kick and gravity arc
      const upwardBias = -(24 + Math.random() * 38);
      const gravity = 55 + Math.random() * 65;

      // Color selection
      let pColor: string;
      let pAccent: string = '#FFFFFF';

      if (isRainbow) {
        pColor = pickRandom(RAINBOW_COLORS);
        pAccent = pickRandom(RAINBOW_COLORS);
      } else {
        const roll = Math.random();
        if (roll < 0.38) {
          pColor = primaryColor;
          pAccent = secondaryColor;
        } else if (roll < 0.68) {
          pColor = secondaryColor;
          pAccent = primaryColor;
        } else if (roll < 0.86) {
          pColor = '#FFD700'; // Pure Gold
          pAccent = '#FFF9C4';
        } else {
          pColor = '#00E5FF'; // Electric Cyan Spark
          pAccent = '#FFFFFF';
        }
      }

      // Distinct particle type rotation: ensures plenty of diamonds, berries, paws, and banners!
      const pType = distinctTypes[i % distinctTypes.length];

      // Occasional celebratory emoji for high combos
      const useEmoji = combo > 1 && Math.random() < 0.16;
      const emoji = useEmoji ? pickRandom(emojiPool) : undefined;

      const size = 18 + Math.random() * 12;
      const spinDeg =
        (Math.random() > 0.5 ? 1 : -1) * (270 + Math.random() * 540);
      const duration = 650 + Math.random() * 260;
      const delay = Math.random() * 40;
      const scaleFactor = 0.95 + Math.random() * 0.45;

      particleList.push({
        id: `${id}_p_${i}`,
        type: pType,
        color: pColor,
        accentColor: pAccent,
        size,
        dx,
        dy,
        upwardBias,
        gravity,
        spinDeg,
        duration,
        delay,
        scaleFactor,
        emoji,
      });
    }

    return particleList;
  }, [id, primaryColor, secondaryColor, special, count, combo]);

  // Maximum lifetime timer to trigger cleanup
  useEffect(() => {
    const maxDuration =
      Math.max(...particles.map((p) => p.duration + p.delay)) + 80;
    const timer = setTimeout(() => {
      onComplete?.(id);
    }, maxDuration);

    return () => clearTimeout(timer);
  }, [id, particles, onComplete]);

  return (
    <View pointerEvents="none" style={styles.burstContainer}>
      {/* 1. Radial Flash Overlay at Detonation Center (120ms white-hot bloom) */}
      <DetonationFlash x={x} y={y} color={primaryColor} />

      {/* 2. Expanding Neon / Golden Shockwave Blast Ring */}
      <ShockwaveBlastRing x={x} y={y} color={primaryColor} combo={combo} />

      {/* 3. Floating Bouncy Score Pill (+120!, SUPER POP!) */}
      {scorePoints && scorePoints > 0 && (
        <FloatingScorePill
          x={x}
          y={y}
          score={scorePoints}
          combo={combo}
          label={label}
          special={special}
        />
      )}

      {/* 4. High-Velocity Spark Spray Swarm (28-40 energetic particles) */}
      {particles.map((p) => (
        <AnimatedParticle
          key={p.id}
          particle={p}
          originX={x}
          originY={y}
        />
      ))}
    </View>
  );
};

// ==========================================
// CONTAINER FOR ACTIVE BURSTS
// ==========================================

export interface ParticleSystemProps {
  bursts: BurstEvent[];
  onBurstComplete?: (id: string) => void;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  bursts,
  onBurstComplete,
}) => {
  if (!bursts || bursts.length === 0) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {bursts.map((burst) => (
        <ParticleBurst
          key={burst.id}
          {...burst}
          onComplete={onBurstComplete}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  burstContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particleWrapper: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiParticle: {
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 3,
  },
  detonationFlash: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shockwaveWrapper: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scorePillContainer: {
    position: 'absolute',
    width: 128,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  comboScorePillContainer: {
    zIndex: 1000,
  },
  scorePillInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 11, 46, 0.94)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 8,
  },
  comboScorePillInner: {
    backgroundColor: 'rgba(58, 7, 50, 0.96)',
    borderColor: '#FF4081',
    shadowColor: '#FF4081',
    shadowRadius: 10,
  },
  scorePointsText: {
    color: '#FFEA00',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginRight: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  scoreTagBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.25)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 8,
  },
  comboScoreTagBadge: {
    backgroundColor: '#FF4081',
  },
  scoreTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
});
