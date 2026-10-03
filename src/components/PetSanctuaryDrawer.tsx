import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Platform,
} from 'react-native';
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
} from 'react-native-svg';
import { PetHat, PetAccessory } from '../types/game';
import {
  PetSanctuaryState,
  TreatType,
  FloatingBubble,
  StickerBadge,
} from '../types/sanctuary';
import {
  TREATS_CATALOG,
  FRIENDSHIP_TIERS,
  STICKER_BADGES_LIST,
} from '../constants/sanctuary';
import { soundSynthesizer } from '../audio/SoundSynthesizer';

interface PetSanctuaryDrawerProps {
  visible: boolean;
  sanctuaryState: PetSanctuaryState;
  currentHat: PetHat;
  currentAccessory: PetAccessory;
  onClose: () => void;
  onFeedBarnaby: (treat: TreatType) => void;
  onPetBarnaby: () => void;
  onOpenWardrobe?: () => void;
}

const HEART_EMOJIS = ['❤️', '💖', '✨', '💕', '🌸', '⭐', '🍯'];

export const PetSanctuaryDrawer: React.FC<PetSanctuaryDrawerProps> = ({
  visible,
  sanctuaryState,
  currentHat,
  currentAccessory,
  onClose,
  onFeedBarnaby,
  onPetBarnaby,
  onOpenWardrobe,
}) => {
  const [activeTab, setActiveTab] = useState<'care' | 'roadmap' | 'stickers'>('care');
  const [floatingBubbles, setFloatingBubbles] = useState<FloatingBubble[]>([]);
  const [isMunching, setIsMunching] = useState(false);
  const [isTickled, setIsTickled] = useState(false);
  const [selectedTreat, setSelectedTreat] = useState<TreatType>('berries');
  const [munchFrame, setMunchFrame] = useState<0 | 1>(0);

  // Animations
  const wiggleAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const chewAnim = useRef(new Animated.Value(1)).current;
  const levelUpModalAnim = useRef(new Animated.Value(0)).current;

  // Level up trigger state
  const [showLevelUpCelebration, setShowLevelUpCelebration] = useState(false);
  const prevLevelRef = useRef(sanctuaryState.friendshipLevel);

  useEffect(() => {
    if (sanctuaryState.friendshipLevel > prevLevelRef.current) {
      setShowLevelUpCelebration(true);
      soundSynthesizer.playVictory();
      Animated.spring(levelUpModalAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
    prevLevelRef.current = sanctuaryState.friendshipLevel;
  }, [sanctuaryState.friendshipLevel, levelUpModalAnim]);

  // Pet / Tickle Barnaby with joyous reaction
  const handlePetPress = () => {
    setIsTickled(true);
    soundSynthesizer.playTickle();

    // Bounce and wiggle animation
    Animated.sequence([
      Animated.timing(wiggleAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(wiggleAnim, {
        toValue: -1,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(wiggleAnim, {
        toValue: 0.7,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(wiggleAnim, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.14,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Spawn 5 whimsical floating heart bubbles
    const newBubbles: FloatingBubble[] = Array.from({ length: 5 }, (_, i) => ({
      id: `${Date.now()}_${i}_${Math.random()}`,
      emoji: HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)],
      x: 60 + Math.random() * 120,
      y: 70 + Math.random() * 60,
      scale: 0.8 + Math.random() * 0.7,
      opacity: 1,
    }));

    setFloatingBubbles((prev) => [...prev.slice(-8), ...newBubbles]);

    onPetBarnaby();

    setTimeout(() => {
      setIsTickled(false);
    }, 1200);
  };

  // Feed Barnaby with munching animation
  const handleFeedPress = (treat: TreatType) => {
    const treatInfo = TREATS_CATALOG.find((t) => t.id === treat);
    if (!treatInfo) return;

    if ((sanctuaryState.treatsInventory[treat] || 0) < treatInfo.cost) {
      return;
    }

    setIsMunching(true);
    soundSynthesizer.playMunch();

    // Mouth chewing loop (open/close)
    setMunchFrame(1);
    const interval = setInterval(() => {
      setMunchFrame((f) => (f === 0 ? 1 : 0));
    }, 180);

    // Chomping scale pulsation
    Animated.sequence([
      Animated.timing(chewAnim, { toValue: 1.1, duration: 150, useNativeDriver: true }),
      Animated.timing(chewAnim, { toValue: 0.95, duration: 150, useNativeDriver: true }),
      Animated.timing(chewAnim, { toValue: 1.08, duration: 150, useNativeDriver: true }),
      Animated.timing(chewAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();

    // Food crumb / heart particles
    const foodBubbles: FloatingBubble[] = [
      { id: `${Date.now()}_f1`, emoji: treatInfo.emoji, x: 80, y: 110, scale: 1.2, opacity: 1 },
      { id: `${Date.now()}_f2`, emoji: '✨', x: 140, y: 80, scale: 1, opacity: 1 },
      { id: `${Date.now()}_f3`, emoji: '😋', x: 110, y: 60, scale: 1.1, opacity: 1 },
      { id: `${Date.now()}_f4`, emoji: '💖', x: 60, y: 70, scale: 0.9, opacity: 1 },
    ];
    setFloatingBubbles((prev) => [...prev.slice(-6), ...foodBubbles]);

    onFeedBarnaby(treat);

    setTimeout(() => {
      clearInterval(interval);
      setIsMunching(false);
      setMunchFrame(0);
    }, 1200);
  };

  // Clean up floating particles
  useEffect(() => {
    if (floatingBubbles.length > 0) {
      const timer = setTimeout(() => {
        setFloatingBubbles((prev) => prev.slice(2));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [floatingBubbles]);

  const spin = wiggleAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  // Calculate current tier info
  const currentTier =
    FRIENDSHIP_TIERS.find((t) => t.level === sanctuaryState.friendshipLevel) ||
    FRIENDSHIP_TIERS[0];
  const nextTier =
    FRIENDSHIP_TIERS.find((t) => t.level === sanctuaryState.friendshipLevel + 1) ||
    FRIENDSHIP_TIERS[FRIENDSHIP_TIERS.length - 1];

  const currentLevelBaseXp = currentTier.requiredXp;
  const nextLevelXp = sanctuaryState.friendshipNextXp;
  const xpInTier = Math.max(0, sanctuaryState.friendshipXp - currentLevelBaseXp);
  const xpNeededInTier = Math.max(1, nextLevelXp - currentLevelBaseXp);
  const progressPercent = Math.min(100, Math.round((xpInTier / xpNeededInTier) * 100));

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* TOP SANCTUARY HEADER */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerEmoji}>🏡</Text>
              <View>
                <Text style={styles.headerTitle}>Barnaby's Sanctuary</Text>
                <Text style={styles.headerSubtitle}>
                  Care, Feed & Grow Together! 🐾
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* TAB SELECTOR */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'care' && styles.tabItemActive]}
              onPress={() => setActiveTab('care')}
            >
              <Text style={[styles.tabText, activeTab === 'care' && styles.tabTextActive]}>
                💖 Care & Feed
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'roadmap' && styles.tabItemActive]}
              onPress={() => setActiveTab('roadmap')}
            >
              <Text style={[styles.tabText, activeTab === 'roadmap' && styles.tabTextActive]}>
                🌟 Friendship
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'stickers' && styles.tabItemActive]}
              onPress={() => setActiveTab('stickers')}
            >
              <Text style={[styles.tabText, activeTab === 'stickers' && styles.tabTextActive]}>
                🎨 Stickers
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* 1. CARE & FEEDING TAB */}
            {activeTab === 'care' && (
              <View style={styles.tabContent}>
                {/* BARNABY'S MEADOW PANORAMA */}
                <View style={styles.meadowBackdrop}>
                  {/* Floating heart/sparkle particles */}
                  {floatingBubbles.map((bubble) => (
                    <Animated.View
                      key={bubble.id}
                      style={[
                        styles.floatingBubble,
                        {
                          left: bubble.x,
                          top: bubble.y,
                          transform: [{ scale: bubble.scale }],
                        },
                      ]}
                    >
                      <Text style={styles.floatingBubbleText}>{bubble.emoji}</Text>
                    </Animated.View>
                  ))}

                  {/* Barnaby's Live Speech Reaction */}
                  <View style={styles.speechBubble}>
                    <Text style={styles.speechText}>
                      {isTickled
                        ? 'Hehehe! That tickles my tummy! 🐻💖'
                        : isMunching
                        ? 'MUNCH MUNCH CHOMP! Delicious! 🍓😋'
                        : sanctuaryState.lastReactionMessage}
                    </Text>
                    <View style={styles.speechPointer} />
                  </View>

                  {/* Interactive Barnaby Bear Avatar */}
                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={handlePetPress}
                    style={styles.petTouchTarget}
                  >
                    <Animated.View
                      style={{
                        transform: [
                          { rotate: spin },
                          { scale: isMunching ? chewAnim : scaleAnim },
                        ],
                      }}
                    >
                      <BarnabyInteractiveSvg
                        isTickled={isTickled}
                        isMunching={isMunching}
                        munchFrame={munchFrame}
                        hat={currentHat}
                        accessory={currentAccessory}
                      />
                    </Animated.View>
                  </TouchableOpacity>

                  {/* Quick Action Hint */}
                  <TouchableOpacity
                    style={styles.tickleActionPill}
                    onPress={handlePetPress}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.tickleActionText}>
                      👉 Tap or Tickle Barnaby! 🤗
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* HEARTWARMING FRIENDSHIP LEVEL BAR */}
                <View style={styles.friendshipCard}>
                  <View style={styles.friendshipTopRow}>
                    <View style={styles.friendshipBadge}>
                      <Text style={styles.friendshipBadgeIcon}>{currentTier.badgeEmoji}</Text>
                      <View>
                        <Text style={styles.friendshipLevelText}>
                          Level {sanctuaryState.friendshipLevel}: {currentTier.title}
                        </Text>
                        <Text style={styles.friendshipPerkText}>
                          {currentTier.perkDescription}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.xpPill}>
                      <Text style={styles.xpPillText}>
                        {sanctuaryState.friendshipXp} / {nextLevelXp} XP
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar with glowing heart */}
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                    <View
                      style={[
                        styles.progressHeartIcon,
                        { left: `${Math.min(92, Math.max(4, progressPercent - 4))}%` },
                      ]}
                    >
                      <Text style={{ fontSize: 13 }}>💖</Text>
                    </View>
                  </View>
                  <Text style={styles.nextPerkHint}>
                    Next: {nextTier.title} ({nextLevelXp - sanctuaryState.friendshipXp} XP needed)
                  </Text>
                </View>

                {/* HAPPINESS & FULLNESS STATS */}
                <View style={styles.vitalsRow}>
                  <View style={styles.vitalCard}>
                    <Text style={styles.vitalLabel}>💖 Happiness</Text>
                    <View style={styles.vitalTrack}>
                      <View
                        style={[
                          styles.vitalFill,
                          { width: `${sanctuaryState.happiness}%`, backgroundColor: '#FF4081' },
                        ]}
                      />
                    </View>
                    <Text style={styles.vitalValue}>{sanctuaryState.happiness}%</Text>
                  </View>

                  <View style={styles.vitalCard}>
                    <Text style={styles.vitalLabel}>🍓 Tummy Fullness</Text>
                    <View style={styles.vitalTrack}>
                      <View
                        style={[
                          styles.vitalFill,
                          { width: `${sanctuaryState.hunger}%`, backgroundColor: '#FFA000' },
                        ]}
                      />
                    </View>
                    <Text style={styles.vitalValue}>{sanctuaryState.hunger}%</Text>
                  </View>
                </View>

                {/* FEED BARNABY TREAT BASKET */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>🍓 Feed Barnaby Treats</Text>
                  <Text style={styles.sectionSubtitle}>
                    Earned from matching friends in the meadow!
                  </Text>
                </View>

                <View style={styles.treatsGrid}>
                  {TREATS_CATALOG.map((treat) => {
                    const inventoryCount = sanctuaryState.treatsInventory[treat.id] || 0;
                    const canAfford = inventoryCount >= treat.cost;
                    const isSelected = selectedTreat === treat.id;

                    return (
                      <TouchableOpacity
                        key={treat.id}
                        activeOpacity={0.8}
                        onPress={() => {
                          setSelectedTreat(treat.id);
                          if (canAfford) {
                            handleFeedPress(treat.id);
                          }
                        }}
                        style={[
                          styles.treatCard,
                          isSelected && styles.treatCardSelected,
                          !canAfford && styles.treatCardDisabled,
                        ]}
                      >
                        {treat.favoriteFlavor && (
                          <View style={styles.favBadge}>
                            <Text style={styles.favBadgeText}>FAVORITE! 🍯</Text>
                          </View>
                        )}
                        <Text style={styles.treatEmoji}>{treat.emoji}</Text>
                        <Text style={styles.treatName}>{treat.name}</Text>
                        <Text style={styles.treatInventory}>
                          {inventoryCount} in basket
                        </Text>
                        <View style={styles.treatCostRow}>
                          <Text style={[styles.treatCost, !canAfford && styles.treatCostNeeded]}>
                            Cost: {treat.cost} {treat.emoji}
                          </Text>
                          <Text style={styles.treatXp}>+{treat.xpGain} XP</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* DRESS UP SHORTCUT BUTTON */}
                {onOpenWardrobe && (
                  <TouchableOpacity
                    style={styles.wardrobeShortcut}
                    onPress={onOpenWardrobe}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.wardrobeShortcutText}>
                      👗 Change Barnaby's Hat & Outfits
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* 2. FRIENDSHIP ROADMAP TAB */}
            {activeTab === 'roadmap' && (
              <View style={styles.tabContent}>
                <View style={styles.roadmapHeader}>
                  <Text style={styles.roadmapHeading}>Sanctuary Friendship Path</Text>
                  <Text style={styles.roadmapSubheading}>
                    Play puzzles, feed treats, and care for Barnaby to unlock magical perks!
                  </Text>
                </View>

                {FRIENDSHIP_TIERS.map((tier) => {
                  const isCurrent = tier.level === sanctuaryState.friendshipLevel;
                  const isCompleted = tier.level < sanctuaryState.friendshipLevel;
                  const isLocked = tier.level > sanctuaryState.friendshipLevel;

                  return (
                    <View
                      key={tier.level}
                      style={[
                        styles.tierCard,
                        isCurrent && styles.tierCardCurrent,
                        isCompleted && styles.tierCardCompleted,
                        isLocked && styles.tierCardLocked,
                      ]}
                    >
                      <View style={styles.tierIconCircle}>
                        <Text style={styles.tierEmoji}>{tier.badgeEmoji}</Text>
                      </View>
                      <View style={styles.tierInfo}>
                        <View style={styles.tierTitleRow}>
                          <Text style={styles.tierTitle}>
                            Level {tier.level}: {tier.title}
                          </Text>
                          {isCompleted && <Text style={styles.tierStatusDone}>✓ Achieved</Text>}
                          {isCurrent && <Text style={styles.tierStatusCurrent}>🌟 Current</Text>}
                          {isLocked && <Text style={styles.tierStatusLocked}>🔒 {tier.requiredXp} XP</Text>}
                        </View>
                        <Text style={styles.tierPerk}>{tier.perkDescription}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* 3. STICKER BOOK TAB */}
            {activeTab === 'stickers' && (
              <View style={styles.tabContent}>
                <View style={styles.stickersHeader}>
                  <Text style={styles.stickersHeading}>Barnaby's Sticker Badges</Text>
                  <Text style={styles.stickersSubheading}>
                    Collect commemorative stickers by loving and feeding your companion!
                  </Text>
                </View>

                <View style={styles.stickersGrid}>
                  {STICKER_BADGES_LIST.map((badge) => {
                    const isUnlocked = sanctuaryState.unlockedStickers.includes(badge.id);

                    return (
                      <View
                        key={badge.id}
                        style={[
                          styles.stickerCard,
                          isUnlocked ? styles.stickerCardUnlocked : styles.stickerCardLocked,
                        ]}
                      >
                        <View style={styles.stickerEmojiWrapper}>
                          <Text style={[styles.stickerEmoji, !isUnlocked && styles.stickerEmojiLocked]}>
                            {badge.emoji}
                          </Text>
                          {!isUnlocked && (
                            <View style={styles.stickerLockBadge}>
                              <Text style={{ fontSize: 10 }}>🔒</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.stickerName}>{badge.name}</Text>
                        <Text style={styles.stickerDescription}>{badge.description}</Text>
                        <Text
                          style={[
                            styles.stickerStatus,
                            isUnlocked ? styles.stickerStatusUnlocked : styles.stickerStatusLockedText,
                          ]}
                        >
                          {isUnlocked ? 'Unlocked! ⭐' : 'In Progress'}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>

          {/* LEVEL UP CELEBRATION MODAL */}
          {showLevelUpCelebration && (
            <View style={styles.celebrationOverlay}>
              <Animated.View
                style={[
                  styles.celebrationCard,
                  {
                    transform: [{ scale: levelUpModalAnim }],
                  },
                ]}
              >
                <Text style={styles.celebrationTrophy}>🏆🎉</Text>
                <Text style={styles.celebrationTitle}>FRIENDSHIP LEVEL UP!</Text>
                <Text style={styles.celebrationSubtitle}>
                  You and Barnaby reached Level {sanctuaryState.friendshipLevel}!
                </Text>
                <Text style={styles.celebrationRank}>
                  "{currentTier.badgeEmoji} {currentTier.title}"
                </Text>
                <Text style={styles.celebrationPerk}>
                  🌟 New Perk: {currentTier.perkDescription}
                </Text>
                <TouchableOpacity
                  style={styles.celebrationButton}
                  onPress={() => setShowLevelUpCelebration(false)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.celebrationButtonText}>Hooray! Best Friends! 💖</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

// ==========================================
// INTERACTIVE BARNABY THE BEAR CUB SVG COMPONENT
// ==========================================
interface BarnabySvgProps {
  isTickled: boolean;
  isMunching: boolean;
  munchFrame: 0 | 1;
  hat: PetHat;
  accessory: PetAccessory;
}

const BarnabyInteractiveSvg: React.FC<BarnabySvgProps> = ({
  isTickled,
  isMunching,
  munchFrame,
  hat,
  accessory,
}) => {
  return (
    <Svg width={180} height={180} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id="bearBodyGrad" cx="35%" cy="30%" r="65%">
          <Stop offset="0%" stopColor="#FFE082" />
          <Stop offset="50%" stopColor="#FFA000" />
          <Stop offset="100%" stopColor="#E65100" />
        </RadialGradient>
        <RadialGradient id="snoutGrad" cx="50%" cy="40%" r="60%">
          <Stop offset="0%" stopColor="#FFFDE7" />
          <Stop offset="100%" stopColor="#FFF9C4" />
        </RadialGradient>
        <RadialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FF4081" />
          <Stop offset="100%" stopColor="#FF80AB" />
        </RadialGradient>
      </Defs>

      {/* HERO CAPE (Behind body) */}
      {accessory === 'cape' && (
        <Path
          d="M 24 64 Q 6 96 16 100 Q 50 88 84 100 Q 94 96 76 64 Z"
          fill="#E91E63"
        />
      )}

      {/* Fuzzy Bear Ears */}
      <Circle cx="22" cy="24" r="15" fill="#FFA000" />
      <Circle cx="22" cy="24" r="9" fill="#FFE082" />
      <Circle cx="78" cy="24" r="15" fill="#FFA000" />
      <Circle cx="78" cy="24" r="9" fill="#FFE082" />

      {/* Bear Head */}
      <Circle cx="50" cy="54" r="36" fill="url(#bearBodyGrad)" />

      {/* Bear Body / Shoulders */}
      <Path
        d="M 22 84 Q 50 78 78 84 L 84 100 L 16 100 Z"
        fill="#FF8F00"
      />

      {/* Snout */}
      <Ellipse cx="50" cy="65" rx="18" ry="14" fill="url(#snoutGrad)" />

      {/* Rosy Cheeks (blush brighter when tickled or munching) */}
      <Circle
        cx="24"
        cy="63"
        r={isTickled ? 8 : 6.5}
        fill="url(#blushGrad)"
        opacity={isTickled ? 0.9 : 0.65}
      />
      <Circle
        cx="76"
        cy="63"
        r={isTickled ? 8 : 6.5}
        fill="url(#blushGrad)"
        opacity={isTickled ? 0.9 : 0.65}
      />

      {/* Nose */}
      <Path d="M 44 60 Q 50 56 56 60 L 50 66 Z" fill="#3E2723" />

      {/* MOUTH & ANIMATIONS */}
      {isMunching ? (
        // Munching / Chewing chomp mouth
        munchFrame === 1 ? (
          // Mouth Open Chomping
          <G>
            <Ellipse cx="50" cy="72" rx="9" ry="6" fill="#3E2723" />
            <Path d="M 45 74 Q 50 78 55 74" fill="#FF4081" />
          </G>
        ) : (
          // Mouth Closed Yummy Smile with licking tongue
          <G>
            <Path
              d="M 42 70 Q 50 77 58 70"
              stroke="#3E2723"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <Circle cx="54" cy="71" r="3" fill="#FF80AB" />
          </G>
        )
      ) : isTickled ? (
        // Giggling Wide Laughing Mouth
        <G>
          <Path
            d="M 40 68 Q 50 82 60 68 Z"
            fill="#3E2723"
          />
          <Path
            d="M 45 75 Q 50 81 55 75 Z"
            fill="#FF4081"
          />
        </G>
      ) : (
        // Normal Sweet Smile
        <Path
          d="M 43 69 Q 50 75 57 69"
          stroke="#3E2723"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      )}

      {/* EYES */}
      {accessory === 'sunglasses' ? (
        // Star Shades
        <G>
          <Rect x="23" y="44" width="24" height="15" rx="6" fill="#212121" />
          <Rect x="53" y="44" width="24" height="15" rx="6" fill="#212121" />
          <Rect x="46" y="49" width="8" height="3" fill="#212121" />
          <Circle cx="29" cy="48" r="2.5" fill="#FFD700" />
          <Circle cx="59" cy="48" r="2.5" fill="#FFD700" />
        </G>
      ) : isTickled || (isMunching && munchFrame === 0) ? (
        // Giggling / blissful crescent happy eyes (^ ^)
        <G>
          <Path
            d="M 31 51 Q 38 41 45 51"
            stroke="#3E2723"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M 55 51 Q 62 41 69 51"
            stroke="#3E2723"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
        </G>
      ) : (
        // Sweet Shiny Big Eyes
        <G>
          <Circle cx="36" cy="49" r="6" fill="#3E2723" />
          <Circle cx="38" cy="47" r="2.4" fill="#FFFFFF" />
          <Circle cx="35" cy="51" r="1.2" fill="#FFFFFF" />

          <Circle cx="64" cy="49" r="6" fill="#3E2723" />
          <Circle cx="66" cy="47" r="2.4" fill="#FFFFFF" />
          <Circle cx="63" cy="51" r="1.2" fill="#FFFFFF" />
        </G>
      )}

      {/* SILK BOW ACCESSORY */}
      {accessory === 'bow' && (
        <G>
          <Path d="M 36 84 L 50 89 L 36 94 Z" fill="#E91E63" />
          <Path d="M 64 84 L 50 89 L 64 94 Z" fill="#E91E63" />
          <Circle cx="50" cy="89" r="4.5" fill="#FFD700" />
        </G>
      )}

      {/* HATS */}
      {/* 1. Wizard Hat */}
      {hat === 'wizard' && (
        <G>
          <Path d="M 24 24 L 50 -2 L 76 24 Z" fill="#7C4DFF" />
          <Ellipse cx="50" cy="24" rx="32" ry="7" fill="#512DA8" />
          <Circle cx="50" cy="12" r="3.5" fill="#FFD700" />
        </G>
      )}

      {/* 2. Royal Crown */}
      {hat === 'crown' && (
        <G>
          <Path
            d="M 28 26 L 31 10 L 41 17 L 50 6 L 59 17 L 69 10 L 72 26 Z"
            fill="#FFD700"
            stroke="#FFA000"
            strokeWidth="2"
          />
          <Circle cx="31" cy="9" r="3" fill="#E91E63" />
          <Circle cx="50" cy="5" r="3.5" fill="#00E5FF" />
          <Circle cx="69" cy="9" r="3" fill="#E91E63" />
        </G>
      )}

      {/* 3. Flower Crown */}
      {hat === 'flower' && (
        <G>
          <Circle cx="32" cy="20" r="6" fill="#FF4081" />
          <Circle cx="50" cy="16" r="7" fill="#FFEB3B" />
          <Circle cx="68" cy="20" r="6" fill="#00E5FF" />
          <Circle cx="41" cy="18" r="5" fill="#FFFFFF" />
          <Circle cx="59" cy="18" r="5" fill="#FFFFFF" />
        </G>
      )}

      {/* 4. Baker Chef Hat */}
      {hat === 'chef' && (
        <G>
          <Path d="M 30 22 C 20 6 40 0 50 5 C 60 0 80 6 70 22 Z" fill="#FFFFFF" />
          <Rect x="28" y="20" width="44" height="7" rx="3.5" fill="#E0E0E0" />
        </G>
      )}

      {/* 5. Pirate Hat */}
      {hat === 'pirate' && (
        <G>
          <Path d="M 20 25 Q 50 14 80 25 L 70 9 Q 50 14 30 9 Z" fill="#212121" />
          <Circle cx="50" cy="16" r="3.5" fill="#FFFFFF" />
        </G>
      )}
    </Svg>
  );
};

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 6, 28, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  container: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '92%',
    backgroundColor: '#270F47',
    borderRadius: 26,
    borderWidth: 3.5,
    borderColor: '#FFD700',
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#35165E',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 215, 0, 0.3)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerEmoji: {
    fontSize: 26,
  },
  headerTitle: {
    color: '#FFD700',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: '#DCBAFF',
    fontSize: 11,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1E0935',
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 6,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabItemActive: {
    backgroundColor: '#7C4DFF',
    borderWidth: 1.5,
    borderColor: '#FFE082',
  },
  tabText: {
    color: '#B39DDB',
    fontSize: 12,
    fontWeight: '800',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tabContent: {
    paddingBottom: 24,
  },
  meadowBackdrop: {
    backgroundColor: '#3F1A6E',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#7337B8',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  floatingBubble: {
    position: 'absolute',
    zIndex: 20,
  },
  floatingBubbleText: {
    fontSize: 24,
  },
  speechBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 6,
    maxWidth: '92%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    position: 'relative',
  },
  speechText: {
    color: '#35165E',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  speechPointer: {
    position: 'absolute',
    bottom: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderLeftColor: 'transparent',
    borderRightWidth: 6,
    borderRightColor: 'transparent',
    borderTopWidth: 6,
    borderTopColor: '#FFFFFF',
  },
  petTouchTarget: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickleActionPill: {
    backgroundColor: '#FF6F00',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 4,
    borderWidth: 1.5,
    borderColor: '#FFE082',
  },
  tickleActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  friendshipCard: {
    backgroundColor: '#35165E',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#7337B8',
    padding: 12,
    marginTop: 10,
  },
  friendshipTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  friendshipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  friendshipBadgeIcon: {
    fontSize: 24,
  },
  friendshipLevelText: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '900',
  },
  friendshipPerkText: {
    color: '#DCBAFF',
    fontSize: 10,
    fontWeight: '600',
  },
  xpPill: {
    backgroundColor: '#1E0935',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#9575CD',
  },
  xpPillText: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: '800',
  },
  progressTrack: {
    height: 12,
    backgroundColor: '#1E0935',
    borderRadius: 6,
    position: 'relative',
    overflow: 'visible',
    marginVertical: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00E676',
    borderRadius: 6,
  },
  progressHeartIcon: {
    position: 'absolute',
    top: -5,
  },
  nextPerkHint: {
    color: '#B39DDB',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'right',
  },
  vitalsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  vitalCard: {
    flex: 1,
    backgroundColor: '#35165E',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#7337B8',
    padding: 8,
    alignItems: 'center',
  },
  vitalLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  vitalTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#1E0935',
    borderRadius: 4,
    overflow: 'hidden',
  },
  vitalFill: {
    height: '100%',
    borderRadius: 4,
  },
  vitalValue: {
    color: '#DCBAFF',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 3,
  },
  sectionHeader: {
    marginTop: 14,
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#FFD700',
    fontSize: 15,
    fontWeight: '900',
  },
  sectionSubtitle: {
    color: '#DCBAFF',
    fontSize: 11,
    fontWeight: '600',
  },
  treatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  treatCard: {
    width: '48.5%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    alignItems: 'center',
    position: 'relative',
  },
  treatCardSelected: {
    borderColor: '#00E676',
    backgroundColor: 'rgba(0, 230, 118, 0.16)',
  },
  treatCardDisabled: {
    opacity: 0.55,
  },
  favBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFA000',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  favBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  treatEmoji: {
    fontSize: 32,
    marginVertical: 2,
  },
  treatName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  treatInventory: {
    color: '#DCBAFF',
    fontSize: 10,
    fontWeight: '700',
    marginVertical: 2,
  },
  treatCostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 4,
    marginTop: 4,
  },
  treatCost: {
    color: '#81C784',
    fontSize: 10,
    fontWeight: '800',
  },
  treatCostNeeded: {
    color: '#FF8A80',
  },
  treatXp: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '900',
  },
  wardrobeShortcut: {
    backgroundColor: '#7C4DFF',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  wardrobeShortcutText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  roadmapHeader: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  roadmapHeading: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '900',
  },
  roadmapSubheading: {
    color: '#DCBAFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tierCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 10,
    marginBottom: 8,
    alignItems: 'center',
    gap: 12,
  },
  tierCardCurrent: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.14)',
  },
  tierCardCompleted: {
    borderColor: '#00E676',
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
  },
  tierCardLocked: {
    opacity: 0.5,
  },
  tierIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#35165E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFD700',
  },
  tierEmoji: {
    fontSize: 22,
  },
  tierInfo: {
    flex: 1,
  },
  tierTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  tierTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  tierStatusDone: {
    color: '#00E676',
    fontSize: 10,
    fontWeight: '900',
  },
  tierStatusCurrent: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '900',
  },
  tierStatusLocked: {
    color: '#B39DDB',
    fontSize: 10,
    fontWeight: '700',
  },
  tierPerk: {
    color: '#DCBAFF',
    fontSize: 11,
    fontWeight: '600',
  },
  stickersHeader: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  stickersHeading: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '900',
  },
  stickersSubheading: {
    color: '#DCBAFF',
    fontSize: 12,
    fontWeight: '600',
  },
  stickersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  stickerCard: {
    width: '48.5%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    borderWidth: 2,
    padding: 10,
    alignItems: 'center',
  },
  stickerCardUnlocked: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
  },
  stickerCardLocked: {
    borderColor: 'rgba(255, 255, 255, 0.12)',
    opacity: 0.55,
  },
  stickerEmojiWrapper: {
    position: 'relative',
    marginBottom: 4,
  },
  stickerEmoji: {
    fontSize: 34,
  },
  stickerEmojiLocked: {
    opacity: 0.4,
  },
  stickerLockBadge: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    backgroundColor: '#35165E',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  stickerName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  stickerDescription: {
    color: '#DCBAFF',
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 4,
    lineHeight: 12,
  },
  stickerStatus: {
    fontSize: 10,
    fontWeight: '900',
    marginTop: 2,
  },
  stickerStatusUnlocked: {
    color: '#00E676',
  },
  stickerStatusLockedText: {
    color: '#B39DDB',
  },
  celebrationOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(20, 8, 38, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 100,
  },
  celebrationCard: {
    backgroundColor: '#35165E',
    borderRadius: 24,
    borderWidth: 3.5,
    borderColor: '#FFD700',
    padding: 22,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    shadowColor: '#FFD700',
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  celebrationTrophy: {
    fontSize: 48,
    marginBottom: 6,
  },
  celebrationTitle: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  celebrationSubtitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  celebrationRank: {
    color: '#00E676',
    fontSize: 16,
    fontWeight: '900',
    marginVertical: 8,
  },
  celebrationPerk: {
    color: '#DCBAFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  celebrationButton: {
    backgroundColor: '#00E676',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  celebrationButtonText: {
    color: '#1B5E20',
    fontSize: 15,
    fontWeight: '900',
  },
});
