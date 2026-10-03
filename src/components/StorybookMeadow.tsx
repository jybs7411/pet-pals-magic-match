import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Platform,
  StyleProp,
  ViewStyle,
  Dimensions,
  Text,
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StorybookMeadowProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  showAnimatedDecorations?: boolean;
}

/**
 * StorybookMeadow
 *
 * A lush, magical woodland meadow background inspired by Studio Ghibli,
 * Ustwo, and Sago Mini aesthetics.
 *
 * Features:
 * - Sunny morning sky gradient with warm golden horizon
 * - Radiant sun with glowing halos & sweeping sunbeams
 * - Layered fluffy storybook cumulus clouds
 * - Distant misty mountain ridges & pine forest silhouettes
 * - 3 layers of rolling, sunny grassy hills with clover patches
 * - Hand-crafted wildflowers (daisies, buttercups, bluebells, pink blossoms)
 * - Whimsical red spotted woodland mushrooms
 * - Floating dandelion seeds & fluttering storybook butterflies
 */
export const StorybookMeadow: React.FC<StorybookMeadowProps> = ({
  children,
  style,
  showAnimatedDecorations = true,
}) => {
  // Gentle floating animation for butterflies & clouds
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const flutterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!showAnimatedDecorations) return;

    // Bobbing float for Butterfly 1
    const loop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, {
          toValue: 1,
          duration: 3200,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(floatAnim1, {
          toValue: 0,
          duration: 3200,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );

    // Drifting float for Butterfly 2
    const loop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, {
          toValue: 1,
          duration: 4100,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(floatAnim2, {
          toValue: 0,
          duration: 4100,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );

    // Rapid wing flutter
    const loopFlutter = Animated.loop(
      Animated.sequence([
        Animated.timing(flutterAnim, {
          toValue: 1,
          duration: 450,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(flutterAnim, {
          toValue: 0,
          duration: 450,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );

    loop1.start();
    loop2.start();
    loopFlutter.start();

    return () => {
      loop1.stop();
      loop2.stop();
      loopFlutter.stop();
    };
  }, [showAnimatedDecorations, floatAnim1, floatAnim2, flutterAnim]);

  const translateY1 = floatAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -14],
  });

  const translateY2 = floatAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });

  const translateX2 = floatAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });

  const wingScale = flutterAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.72, 1],
  });

  return (
    <View style={[styles.rootContainer, style]}>
      {/* Environmental Backdrop SVG (fixed background, scales gracefully) */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 800 1300"
          preserveAspectRatio="xMidYMid slice"
        >
          <Defs>
            {/* Sky Gradient: Cerulean sky transitioning to sunny morning warmth */}
            <LinearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#4BB8F5" />
              <Stop offset="30%" stopColor="#7CD3FA" />
              <Stop offset="55%" stopColor="#BAEDFB" />
              <Stop offset="75%" stopColor="#FFF9C4" />
              <Stop offset="90%" stopColor="#FFF1B0" />
              <Stop offset="100%" stopColor="#DCEDC8" />
            </LinearGradient>

            {/* Radiant Sun Glow */}
            <RadialGradient id="sunCore" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFFFFF" />
              <Stop offset="40%" stopColor="#FFFDE7" />
              <Stop offset="80%" stopColor="#FFF176" />
              <Stop offset="100%" stopColor="#FFD54F" />
            </RadialGradient>

            <RadialGradient id="sunOuterHalo" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="rgba(255, 245, 157, 0.65)" />
              <Stop offset="50%" stopColor="rgba(255, 238, 88, 0.25)" />
              <Stop offset="100%" stopColor="rgba(255, 238, 88, 0)" />
            </RadialGradient>

            {/* Sweeping Sunbeams / God Rays */}
            <LinearGradient id="sunbeamGrad" x1="0%" y1="0%" x2="70%" y2="100%">
              <Stop offset="0%" stopColor="rgba(255, 255, 224, 0.42)" />
              <Stop offset="35%" stopColor="rgba(255, 250, 190, 0.22)" />
              <Stop offset="75%" stopColor="rgba(255, 245, 157, 0.08)" />
              <Stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
            </LinearGradient>

            {/* Distant Mountain Ridge Gradient */}
            <LinearGradient id="distMtnGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#85C5E5" />
              <Stop offset="50%" stopColor="#A4D8D5" />
              <Stop offset="100%" stopColor="#C8E6C9" />
            </LinearGradient>

            {/* Distant Forest Ridge Gradient */}
            <LinearGradient id="forestRidgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#66BB6A" />
              <Stop offset="100%" stopColor="#43A047" />
            </LinearGradient>

            {/* Rolling Hills Gradients */}
            {/* Hill 1 (Far rolling hill - sunny lime) */}
            <LinearGradient id="hillFarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#AED581" />
              <Stop offset="40%" stopColor="#9CCC65" />
              <Stop offset="100%" stopColor="#7CB342" />
            </LinearGradient>

            {/* Hill 2 (Mid hill - vibrant meadow green) */}
            <LinearGradient id="hillMidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#8BC34A" />
              <Stop offset="45%" stopColor="#689F38" />
              <Stop offset="100%" stopColor="#558B2F" />
            </LinearGradient>

            {/* Hill 3 (Foreground clearing - lush rich clover) */}
            <LinearGradient id="hillForeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#7CB342" />
              <Stop offset="30%" stopColor="#558B2F" />
              <Stop offset="80%" stopColor="#33691E" />
              <Stop offset="100%" stopColor="#234914" />
            </LinearGradient>

            {/* Cloud Gradients */}
            <LinearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" />
              <Stop offset="65%" stopColor="#FFFFFF" />
              <Stop offset="100%" stopColor="#E3F2FD" />
            </LinearGradient>

            <LinearGradient id="cloudUnderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" />
              <Stop offset="100%" stopColor="#D5E5F2" />
            </LinearGradient>
          </Defs>

          {/* 1. SKY BASE */}
          <Rect x="0" y="0" width="800" height="1300" fill="url(#skyGrad)" />

          {/* 2. RADIANT SUN & HALO */}
          {/* Outer Sun Halos */}
          <Circle cx="150" cy="130" r="190" fill="url(#sunOuterHalo)" />
          <Circle cx="150" cy="130" r="110" fill="url(#sunOuterHalo)" />
          {/* Main Sun Disk */}
          <Circle cx="150" cy="130" r="54" fill="url(#sunCore)" />
          {/* Bright Sun Flare Points */}
          <Circle cx="150" cy="130" r="28" fill="#FFFFFF" opacity="0.85" />

          {/* 3. SWEEPING SUNBEAMS (GOD RAYS) */}
          <Polygon
            points="150,130 -80,680 50,750"
            fill="url(#sunbeamGrad)"
          />
          <Polygon
            points="150,130 90,920 280,950"
            fill="url(#sunbeamGrad)"
          />
          <Polygon
            points="150,130 380,820 540,780"
            fill="url(#sunbeamGrad)"
          />
          <Polygon
            points="150,130 680,560 840,490"
            fill="url(#sunbeamGrad)"
          />
          <Polygon
            points="150,130 830,280 850,380"
            fill="url(#sunbeamGrad)"
          />

          {/* 4. FLUFFY STORYBOOK CUMULUS CLOUDS */}
          {/* High Top-Right Billowy Cloud */}
          <G id="cloudHighRight">
            {/* Cloud Base/Underside Shadow */}
            <Ellipse cx="620" cy="115" rx="140" ry="46" fill="url(#cloudUnderGrad)" />
            {/* Cloud Puffs */}
            <Circle cx="540" cy="98" r="46" fill="url(#cloudGrad)" />
            <Circle cx="600" cy="74" r="58" fill="#FFFFFF" />
            <Circle cx="668" cy="92" r="50" fill="url(#cloudGrad)" />
            <Circle cx="720" cy="112" r="38" fill="url(#cloudGrad)" />
            <Circle cx="500" cy="116" r="32" fill="url(#cloudGrad)" />
          </G>

          {/* Sun-Kissed Top-Left Cloud */}
          <G id="cloudTopLeft" opacity="0.9">
            <Ellipse cx="190" cy="80" rx="90" ry="28" fill="url(#cloudUnderGrad)" />
            <Circle cx="150" cy="68" r="34" fill="#FFFFFF" />
            <Circle cx="200" cy="52" r="40" fill="#FFFFFF" />
            <Circle cx="245" cy="70" r="30" fill="url(#cloudGrad)" />
          </G>

          {/* Mid-Sky Soft Floating Cloud */}
          <G id="cloudMid" opacity="0.82">
            <Ellipse cx="70" cy="270" rx="80" ry="24" fill="url(#cloudUnderGrad)" />
            <Circle cx="40" cy="258" r="30" fill="#FFFFFF" />
            <Circle cx="80" cy="245" r="36" fill="#FFFFFF" />
            <Circle cx="120" cy="262" r="28" fill="url(#cloudGrad)" />
          </G>

          {/* Distant Wispy Cloud */}
          <G id="cloudDistantRight" opacity="0.65">
            <Ellipse cx="710" cy="290" rx="95" ry="22" fill="#FFFFFF" />
            <Circle cx="680" cy="280" r="26" fill="#FFFFFF" />
            <Circle cx="730" cy="276" r="28" fill="#FFFFFF" />
          </G>

          {/* 5. DISTANT MOUNTAIN RIDGES */}
          <Path
            d="M -20 540 Q 140 450 310 510 T 630 470 Q 720 440 820 490 L 820 1300 L -20 1300 Z"
            fill="url(#distMtnGrad)"
            opacity="0.85"
          />

          {/* 6. DISTANT PINE / OAK FOREST SILHOUETTES */}
          <Path
            d="M -10 590 
               Q 60 560 140 575 
               Q 230 550 320 570 
               Q 410 545 500 565 
               Q 620 535 730 560 
               Q 780 550 820 565 
               L 820 1300 L -10 1300 Z"
            fill="url(#forestRidgeGrad)"
            opacity="0.8"
          />

          {/* Cute Little Pine Tree Caps */}
          <Polygon points="120,555 128,575 112,575" fill="#388E3C" />
          <Polygon points="160,548 170,572 150,572" fill="#2E7D32" />
          <Polygon points="340,545 350,568 330,568" fill="#388E3C" />
          <Polygon points="370,540 382,566 358,566" fill="#2E7D32" />
          <Polygon points="640,530 652,558 628,558" fill="#2E7D32" />
          <Polygon points="675,535 686,560 664,560" fill="#388E3C" />

          {/* 7. HILL LAYER 1 (Far Rolling Hill - Gentle Sunny Lime) */}
          <Path
            d="M -20 660 
               C 180 580, 360 690, 560 620 
               C 670 580, 750 610, 820 630 
               L 820 1300 L -20 1300 Z"
            fill="url(#hillFarGrad)"
          />

          {/* Sun Highlights along Hill 1 Crest */}
          <Path
            d="M -10 658 C 180 582, 360 690, 560 622"
            stroke="#DCEDC8"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />

          {/* 8. HILL LAYER 2 (Mid Rolling Hill - Vibrant Meadow Green) */}
          <Path
            d="M -20 840 
               C 210 760, 420 860, 640 780 
               C 720 750, 770 765, 820 790 
               L 820 1300 L -20 1300 Z"
            fill="url(#hillMidGrad)"
          />

          {/* Hill 2 Crest Highlight */}
          <Path
            d="M -10 838 C 210 762, 420 860, 640 782"
            stroke="#C5E1A5"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />

          {/* Stylized Grassy Blade Tufts along Mid Hill */}
          <Path
            d="M 140 790 Q 142 774 146 768 Q 148 775 149 790"
            stroke="#AED581"
            strokeWidth="2.5"
            fill="#AED581"
          />
          <Path
            d="M 146 790 Q 152 770 156 766 Q 155 776 153 790"
            stroke="#AED581"
            strokeWidth="2"
            fill="#AED581"
          />

          <Path
            d="M 380 832 Q 383 816 388 810 Q 390 818 391 832"
            stroke="#AED581"
            strokeWidth="2.5"
            fill="#AED581"
          />

          <Path
            d="M 680 774 Q 684 758 689 752 Q 692 760 693 774"
            stroke="#AED581"
            strokeWidth="2.5"
            fill="#AED581"
          />

          {/* 9. HILL LAYER 3 (Foreground Sanctuary Meadow - Rich Lush Clover) */}
          <Path
            d="M -20 1020 
               C 190 950, 390 1030, 610 970 
               C 710 940, 770 960, 820 985 
               L 820 1300 L -20 1300 Z"
            fill="url(#hillForeGrad)"
          />

          {/* Foreground Crest Rim */}
          <Path
            d="M -10 1018 C 190 952, 390 1030, 610 972"
            stroke="#A5D6A7"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            opacity="0.65"
          />

          {/* 10. WILDFLOWERS & FOREST FLORA IN THE MEADOW */}
          {/* Daisies (Crisp white petals, yolk center) */}
          <G id="daisy1">
            <Circle cx="70" cy="1040" r="14" fill="#FFFFFF" />
            <Circle cx="60" cy="1034" r="7" fill="#FFFFFF" />
            <Circle cx="80" cy="1034" r="7" fill="#FFFFFF" />
            <Circle cx="62" cy="1048" r="7" fill="#FFFFFF" />
            <Circle cx="78" cy="1048" r="7" fill="#FFFFFF" />
            <Circle cx="70" cy="1040" r="6" fill="#FFCA28" />
          </G>

          <G id="daisy2">
            <Circle cx="740" cy="1010" r="12" fill="#FFFFFF" />
            <Circle cx="732" cy="1005" r="6" fill="#FFFFFF" />
            <Circle cx="748" cy="1005" r="6" fill="#FFFFFF" />
            <Circle cx="734" cy="1016" r="6" fill="#FFFFFF" />
            <Circle cx="746" cy="1016" r="6" fill="#FFFFFF" />
            <Circle cx="740" cy="1010" r="5" fill="#FFCA28" />
          </G>

          {/* Golden Meadow Buttercups */}
          <G id="buttercup1">
            <Circle cx="120" cy="1080" r="9" fill="#FFD54F" />
            <Circle cx="114" cy="1076" r="6" fill="#FFCA28" />
            <Circle cx="126" cy="1076" r="6" fill="#FFCA28" />
            <Circle cx="120" cy="1085" r="6" fill="#FFC107" />
            <Circle cx="120" cy="1080" r="3.5" fill="#FF8F00" />
          </G>

          <G id="buttercup2">
            <Circle cx="670" cy="1035" r="8" fill="#FFD54F" />
            <Circle cx="670" cy="1035" r="3.5" fill="#FF8F00" />
          </G>

          {/* Pink Meadow Blossoms */}
          <G id="pinkBlossom1">
            <Circle cx="190" cy="1025" r="10" fill="#FF80AB" />
            <Circle cx="182" cy="1020" r="6.5" fill="#FF4081" />
            <Circle cx="198" cy="1020" r="6.5" fill="#FF4081" />
            <Circle cx="185" cy="1032" r="6.5" fill="#F50057" />
            <Circle cx="195" cy="1032" r="6.5" fill="#F50057" />
            <Circle cx="190" cy="1025" r="4.5" fill="#FFF9C4" />
          </G>

          <G id="pinkBlossom2">
            <Circle cx="630" cy="1010" r="9" fill="#FF80AB" />
            <Circle cx="630" cy="1010" r="4" fill="#FFF9C4" />
          </G>

          {/* Bluebell / Forget-Me-Nots */}
          <G id="bluebell1">
            <Circle cx="260" cy="1060" r="8" fill="#64B5F6" />
            <Circle cx="254" cy="1056" r="5.5" fill="#42A5F5" />
            <Circle cx="266" cy="1056" r="5.5" fill="#42A5F5" />
            <Circle cx="260" cy="1065" r="5.5" fill="#1E88E5" />
            <Circle cx="260" cy="1060" r="3" fill="#FFF59D" />
          </G>

          <G id="bluebell2">
            <Circle cx="540" cy="1030" r="7.5" fill="#64B5F6" />
            <Circle cx="540" cy="1030" r="3" fill="#FFF59D" />
          </G>

          {/* Cute 3-Leaf Clovers */}
          <G id="clover1">
            <Circle cx="45" cy="1120" r="8" fill="#81C784" />
            <Circle cx="37" cy="1114" r="6" fill="#66BB6A" />
            <Circle cx="53" cy="1114" r="6" fill="#66BB6A" />
            <Circle cx="45" cy="1106" r="6" fill="#4CAF50" />
            <Path d="M 45 1120 Q 47 1132 44 1138" stroke="#388E3C" strokeWidth="2" fill="none" />
          </G>

          <G id="clover2">
            <Circle cx="760" cy="1110" r="8" fill="#81C784" />
            <Circle cx="752" cy="1104" r="6" fill="#66BB6A" />
            <Circle cx="768" cy="1104" r="6" fill="#66BB6A" />
            <Circle cx="760" cy="1096" r="6" fill="#4CAF50" />
            <Path d="M 760 1110 Q 762 1122 759 1128" stroke="#388E3C" strokeWidth="2" fill="none" />
          </G>

          {/* Whimsical Red Spotted Toadstool Mushroom (Left Corner) */}
          <G id="mushroomLeft">
            {/* Stem */}
            <Path d="M 90 1230 Q 93 1180 97 1165 L 115 1165 Q 118 1180 122 1230 Z" fill="#FFF9C4" />
            {/* Red Cap */}
            <Path d="M 74 1172 C 74 1130, 138 1130, 138 1172 Z" fill="#E53935" />
            {/* White Polka Dots */}
            <Circle cx="106" cy="1146" r="5" fill="#FFFFFF" />
            <Circle cx="88" cy="1158" r="3.5" fill="#FFFFFF" />
            <Circle cx="124" cy="1158" r="4" fill="#FFFFFF" />
            <Circle cx="106" cy="1165" r="2.5" fill="#FFFFFF" />
          </G>

          {/* Tiny Baby Mushroom Beside It */}
          <G id="mushroomBaby">
            <Path d="M 68 1230 Q 70 1205 73 1195 L 83 1195 Q 85 1205 87 1230 Z" fill="#FFF9C4" />
            <Path d="M 63 1198 C 63 1176, 93 1176, 93 1198 Z" fill="#FF5252" />
            <Circle cx="78" cy="1186" r="3" fill="#FFFFFF" />
          </G>

          {/* Right Corner Wild Daisies & Flora Cluster */}
          <G id="floraClusterRight">
            <Circle cx="710" cy="1200" r="16" fill="#FFFFFF" />
            <Circle cx="696" cy="1192" r="8" fill="#FFFFFF" />
            <Circle cx="724" cy="1192" r="8" fill="#FFFFFF" />
            <Circle cx="698" cy="1208" r="8" fill="#FFFFFF" />
            <Circle cx="722" cy="1208" r="8" fill="#FFFFFF" />
            <Circle cx="710" cy="1200" r="7" fill="#FFCA28" />
          </G>

          {/* Dandelion Fluff / Golden Fairy Dust Sparkles */}
          <Circle cx="220" cy="380" r="3" fill="#FFFFFF" opacity="0.75" />
          <Circle cx="290" cy="420" r="2.5" fill="#FFF9C4" opacity="0.8" />
          <Circle cx="440" cy="320" r="3.5" fill="#FFFFFF" opacity="0.65" />
          <Circle cx="520" cy="460" r="2" fill="#FFF59D" opacity="0.7" />
          <Circle cx="620" cy="390" r="3" fill="#FFFFFF" opacity="0.8" />
          <Circle cx="680" cy="490" r="2" fill="#FFF9C4" opacity="0.65" />
        </Svg>
      </View>

      {/* LIVING ANIMATED NATURE LAYER: Fluttering Storybook Butterflies */}
      {showAnimatedDecorations && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {/* Butterfly 1: Lemon Swallowtail (fluttering upper right) */}
          <Animated.View
            style={[
              styles.butterfly1Container,
              {
                transform: [
                  { translateY: translateY1 },
                  { scaleX: wingScale },
                ],
              },
            ]}
          >
            <Svg width={42} height={38} viewBox="0 0 50 45">
              {/* Antennae */}
              <Path
                d="M 23 15 Q 19 6 15 5 M 27 15 Q 31 6 35 5"
                stroke="#4E342E"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Yellow Wings */}
              <Path
                d="M 25 20 C 15 6, 2 12, 5 24 C 7 32, 20 30, 25 24 Z"
                fill="#FFEB3B"
                stroke="#FBC02D"
                strokeWidth="1.2"
              />
              <Path
                d="M 25 20 C 35 6, 48 12, 45 24 C 43 32, 30 30, 25 24 Z"
                fill="#FFEB3B"
                stroke="#FBC02D"
                strokeWidth="1.2"
              />
              {/* Lower Wings */}
              <Ellipse cx="16" cy="30" rx="9" ry="7" fill="#FFF176" />
              <Ellipse cx="34" cy="30" rx="9" ry="7" fill="#FFF176" />
              {/* Orange Wing Highlights */}
              <Circle cx="14" cy="20" r="3.5" fill="#FF9800" opacity="0.8" />
              <Circle cx="36" cy="20" r="3.5" fill="#FF9800" opacity="0.8" />
              {/* Body */}
              <Ellipse cx="25" cy="22" rx="2.5" ry="8" fill="#4E342E" />
            </Svg>
          </Animated.View>

          {/* Butterfly 2: Fairy Violet / Azure (fluttering mid-left near Companion Pet) */}
          <Animated.View
            style={[
              styles.butterfly2Container,
              {
                transform: [
                  { translateY: translateY2 },
                  { translateX: translateX2 },
                ],
              },
            ]}
          >
            <Svg width={36} height={32} viewBox="0 0 50 45">
              <Path
                d="M 23 15 Q 18 8 14 7 M 27 15 Q 32 8 36 7"
                stroke="#311B92"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Lavender / Turquoise Wings */}
              <Path
                d="M 25 20 C 16 8, 4 14, 7 24 C 9 31, 20 28, 25 23 Z"
                fill="#BA68C8"
                stroke="#8E24AA"
                strokeWidth="1.2"
              />
              <Path
                d="M 25 20 C 34 8, 46 14, 43 24 C 41 31, 30 28, 25 23 Z"
                fill="#BA68C8"
                stroke="#8E24AA"
                strokeWidth="1.2"
              />
              <Ellipse cx="17" cy="28" rx="7.5" ry="6" fill="#80DEEA" />
              <Ellipse cx="33" cy="28" rx="7.5" ry="6" fill="#80DEEA" />
              <Circle cx="16" cy="18" r="2.8" fill="#FFFFFF" opacity="0.9" />
              <Circle cx="34" cy="18" r="2.8" fill="#FFFFFF" opacity="0.9" />
              <Ellipse cx="25" cy="22" rx="2.2" ry="7.5" fill="#311B92" />
            </Svg>
          </Animated.View>
        </View>
      )}

      {/* Content wrapper: Holds the child application screen */}
      <View style={styles.childrenWrapper}>{children}</View>
    </View>
  );
};

// ============================================================================
// CARVED WOODEN FRAME COMPONENT (For the Match-3 Board)
// ============================================================================

interface CarvedWoodFrameProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  title?: string;
  width?: number;
  height?: number;
}

/**
 * CarvedWoodFrame
 *
 * Wraps the Match-3 game board in a handcrafted storybook toy wooden tray.
 * Features:
 * - Rich chestnut & golden honey wood grain bevels
 * - 4 Corner wooden joinery blocks with concentric tree ring end-grain
 * - Carved leaf & ivy flourishes gracefully embracing the frame
 * - Wood peg dowels
 * - Recessed shadow inner tray so animal pieces look nestled in warm timber
 */
export const CarvedWoodFrame: React.FC<CarvedWoodFrameProps> = ({
  children,
  style,
  title = 'WOODLAND PUZZLE',
  width,
  height,
}) => {
  return (
    <View style={[styles.frameOuterWrapper, style]}>
      {/* Hand-carved Wooden Border Box */}
      <View style={styles.woodenBezel}>
        {/* Top Carved Wood Sign Plaque with Forest Leaves */}
        <View style={styles.plaqueHeader}>
          <Svg width={28} height={18} viewBox="0 0 28 18">
            {/* Left Leaf Sprout */}
            <Path
              d="M 2 12 C 6 4, 18 6, 26 12 C 18 16, 6 16, 2 12 Z"
              fill="#7CB342"
            />
            <Path
              d="M 2 12 Q 14 10 26 12"
              stroke="#DCEDC8"
              strokeWidth="1.2"
              fill="none"
            />
          </Svg>
          <Text style={styles.plaqueText}>🍃 {title} 🍃</Text>
          <Svg width={28} height={18} viewBox="0 0 28 18">
            {/* Right Leaf Sprout */}
            <Path
              d="M 26 12 C 22 4, 10 6, 2 12 C 10 16, 22 16, 26 12 Z"
              fill="#7CB342"
            />
            <Path
              d="M 26 12 Q 14 10 2 12"
              stroke="#DCEDC8"
              strokeWidth="1.2"
              fill="none"
            />
          </Svg>
        </View>

        {/* The Frame Body with Carved Corner Joinery & Inner Board */}
        <View style={styles.woodenPlankContainer}>
          {/* Top-Left Wooden Joinery Rosette */}
          <View style={[styles.cornerPeg, styles.pegTopLeft]}>
            <Svg width={22} height={22} viewBox="0 0 30 30">
              <Circle cx="15" cy="15" r="14" fill="#8D5B28" stroke="#5A3312" strokeWidth="2" />
              <Circle cx="15" cy="15" r="9" stroke="#A26F3E" strokeWidth="1.5" fill="none" />
              <Circle cx="15" cy="15" r="4.5" stroke="#5A3312" strokeWidth="1.2" fill="#6A3B18" />
              <Circle cx="13" cy="13" r="1.8" fill="#D79E65" />
            </Svg>
          </View>

          {/* Top-Right Wooden Joinery Rosette */}
          <View style={[styles.cornerPeg, styles.pegTopRight]}>
            <Svg width={22} height={22} viewBox="0 0 30 30">
              <Circle cx="15" cy="15" r="14" fill="#8D5B28" stroke="#5A3312" strokeWidth="2" />
              <Circle cx="15" cy="15" r="9" stroke="#A26F3E" strokeWidth="1.5" fill="none" />
              <Circle cx="15" cy="15" r="4.5" stroke="#5A3312" strokeWidth="1.2" fill="#6A3B18" />
              <Circle cx="13" cy="13" r="1.8" fill="#D79E65" />
            </Svg>
          </View>

          {/* Bottom-Left Wooden Joinery Rosette */}
          <View style={[styles.cornerPeg, styles.pegBottomLeft]}>
            <Svg width={22} height={22} viewBox="0 0 30 30">
              <Circle cx="15" cy="15" r="14" fill="#8D5B28" stroke="#5A3312" strokeWidth="2" />
              <Circle cx="15" cy="15" r="9" stroke="#A26F3E" strokeWidth="1.5" fill="none" />
              <Circle cx="15" cy="15" r="4.5" stroke="#5A3312" strokeWidth="1.2" fill="#6A3B18" />
              <Circle cx="13" cy="13" r="1.8" fill="#D79E65" />
            </Svg>
          </View>

          {/* Bottom-Right Wooden Joinery Rosette */}
          <View style={[styles.cornerPeg, styles.pegBottomRight]}>
            <Svg width={22} height={22} viewBox="0 0 30 30">
              <Circle cx="15" cy="15" r="14" fill="#8D5B28" stroke="#5A3312" strokeWidth="2" />
              <Circle cx="15" cy="15" r="9" stroke="#A26F3E" strokeWidth="1.5" fill="none" />
              <Circle cx="15" cy="15" r="4.5" stroke="#5A3312" strokeWidth="1.2" fill="#6A3B18" />
              <Circle cx="13" cy="13" r="1.8" fill="#D79E65" />
            </Svg>
          </View>

          {/* Leaf Vine Corner Accents (Studio Ghibli nature detail) */}
          <View style={[styles.ivyCorner, styles.ivyTopLeft]}>
            <Svg width={26} height={26} viewBox="0 0 30 30">
              <Path
                d="M 5 25 Q 12 12 25 5 Q 18 18 5 25 Z"
                fill="#8BC34A"
                stroke="#558B2F"
                strokeWidth="1"
              />
              <Circle cx="10" cy="18" r="3" fill="#AED581" />
            </Svg>
          </View>

          <View style={[styles.ivyCorner, styles.ivyTopRight]}>
            <Svg width={26} height={26} viewBox="0 0 30 30">
              <Path
                d="M 25 25 Q 18 12 5 5 Q 12 18 25 25 Z"
                fill="#8BC34A"
                stroke="#558B2F"
                strokeWidth="1"
              />
              <Circle cx="20" cy="18" r="3" fill="#AED581" />
            </Svg>
          </View>

          {/* Recessed Inner Tray (hugs the game board cleanly) */}
          <View style={styles.innerTray}>{children}</View>
        </View>
      </View>
    </View>
  );
};

export default StorybookMeadow;

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#7CD3FA', // Fallback color while SVG paints
  },
  childrenWrapper: {
    flex: 1,
    zIndex: 1,
  },

  // Floating Butterflies
  butterfly1Container: {
    position: 'absolute',
    top: 55,
    right: 28,
    zIndex: 2,
  },
  butterfly2Container: {
    position: 'absolute',
    top: 195,
    left: 18,
    zIndex: 2,
  },

  // Carved Wood Frame Styles
  frameOuterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  woodenBezel: {
    backgroundColor: '#8D5B28', // Rich chestnut wood
    borderRadius: 26,
    padding: 6,
    borderWidth: 4,
    borderColor: '#C28854', // Golden honey wood highlight rim
    borderBottomColor: '#45240E', // Dark shadow underside
    borderRightColor: '#5C3415',
    ...Platform.select({
      web: {
        boxShadow: '0 8px 24px rgba(78, 42, 14, 0.45), 0 2px 6px rgba(0, 0, 0, 0.25)',
      },
      default: {
        shadowColor: '#45240E',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 14,
        elevation: 12,
      },
    }),
  },
  plaqueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    gap: 6,
  },
  plaqueText: {
    color: '#FFE082',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(69, 36, 14, 0.9)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 3,
  },
  woodenPlankContainer: {
    position: 'relative',
    backgroundColor: '#6A3B18', // Deep grain inner wood
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#4E2A0E',
    overflow: 'visible',
    padding: 4,
  },
  innerTray: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#4A280F', // Recessed puzzle board tray
  },

  // Wood Joinery Pegs & Vines
  cornerPeg: {
    position: 'absolute',
    zIndex: 10,
  },
  pegTopLeft: {
    top: -8,
    left: -8,
  },
  pegTopRight: {
    top: -8,
    right: -8,
  },
  pegBottomLeft: {
    bottom: -8,
    left: -8,
  },
  pegBottomRight: {
    bottom: -8,
    right: -8,
  },

  ivyCorner: {
    position: 'absolute',
    zIndex: 9,
  },
  ivyTopLeft: {
    top: -14,
    left: 8,
  },
  ivyTopRight: {
    top: -14,
    right: 8,
  },
});
