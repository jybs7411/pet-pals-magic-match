import React from 'react';
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Circle,
  Path,
  Rect,
  G,
  Ellipse,
  Polygon,
} from 'react-native-svg';
import { AnimalType, SpecialType } from '../types/game';

// ============================================================================
// 1. RAINBOW BUTTERFLY (replaces Color Bomb)
// ============================================================================
export const RainbowButterflySvg: React.FC<{ size: number }> = ({ size }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id="rainbowGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFF" />
          <Stop offset="40%" stopColor="#FF80AB" />
          <Stop offset="70%" stopColor="#80D8FF" />
          <Stop offset="100%" stopColor="#CCFF90" />
        </RadialGradient>
        <RadialGradient id="wingGrad" cx="30%" cy="30%" r="70%">
          <Stop offset="0%" stopColor="#FFEB3B" />
          <Stop offset="50%" stopColor="#FF4081" />
          <Stop offset="100%" stopColor="#7C4DFF" />
        </RadialGradient>
      </Defs>

      {/* Pulsing Stardust Aura */}
      <Circle cx="50" cy="50" r="44" fill="url(#rainbowGlow)" opacity="0.45" />
      <Circle cx="50" cy="50" r="36" fill="#FFFFFF" opacity="0.85" />

      {/* Butterfly Wings */}
      <G>
        {/* Top Left Wing */}
        <Path d="M 50 48 Q 22 18 20 40 Q 20 54 50 50 Z" fill="url(#wingGrad)" />
        {/* Top Right Wing */}
        <Path d="M 50 48 Q 78 18 80 40 Q 80 54 50 50 Z" fill="url(#wingGrad)" />
        {/* Bottom Left Wing */}
        <Path d="M 50 50 Q 28 62 34 76 Q 48 76 50 54 Z" fill="#00E5FF" />
        {/* Bottom Right Wing */}
        <Path d="M 50 50 Q 72 62 66 76 Q 52 76 50 54 Z" fill="#00E5FF" />
        {/* Butterfly Body */}
        <Ellipse cx="50" cy="52" rx="4" ry="16" fill="#4A148C" />
        <Circle cx="50" cy="38" r="5" fill="#4A148C" />
        {/* Antennae */}
        <Path d="M 48 35 Q 40 26 38 28" stroke="#4A148C" strokeWidth="2.5" fill="none" />
        <Path d="M 52 35 Q 60 26 62 28" stroke="#4A148C" strokeWidth="2.5" fill="none" />
      </G>

      {/* Sparkle Stars */}
      <Circle cx="28" cy="30" r="3" fill="#FFF" />
      <Circle cx="72" cy="30" r="3" fill="#FFF" />
      <Circle cx="50" cy="80" r="3.5" fill="#FFD700" />
    </Svg>
  );
};

// ============================================================================
// 2. HONEY SPLASH POT (replaces Wrapped Bomb)
// ============================================================================
export const HoneyJarSvg: React.FC<{ size: number }> = ({ size }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id="honeyGrad" cx="40%" cy="30%" r="70%">
          <Stop offset="0%" stopColor="#FFE082" />
          <Stop offset="50%" stopColor="#FFA000" />
          <Stop offset="100%" stopColor="#FF6F00" />
        </RadialGradient>
        <RadialGradient id="potGrad" cx="40%" cy="40%" r="60%">
          <Stop offset="0%" stopColor="#D7CCC8" />
          <Stop offset="80%" stopColor="#8D6E63" />
          <Stop offset="100%" stopColor="#5D4037" />
        </RadialGradient>
      </Defs>

      {/* Honey Splash Burst */}
      <Path
        d="M 50 14 Q 68 8 76 26 Q 92 42 78 62 Q 88 84 66 84 Q 50 94 34 84 Q 12 84 20 62 Q 8 42 24 26 Q 32 8 50 14 Z"
        fill="url(#honeyGrad)"
        opacity="0.35"
      />

      {/* Clay Pot Body */}
      <Path
        d="M 28 36 L 72 36 L 68 76 C 68 84, 32 84, 32 76 Z"
        fill="url(#potGrad)"
      />
      <Rect x="24" y="30" width="52" height="8" rx="4" fill="#6D4C41" />

      {/* Dripping Golden Honey */}
      <Path
        d="M 28 36 Q 38 52 44 42 Q 52 60 58 40 Q 64 54 72 36 Z"
        fill="url(#honeyGrad)"
      />
      <Circle cx="44" cy="52" r="4" fill="#FFA000" />

      {/* Honey Tag */}
      <Rect x="38" y="58" width="24" height="14" rx="4" fill="#FFF9C4" />
      <Circle cx="50" cy="65" r="4" fill="#FFA000" />
    </Svg>
  );
};

// ============================================================================
// 3. 🐝 BUMBLEBEE COPTER (Propeller + Stardust Trail)
// ============================================================================
export const BumblebeeCopterSvg: React.FC<{ size: number }> = ({ size }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id="beeAura" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFF9C4" stopOpacity="0.85" />
          <Stop offset="60%" stopColor="#FFD54F" stopOpacity="0.4" />
          <Stop offset="100%" stopColor="#FFB300" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="beeBodyGrad" cx="40%" cy="35%" r="65%">
          <Stop offset="0%" stopColor="#FFF176" />
          <Stop offset="45%" stopColor="#FFD54F" />
          <Stop offset="85%" stopColor="#FFB300" />
          <Stop offset="100%" stopColor="#FF8F00" />
        </RadialGradient>
        <LinearGradient id="propellerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.4)" />
          <Stop offset="25%" stopColor="#FFF59D" />
          <Stop offset="50%" stopColor="#FFE082" />
          <Stop offset="75%" stopColor="#FFF59D" />
          <Stop offset="100%" stopColor="rgba(255, 255, 255, 0.4)" />
        </LinearGradient>
        <LinearGradient id="wingGradBee" x1="20%" y1="0%" x2="80%" y2="100%">
          <Stop offset="0%" stopColor="#E0F7FA" stopOpacity="0.9" />
          <Stop offset="60%" stopColor="#B2EBF2" stopOpacity="0.75" />
          <Stop offset="100%" stopColor="#80DEEA" stopOpacity="0.6" />
        </LinearGradient>
      </Defs>

      {/* Golden Stardust Glow */}
      <Circle cx="50" cy="52" r="46" fill="url(#beeAura)" />

      {/* Stardust Trail Swoosh (Magical spiraling flight trail) */}
      <Path
        d="M 12 78 Q 24 88 42 82 Q 62 76 78 84"
        stroke="#FFD54F"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="4 6"
        fill="none"
        opacity="0.85"
      />
      <Path
        d="M 18 72 Q 32 80 48 74"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      {/* Stardust Starlets */}
      <Circle cx="14" cy="74" r="3" fill="#FFF59D" />
      <Circle cx="28" cy="84" r="2" fill="#FFFFFF" />
      <Circle cx="44" cy="80" r="3.5" fill="#FFD700" />
      <Circle cx="76" cy="86" r="2.5" fill="#FFF9C4" />
      <Polygon points="22,64 24,67 27,67 24,69 25,72 22,70 19,72 20,69 17,67 20,67" fill="#FFEB3B" />

      {/* Translucent Gossamer Wings */}
      <Ellipse cx="38" cy="38" rx="16" ry="9" fill="url(#wingGradBee)" transform="rotate(-26 38 38)" />
      <Ellipse cx="62" cy="38" rx="16" ry="9" fill="url(#wingGradBee)" transform="rotate(26 62 38)" />
      <Path d="M 38 38 Q 30 32 26 35" stroke="#FFFFFF" strokeWidth="1.2" fill="none" opacity="0.8" />
      <Path d="M 62 38 Q 70 32 74 35" stroke="#FFFFFF" strokeWidth="1.2" fill="none" opacity="0.8" />

      {/* Chubby Fuzzy Bumblebee Body */}
      <Ellipse cx="50" cy="56" rx="26" ry="22" fill="url(#beeBodyGrad)" />

      {/* Velvety Black Bee Stripes */}
      <Path
        d="M 40 37 Q 50 36 60 37 L 62 44 Q 50 43 38 44 Z"
        fill="#263238"
      />
      <Path
        d="M 32 50 Q 50 49 68 50 L 67 59 Q 50 58 33 59 Z"
        fill="#263238"
      />
      <Path
        d="M 36 65 Q 50 64 64 65 L 61 72 Q 50 72 39 72 Z"
        fill="#263238"
      />

      {/* Tiny Rounded Stinger */}
      <Path d="M 48 77 Q 50 84 52 77 Z" fill="#212121" />

      {/* Rosy Blushing Cheeks */}
      <Circle cx="36" cy="56" r="4.5" fill="#FF8A80" opacity="0.75" />
      <Circle cx="64" cy="56" r="4.5" fill="#FF8A80" opacity="0.75" />

      {/* Big Cheerful Eyes */}
      <Circle cx="42" cy="48" r="4" fill="#212121" />
      <Circle cx="43.5" cy="46.5" r="1.5" fill="#FFFFFF" />
      <Circle cx="58" cy="48" r="4" fill="#212121" />
      <Circle cx="59.5" cy="46.5" r="1.5" fill="#FFFFFF" />

      {/* Happy Grin */}
      <Path d="M 47 54 Q 50 58 53 54" stroke="#212121" strokeWidth="1.8" strokeLinecap="round" fill="none" />

      {/* Antennae */}
      <Path d="M 44 38 Q 40 28 35 30" stroke="#37474F" strokeWidth="2" strokeLinecap="round" fill="none" />
      <Circle cx="34" cy="30" r="2.8" fill="#FFA000" />
      <Path d="M 56 38 Q 60 28 65 30" stroke="#37474F" strokeWidth="2" strokeLinecap="round" fill="none" />
      <Circle cx="66" cy="30" r="2.8" fill="#FFA000" />

      {/* Spinning Propeller Copter Assembly */}
      {/* Propeller Mount Shaft */}
      <Rect x="48" y="24" width="4" height="12" rx="2" fill="#B0BEC5" />
      <Rect x="47" y="22" width="6" height="4" rx="2" fill="#78909C" />

      {/* Spinning Propeller Motion Blur Ellipse */}
      <Ellipse cx="50" cy="22" rx="38" ry="7" fill="rgba(255, 238, 88, 0.3)" />
      <Ellipse cx="50" cy="22" rx="34" ry="5.5" stroke="url(#propellerGrad)" strokeWidth="1.8" fill="none" opacity="0.8" />

      {/* Main Spinning Blade Wings */}
      <Path
        d="M 50 22 Q 22 18 14 22 Q 22 26 50 22 Z"
        fill="url(#propellerGrad)"
      />
      <Path
        d="M 50 22 Q 78 18 86 22 Q 78 26 50 22 Z"
        fill="url(#propellerGrad)"
      />
      {/* Blade motion blur lines */}
      <Path d="M 18 20 Q 30 17 44 20" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.9" />
      <Path d="M 56 24 Q 70 27 82 24" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.9" />

      {/* Golden Propeller Center Cap */}
      <Circle cx="50" cy="22" r="5" fill="#FFA000" stroke="#FFD54F" strokeWidth="1.5" />
      <Circle cx="48.5" cy="20.5" r="1.6" fill="#FFF9C4" />
    </Svg>
  );
};

// ============================================================================
// 4. ⭐ STAR WAND (Glowing Diagonal Cosmic Rays)
// ============================================================================
export const StarWandSvg: React.FC<{ size: number }> = ({ size }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        {/* Cosmic Ray Gradients */}
        <LinearGradient id="cosmicRayDiag1" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFF9C4" stopOpacity="0.85" />
          <Stop offset="30%" stopColor="#80D8FF" stopOpacity="0.5" />
          <Stop offset="70%" stopColor="#EA80FC" stopOpacity="0.3" />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </LinearGradient>
        <LinearGradient id="cosmicRayDiag2" x1="100%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFE57F" stopOpacity="0.8" />
          <Stop offset="40%" stopColor="#B9F6CA" stopOpacity="0.45" />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </LinearGradient>
        <RadialGradient id="starCoreGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="35%" stopColor="#FFF59D" />
          <Stop offset="70%" stopColor="#FFD54F" />
          <Stop offset="100%" stopColor="#FF9800" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="wandShaftGrad" cx="35%" cy="35%" r="65%">
          <Stop offset="0%" stopColor="#D7A15C" />
          <Stop offset="50%" stopColor="#8D5B28" />
          <Stop offset="100%" stopColor="#5A3312" />
        </RadialGradient>
      </Defs>

      {/* Cosmic Burst Glow Halo */}
      <Circle cx="50" cy="38" r="42" fill="url(#starCoreGlow)" opacity="0.65" />

      {/* Diagonal Cosmic Rays radiating outward */}
      {/* Top-Right to Bottom-Left ray beam */}
      <Polygon points="46,34 94,6 88,16 52,40" fill="url(#cosmicRayDiag1)" />
      <Polygon points="48,36 8,86 16,92 54,42" fill="url(#cosmicRayDiag1)" />
      {/* Top-Left to Bottom-Right ray beam */}
      <Polygon points="46,38 6,10 14,4 52,34" fill="url(#cosmicRayDiag2)" />
      <Polygon points="54,40 92,84 84,90 48,44" fill="url(#cosmicRayDiag2)" />

      {/* Sparkle Starlight Twinkles */}
      <Circle cx="86" cy="14" r="3" fill="#FFFFFF" />
      <Circle cx="12" cy="18" r="3" fill="#FFFFFF" />
      <Circle cx="84" cy="78" r="2.5" fill="#FFE57F" />
      <Circle cx="22" cy="74" r="2.5" fill="#80D8FF" />

      {/* Polished Wooden Wand Shaft (Angled diagonally) */}
      <G transform="rotate(32 50 62)">
        {/* Main Wand Shaft */}
        <Path
          d="M 47 42 L 53 42 L 51 90 L 49 90 Z"
          fill="url(#wandShaftGrad)"
        />
        {/* Golden Spiraling Filigree Wrap */}
        <Path
          d="M 47 48 Q 50 49 53 52 M 47 58 Q 50 59 53 62 M 47 68 Q 50 69 53 72 M 47 78 Q 50 79 53 82"
          stroke="#FFD54F"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
        {/* Wand Acorn / Crystal Pommel at bottom */}
        <Circle cx="50" cy="91" r="4.5" fill="#FFA000" stroke="#FFD54F" strokeWidth="1.2" />
        <Circle cx="49" cy="90" r="1.5" fill="#FFFDE7" />
        {/* Golden Collar ring below star */}
        <Rect x="46" y="38" width="8" height="4" rx="2" fill="#FFA000" stroke="#FFE082" strokeWidth="1" />
      </G>

      {/* Brilliant 5-Pointed Faceted Golden Star */}
      <G>
        {/* Star Outer Drop Shadow / Glow */}
        <Path
          d="M 50 12 L 58 29 L 77 30 L 62 43 L 67 61 L 50 50 L 33 61 L 38 43 L 23 30 L 42 29 Z"
          fill="#FF8F00"
          stroke="#E65100"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Faceted Star Shading (Gives brilliant 3D jewel effect) */}
        <Polygon points="50,12 50,40 42,29" fill="#FFFDE7" />
        <Polygon points="50,12 50,40 58,29" fill="#FFCA28" />
        <Polygon points="77,30 50,40 58,29" fill="#FFF59D" />
        <Polygon points="77,30 50,40 62,43" fill="#FFA000" />
        <Polygon points="67,61 50,40 62,43" fill="#FFB300" />
        <Polygon points="67,61 50,40 50,50" fill="#FF8F00" />
        <Polygon points="33,61 50,40 50,50" fill="#FF6F00" />
        <Polygon points="33,61 50,40 38,43" fill="#FFB300" />
        <Polygon points="23,30 50,40 38,43" fill="#FFA000" />
        <Polygon points="23,30 50,40 42,29" fill="#FFF59D" />

        {/* Center Brilliant Diamond Sparkle */}
        <Circle cx="50" cy="39" r="4.5" fill="#FFFFFF" />
        {/* 4-Point Starlight Glint */}
        <Polygon points="50,28 52,39 61,39 52,39 50,50 48,39 39,39 48,39" fill="#FFFFFF" />
      </G>
    </Svg>
  );
};

// ============================================================================
// 5. 👑 ROYAL CROWN (Sparkling Gemstones)
// ============================================================================
export const RoyalCrownSvg: React.FC<{ size: number }> = ({ size }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id="crownAura" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFF9C4" stopOpacity="0.8" />
          <Stop offset="55%" stopColor="#FFD54F" stopOpacity="0.35" />
          <Stop offset="100%" stopColor="#FF8F00" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="crownGold" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFF9C4" />
          <Stop offset="30%" stopColor="#FFD54F" />
          <Stop offset="70%" stopColor="#FFA000" />
          <Stop offset="100%" stopColor="#C67C00" />
        </LinearGradient>
        <RadialGradient id="rubyGlow" cx="35%" cy="30%" r="70%">
          <Stop offset="0%" stopColor="#FF80AB" />
          <Stop offset="40%" stopColor="#FF1744" />
          <Stop offset="80%" stopColor="#D50000" />
          <Stop offset="100%" stopColor="#880E4F" />
        </RadialGradient>
        <RadialGradient id="sapphireGlow" cx="35%" cy="30%" r="70%">
          <Stop offset="0%" stopColor="#80D8FF" />
          <Stop offset="50%" stopColor="#00B0FF" />
          <Stop offset="100%" stopColor="#01579B" />
        </RadialGradient>
        <RadialGradient id="emeraldGlow" cx="35%" cy="30%" r="70%">
          <Stop offset="0%" stopColor="#B9F6CA" />
          <Stop offset="50%" stopColor="#00E676" />
          <Stop offset="100%" stopColor="#1B5E20" />
        </RadialGradient>
        <RadialGradient id="velvetGrad" cx="50%" cy="35%" r="65%">
          <Stop offset="0%" stopColor="#C2185B" />
          <Stop offset="65%" stopColor="#880E4F" />
          <Stop offset="100%" stopColor="#4A148C" />
        </RadialGradient>
      </Defs>

      {/* Royal Golden Halo Aura */}
      <Circle cx="50" cy="50" r="46" fill="url(#crownAura)" />

      {/* Velvet Cushion Dome Behind Golden Arches */}
      <Path
        d="M 24 64 C 24 34, 76 34, 76 64 Z"
        fill="url(#velvetGrad)"
      />
      <Path
        d="M 50 34 L 50 64"
        stroke="#E91E63"
        strokeWidth="2.5"
        opacity="0.6"
      />
      {/* Velvet Highlights */}
      <Path
        d="M 32 50 Q 50 42 68 50"
        stroke="#F48FB1"
        strokeWidth="2"
        fill="none"
        opacity="0.4"
      />

      {/* Ornate Golden Crown Frame (5 Arches / Spires) */}
      <Path
        d="M 18 64 L 18 42 Q 24 45 28 48 L 34 32 Q 42 42 46 44 L 50 20 L 54 44 Q 58 42 66 32 L 72 48 Q 76 45 82 42 L 82 64 Z"
        fill="url(#crownGold)"
        stroke="#8D5300"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Golden Pearled Finials atop Spires */}
      <Circle cx="18" cy="41" r="3.5" fill="#FFF9C4" stroke="#FFA000" strokeWidth="1" />
      <Circle cx="34" cy="31" r="4" fill="#FFF9C4" stroke="#FFA000" strokeWidth="1" />
      <Circle cx="50" cy="19" r="5.5" fill="#FFF9C4" stroke="#FFA000" strokeWidth="1.2" />
      <Circle cx="66" cy="31" r="4" fill="#FFF9C4" stroke="#FFA000" strokeWidth="1" />
      <Circle cx="82" cy="41" r="3.5" fill="#FFF9C4" stroke="#FFA000" strokeWidth="1" />

      {/* Ermine Fur Trim Base Band */}
      <Rect x="16" y="62" width="68" height="12" rx="4" fill="#FFFFFF" stroke="#D7CCC8" strokeWidth="1" />
      {/* Dark Ermine Tuft Marks */}
      <Path d="M 26 66 L 27 70 M 28 66 L 27 70" stroke="#37474F" strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M 40 66 L 41 70 M 42 66 L 41 70" stroke="#37474F" strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M 50 66 L 51 70 M 52 66 L 51 70" stroke="#37474F" strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M 60 66 L 61 70 M 62 66 L 61 70" stroke="#37474F" strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M 74 66 L 75 70 M 76 66 L 75 70" stroke="#37474F" strokeWidth="1.5" strokeLinecap="round" />

      {/* Gold Trim Ribbons on Fur Base */}
      <Rect x="16" y="73" width="68" height="4" rx="2" fill="url(#crownGold)" />
      <Rect x="16" y="60" width="68" height="3" rx="1.5" fill="url(#crownGold)" />

      {/* Sparkling Gemstones on Crown Body */}
      {/* Center Grand Ruby */}
      <Polygon
        points="50,44 57,51 54,60 46,60 43,51"
        fill="url(#rubyGlow)"
        stroke="#FF80AB"
        strokeWidth="1.2"
      />
      {/* Ruby Facet Highlight */}
      <Polygon points="50,45 54,51 50,54 46,51" fill="#FF80AB" opacity="0.6" />
      <Circle cx="48" cy="48" r="1.5" fill="#FFFFFF" />

      {/* Left Sapphire Gem */}
      <Polygon
        points="32,49 37,53 35,59 29,59 27,53"
        fill="url(#sapphireGlow)"
        stroke="#80D8FF"
        strokeWidth="1"
      />
      <Circle cx="31" cy="52" r="1.2" fill="#FFFFFF" />

      {/* Right Emerald Gem */}
      <Polygon
        points="68,49 73,53 71,59 65,59 63,53"
        fill="url(#emeraldGlow)"
        stroke="#B9F6CA"
        strokeWidth="1"
      />
      <Circle cx="67" cy="52" r="1.2" fill="#FFFFFF" />

      {/* Shimmering Diamond Star Flare Sparkles */}
      <Polygon points="50,38 51,44 57,44 51,45 50,50 49,45 43,44 49,44" fill="#FFFFFF" />
      <Circle cx="24" cy="46" r="2" fill="#FFFFFF" />
      <Circle cx="76" cy="46" r="2" fill="#FFFFFF" />
      <Polygon points="50,11 51,16 56,16 51,17 50,22 49,17 44,16 49,16" fill="#FFFFFF" />
    </Svg>
  );
};

// ============================================================================
// MAIN ANIMAL PAL SVG (Species + Specials)
// ============================================================================
interface AnimalPalSvgProps {
  species: AnimalType;
  special: SpecialType;
  size: number;
}

export const AnimalPalSvg: React.FC<AnimalPalSvgProps> = ({
  species,
  special,
  size,
}) => {
  // 1. Rainbow Butterfly Orb
  if (special === 'color_bomb') {
    return <RainbowButterflySvg size={size} />;
  }

  // 2. Honey Splash Pot
  if (special === 'wrapped') {
    return <HoneyJarSvg size={size} />;
  }

  // 3. Bumblebee Copter
  if (special === 'bee_copter') {
    return <BumblebeeCopterSvg size={size} />;
  }

  // 4. Star Wand
  if (special === 'star_wand') {
    return <StarWandSvg size={size} />;
  }

  // 5. Royal Crown
  if (special === 'royal_crown') {
    return <RoyalCrownSvg size={size} />;
  }

  const isPopperH = special === 'striped_h';
  const isPopperV = special === 'striped_v';

  // 6. Animal Faces
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id="faceShine" cx="35%" cy="30%" r="60%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* 🦊 FOX (Pippin) */}
      {species === 'fox' && (
        <G>
          {/* Pointy Ears */}
          <Path d="M 20 46 L 14 16 L 38 32 Z" fill="#E65100" />
          <Path d="M 20 40 L 17 22 L 32 32 Z" fill="#FFE0B2" />
          <Path d="M 80 46 L 86 16 L 62 32 Z" fill="#E65100" />
          <Path d="M 80 40 L 83 22 L 68 32 Z" fill="#FFE0B2" />

          {/* Fox Face Base */}
          <Circle cx="50" cy="54" r="32" fill="#FF6F00" />

          {/* White Cheeks */}
          <Path d="M 22 56 Q 34 76 50 76 Q 66 76 78 56 Q 60 62 50 60 Q 40 62 22 56 Z" fill="#FFFFFF" />

          {/* Eyes */}
          <Circle cx="38" cy="48" r="4.5" fill="#2E1C0C" />
          <Circle cx="40" cy="46" r="1.8" fill="#FFFFFF" />
          <Circle cx="62" cy="48" r="4.5" fill="#2E1C0C" />
          <Circle cx="64" cy="46" r="1.8" fill="#FFFFFF" />

          {/* Nose & Mouth */}
          <Circle cx="50" cy="64" r="3.5" fill="#2E1C0C" />
          <Path d="M 46 68 Q 50 72 54 68" stroke="#2E1C0C" strokeWidth="2" strokeLinecap="round" fill="none" />
        </G>
      )}

      {/* 🐼 PANDA (Bao) */}
      {species === 'panda' && (
        <G>
          {/* Round Black Ears */}
          <Circle cx="24" cy="28" r="12" fill="#263238" />
          <Circle cx="76" cy="28" r="12" fill="#263238" />

          {/* White Face Base */}
          <Circle cx="50" cy="54" r="32" fill="#ECEFF1" />

          {/* Black Eye Patches */}
          <Ellipse cx="36" cy="50" rx="9" ry="7" fill="#263238" transform="rotate(-15 36 50)" />
          <Ellipse cx="64" cy="50" rx="9" ry="7" fill="#263238" transform="rotate(15 64 50)" />

          {/* Shiny Eyes */}
          <Circle cx="37" cy="49" r="4" fill="#FFFFFF" />
          <Circle cx="38" cy="49" r="2.5" fill="#263238" />
          <Circle cx="63" cy="49" r="4" fill="#FFFFFF" />
          <Circle cx="62" cy="49" r="2.5" fill="#263238" />

          {/* Rosy Cheeks */}
          <Circle cx="26" cy="60" r="5" fill="#FF80AB" opacity="0.6" />
          <Circle cx="74" cy="60" r="5" fill="#FF80AB" opacity="0.6" />

          {/* Nose & Smile */}
          <Ellipse cx="50" cy="62" rx="4" ry="3" fill="#263238" />
          <Path d="M 46 66 Q 50 70 54 66" stroke="#263238" strokeWidth="2" strokeLinecap="round" fill="none" />
        </G>
      )}

      {/* 🐰 BUNNY (Bella) */}
      {species === 'bunny' && (
        <G>
          {/* Long Floppy Ears */}
          <Path d="M 32 40 C 26 12 36 6 42 12 C 48 20 40 38 38 42 Z" fill="#F48FB1" />
          <Path d="M 34 36 C 30 16 36 12 39 16 C 43 22 38 34 37 38 Z" fill="#FCE4EC" />
          <Path d="M 68 40 C 74 12 64 6 58 12 C 52 20 60 38 62 42 Z" fill="#F48FB1" />
          <Path d="M 66 36 C 70 16 64 12 61 16 C 57 22 62 34 63 38 Z" fill="#FCE4EC" />

          {/* Bunny Face */}
          <Circle cx="50" cy="54" r="32" fill="#F8BBD0" />

          {/* Big Cheerful Eyes */}
          <Circle cx="38" cy="48" r="4.5" fill="#880E4F" />
          <Circle cx="40" cy="46" r="2" fill="#FFFFFF" />
          <Circle cx="62" cy="48" r="4.5" fill="#880E4F" />
          <Circle cx="64" cy="46" r="2" fill="#FFFFFF" />

          {/* Rosy Cheeks */}
          <Circle cx="28" cy="58" r="5.5" fill="#FF4081" opacity="0.45" />
          <Circle cx="72" cy="58" r="5.5" fill="#FF4081" opacity="0.45" />

          {/* Heart Nose & Whiskers */}
          <Path d="M 48 60 L 52 60 L 50 63 Z" fill="#C2185B" />
          <Path d="M 46 64 Q 50 68 54 64" stroke="#C2185B" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Whiskers */}
          <Path d="M 22 52 L 14 50" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          <Path d="M 22 56 L 14 58" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          <Path d="M 78 52 L 86 50" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          <Path d="M 78 56 L 86 58" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        </G>
      )}

      {/* 🐸 FROG (Ribbit) */}
      {species === 'frog' && (
        <G>
          {/* Eye Domes on top */}
          <Circle cx="32" cy="30" r="14" fill="#43A047" />
          <Circle cx="68" cy="30" r="14" fill="#43A047" />

          {/* Frog Face Base */}
          <Circle cx="50" cy="56" r="32" fill="#4CAF50" />

          {/* Big Cheerful Eyes */}
          <Circle cx="32" cy="30" r="9" fill="#FFFFFF" />
          <Circle cx="33" cy="29" r="5" fill="#1B5E20" />
          <Circle cx="35" cy="27" r="2" fill="#FFFFFF" />

          <Circle cx="68" cy="30" r="9" fill="#FFFFFF" />
          <Circle cx="67" cy="29" r="5" fill="#1B5E20" />
          <Circle cx="69" cy="27" r="2" fill="#FFFFFF" />

          {/* Rosy Cheeks */}
          <Circle cx="24" cy="58" r="5.5" fill="#FF80AB" opacity="0.6" />
          <Circle cx="76" cy="58" r="5.5" fill="#FF80AB" opacity="0.6" />

          {/* Wide Happy Frog Grin */}
          <Path d="M 32 60 Q 50 78 68 60" stroke="#1B5E20" strokeWidth="3" strokeLinecap="round" fill="none" />
        </G>
      )}

      {/* 🐻 BEAR (Barnaby) */}
      {species === 'bear' && (
        <G>
          {/* Fuzzy Round Ears */}
          <Circle cx="22" cy="30" r="12" fill="#FFA000" />
          <Circle cx="22" cy="30" r="7" fill="#FFE082" />
          <Circle cx="78" cy="30" r="12" fill="#FFA000" />
          <Circle cx="78" cy="30" r="7" fill="#FFE082" />

          {/* Bear Face Base */}
          <Circle cx="50" cy="54" r="32" fill="#FFB300" />

          {/* Snout Cream Patch */}
          <Ellipse cx="50" cy="62" rx="14" ry="10" fill="#FFF8E1" />

          {/* Eyes */}
          <Circle cx="36" cy="46" r="4.5" fill="#3E2723" />
          <Circle cx="38" cy="44" r="1.8" fill="#FFFFFF" />
          <Circle cx="64" cy="46" r="4.5" fill="#3E2723" />
          <Circle cx="66" cy="44" r="1.8" fill="#FFFFFF" />

          {/* Nose & Smile */}
          <Path d="M 46 58 Q 50 54 54 58 L 50 63 Z" fill="#3E2723" />
          <Path d="M 46 66 Q 50 70 54 66" stroke="#3E2723" strokeWidth="2" strokeLinecap="round" fill="none" />
        </G>
      )}

      {/* 🐬 OTTER (Pip) */}
      {species === 'otter' && (
        <G>
          {/* Small Round Ears */}
          <Circle cx="20" cy="38" r="8" fill="#0288D1" />
          <Circle cx="80" cy="38" r="8" fill="#0288D1" />

          {/* Otter Face Base */}
          <Circle cx="50" cy="54" r="32" fill="#03A9F4" />

          {/* Cream Muzzle */}
          <Ellipse cx="50" cy="64" rx="16" ry="10" fill="#E1F5FE" />

          {/* Eyes */}
          <Circle cx="36" cy="48" r="4.5" fill="#01579B" />
          <Circle cx="38" cy="46" r="1.8" fill="#FFFFFF" />
          <Circle cx="64" cy="48" r="4.5" fill="#01579B" />
          <Circle cx="66" cy="46" r="1.8" fill="#FFFFFF" />

          {/* Nose & Whiskers */}
          <Ellipse cx="50" cy="62" rx="4" ry="3" fill="#01579B" />
          <Circle cx="44" cy="66" r="1.2" fill="#0288D1" />
          <Circle cx="56" cy="66" r="1.2" fill="#0288D1" />
        </G>
      )}

      {/* PARTY POPPER SPECIAL OVERLAYS (Striped Candy) */}
      {isPopperH && (
        <G>
          <Rect x="12" y="32" width="76" height="5" rx="2.5" fill="#FFEB3B" opacity="0.9" />
          <Rect x="12" y="48" width="76" height="5" rx="2.5" fill="#FF4081" opacity="0.9" />
          <Rect x="12" y="64" width="76" height="5" rx="2.5" fill="#00E5FF" opacity="0.9" />
          <Circle cx="50" cy="50" r="42" stroke="#FFD700" strokeWidth="2.5" fill="none" opacity="0.8" />
        </G>
      )}

      {isPopperV && (
        <G>
          <Rect x="32" y="12" width="5" height="76" rx="2.5" fill="#FFEB3B" opacity="0.9" />
          <Rect x="48" y="12" width="5" height="76" rx="2.5" fill="#FF4081" opacity="0.9" />
          <Rect x="64" y="12" width="5" height="76" rx="2.5" fill="#00E5FF" opacity="0.9" />
          <Circle cx="50" cy="50" r="42" stroke="#FFD700" strokeWidth="2.5" fill="none" opacity="0.8" />
        </G>
      )}
    </Svg>
  );
};
