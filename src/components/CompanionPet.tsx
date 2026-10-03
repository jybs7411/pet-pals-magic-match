import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
import { PetHat, PetAccessory, PetSanctuaryState } from '../types/game';

interface CompanionPetProps {
  message: string;
  isCelebrating?: boolean;
  hat: PetHat;
  accessory: PetAccessory;
  onOpenWardrobe: () => void;
  starsCount: number;
  onTickle?: () => void;
  sanctuaryState?: PetSanctuaryState;
  onOpenSanctuary?: () => void;
}

export const CompanionPet: React.FC<CompanionPetProps> = ({
  message,
  isCelebrating = false,
  hat,
  accessory,
  onOpenWardrobe,
  starsCount,
  onTickle,
  sanctuaryState,
  onOpenSanctuary,
}) => {
  return (
    <View style={styles.container}>
      {/* Pet Avatar with Customizable Outfit */}
      <View style={styles.avatarWrapper}>
        <TouchableOpacity
          style={styles.avatarBubble}
          onPress={onTickle}
          activeOpacity={0.8}
          accessibilityLabel="Tickle Barnaby the Bear"
        >
          <Svg width={72} height={72} viewBox="0 0 100 100">
            <Defs>
              <RadialGradient id="bearBody" cx="35%" cy="30%" r="65%">
                <Stop offset="0%" stopColor="#FFE082" />
                <Stop offset="50%" stopColor="#FFA000" />
                <Stop offset="100%" stopColor="#E65100" />
              </RadialGradient>
              <RadialGradient id="snoutGrad" cx="50%" cy="40%" r="60%">
                <Stop offset="0%" stopColor="#FFFDE7" />
                <Stop offset="100%" stopColor="#FFF9C4" />
              </RadialGradient>
            </Defs>

            {/* HERO CAPE (Behind body) */}
            {accessory === 'cape' && (
              <Path
                d="M 28 65 Q 12 94 20 98 Q 50 88 80 98 Q 88 94 72 65 Z"
                fill="#E91E63"
              />
            )}

            {/* Fuzzy Bear Ears */}
            <Circle cx="24" cy="28" r="14" fill="#FFA000" />
            <Circle cx="24" cy="28" r="8" fill="#FFE082" />
            <Circle cx="76" cy="28" r="14" fill="#FFA000" />
            <Circle cx="76" cy="28" r="8" fill="#FFE082" />

            {/* Bear Head */}
            <Circle cx="50" cy="54" r="34" fill="url(#bearBody)" />

            {/* Snout */}
            <Ellipse cx="50" cy="64" rx="16" ry="12" fill="url(#snoutGrad)" />

            {/* Rosy Cheeks */}
            <Circle cx="26" cy="62" r="6" fill="#FF80AB" opacity="0.65" />
            <Circle cx="74" cy="62" r="6" fill="#FF80AB" opacity="0.65" />

            {/* Nose & Smile */}
            <Path d="M 45 59 Q 50 55 55 59 L 50 64 Z" fill="#3E2723" />
            <Path
              d="M 45 68 Q 50 73 55 68"
              stroke="#3E2723"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* Eyes (Celebrating = Star/Happy eyes, Normal = big shiny eyes) */}
            {accessory === 'sunglasses' ? (
              // Cool Star Shades
              <G>
                <Rect x="25" y="44" width="22" height="13" rx="5" fill="#212121" />
                <Rect x="53" y="44" width="22" height="13" rx="5" fill="#212121" />
                <Rect x="46" y="48" width="8" height="3" fill="#212121" />
                <Circle cx="30" cy="48" r="2" fill="#FFD700" />
                <Circle cx="58" cy="48" r="2" fill="#FFD700" />
              </G>
            ) : isCelebrating ? (
              // Star Happy Eyes
              <G>
                <Path d="M 33 50 Q 38 42 43 50" stroke="#3E2723" strokeWidth="4" strokeLinecap="round" fill="none" />
                <Path d="M 57 50 Q 62 42 67 50" stroke="#3E2723" strokeWidth="4" strokeLinecap="round" fill="none" />
              </G>
            ) : (
              // Sweet Big Shiny Eyes
              <G>
                <Circle cx="37" cy="48" r="5.5" fill="#3E2723" />
                <Circle cx="39" cy="46" r="2.2" fill="#FFFFFF" />
                <Circle cx="63" cy="48" r="5.5" fill="#3E2723" />
                <Circle cx="65" cy="46" r="2.2" fill="#FFFFFF" />
              </G>
            )}

            {/* SILK BOW ACCESSORY */}
            {accessory === 'bow' && (
              <G>
                <Path d="M 38 82 L 50 86 L 38 90 Z" fill="#E91E63" />
                <Path d="M 62 82 L 50 86 L 62 90 Z" fill="#E91E63" />
                <Circle cx="50" cy="86" r="4" fill="#FFD700" />
              </G>
            )}

            {/* HATS */}
            {/* 1. Wizard Hat */}
            {hat === 'wizard' && (
              <G>
                <Path d="M 28 26 L 50 2 L 72 26 Z" fill="#7C4DFF" />
                <Ellipse cx="50" cy="26" rx="28" ry="6" fill="#512DA8" />
                <Circle cx="50" cy="14" r="3" fill="#FFD700" />
              </G>
            )}

            {/* 2. Royal Crown */}
            {hat === 'crown' && (
              <G>
                <Path d="M 30 26 L 32 12 L 42 18 L 50 8 L 58 18 L 68 12 L 70 26 Z" fill="#FFD700" stroke="#FFA000" strokeWidth="1.5" />
                <Circle cx="32" cy="11" r="2.5" fill="#E91E63" />
                <Circle cx="50" cy="7" r="3" fill="#00E5FF" />
                <Circle cx="68" cy="11" r="2.5" fill="#E91E63" />
              </G>
            )}

            {/* 3. Daisy Flower Crown */}
            {hat === 'flower' && (
              <G>
                <Circle cx="34" cy="22" r="5" fill="#FF4081" />
                <Circle cx="50" cy="18" r="6" fill="#FFEB3B" />
                <Circle cx="66" cy="22" r="5" fill="#00E5FF" />
                <Circle cx="42" cy="20" r="4" fill="#FFFFFF" />
                <Circle cx="58" cy="20" r="4" fill="#FFFFFF" />
              </G>
            )}

            {/* 4. Baker Chef Hat */}
            {hat === 'chef' && (
              <G>
                <Path d="M 32 24 C 24 10 40 4 50 8 C 60 4 76 10 68 24 Z" fill="#FFFFFF" />
                <Rect x="30" y="22" width="40" height="6" rx="3" fill="#E0E0E0" />
              </G>
            )}

            {/* 5. Pirate Tricorn */}
            {hat === 'pirate' && (
              <G>
                <Path d="M 22 26 Q 50 16 78 26 L 68 12 Q 50 16 32 12 Z" fill="#212121" />
                <Circle cx="50" cy="18" r="3" fill="#FFFFFF" />
              </G>
            )}
          </Svg>
        </TouchableOpacity>

        {/* Dress-up Button Tag */}
        {/* Action Buttons: Dress Up & Sanctuary */}
        <View style={styles.actionButtonsCol}>
          {onOpenSanctuary && (
            <TouchableOpacity
              style={styles.sanctuaryButton}
              onPress={onOpenSanctuary}
              activeOpacity={0.8}
            >
              <Text style={styles.sanctuaryButtonText}>🏡 Care & Feed</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.wardrobeButton}
            onPress={onOpenWardrobe}
            activeOpacity={0.8}
          >
            <Text style={styles.wardrobeButtonText}>👗 Dress Up</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Speech Bubble */}
      <View style={styles.bubble}>
        <View style={styles.bubbleArrow} />
        <View style={styles.bubbleHeader}>
          <TouchableOpacity
            onPress={onOpenSanctuary || onTickle}
            activeOpacity={0.7}
            style={styles.nameLevelWrapper}
          >
            <Text style={styles.petName}>
              Barnaby 🐻{' '}
              <Text style={styles.petLevelTag}>
                Lv.{sanctuaryState?.friendshipLevel || 1}
              </Text>
            </Text>
          </TouchableOpacity>

          <View style={styles.headerBadges}>
            {sanctuaryState && (
              <TouchableOpacity
                onPress={onOpenSanctuary}
                style={styles.treatsPill}
                activeOpacity={0.7}
              >
                <Text style={styles.treatsPillText}>
                  🍓 {sanctuaryState.treatsInventory.berries}{' '}
                  🍯 {sanctuaryState.treatsInventory.honey}
                </Text>
              </TouchableOpacity>
            )}
            <Text style={styles.starsCount}>⭐ {starsCount}</Text>
          </View>
        </View>
        <Text style={styles.messageText}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginVertical: 4,
    width: '100%',
    maxWidth: 420,
  },
  avatarWrapper: {
    alignItems: 'center',
  },
  avatarBubble: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFA000',
    shadowColor: '#5D4037',
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
  },
  wardrobeButton: {
    backgroundColor: '#8D5B28',
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginTop: -8,
    borderWidth: 1.5,
    borderColor: '#FFE082',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  wardrobeButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  bubble: {
    flex: 1,
    marginLeft: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    position: 'relative',
    shadowColor: '#5D4037',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#FFE082',
  },
  bubbleArrow: {
    position: 'absolute',
    left: -8,
    top: 24,
    width: 0,
    height: 0,
    borderTopWidth: 7,
    borderTopColor: 'transparent',
    borderBottomWidth: 7,
    borderBottomColor: 'transparent',
    borderRightWidth: 9,
    borderRightColor: '#FFFFFF',
  },
  bubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameLevelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petName: {
    color: '#D84315',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  petLevelTag: {
    color: '#7B1FA2',
    fontSize: 11,
    fontWeight: '800',
  },
  headerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  treatsPill: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  treatsPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E65100',
  },
  starsCount: {
    color: '#F57F17',
    fontSize: 12,
    fontWeight: '900',
  },
  actionButtonsCol: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    marginTop: -8,
  },
  sanctuaryButton: {
    backgroundColor: '#FF6F00',
    borderRadius: 12,
    paddingVertical: 2.5,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: '#FFE082',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  sanctuaryButtonText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  messageText: {
    color: '#2E1C0C',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
});
