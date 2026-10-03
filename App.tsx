import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Board } from './src/components/Board';
import { ScoreHUD } from './src/components/ScoreHUD';
import { GameOverModal } from './src/components/GameOverModal';
import { CompanionPet } from './src/components/CompanionPet';
import { DressUpModal } from './src/components/DressUpModal';
import { PetSanctuaryDrawer } from './src/components/PetSanctuaryDrawer';
import { useMatch3Game } from './src/hooks/useMatch3Game';
import { StorybookMeadow, CarvedWoodFrame } from './src/components/StorybookMeadow';
import { useSound } from './src/audio/SoundSynthesizer';
import { HangingCanopyHeader } from './src/components/HangingCanopyHeader';
import { useReducedMotion } from './src/hooks/useReducedMotion';
import { usePlayBreakReminder } from './src/hooks/usePlayBreakReminder';

export default function App() {
  const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);
  const { isMuted, toggleMute } = useSound();
  const reduceMotion = useReducedMotion();
  const { shouldRemind, dismiss: dismissBreak } = usePlayBreakReminder();

  const {
    board,
    selectedPos,
    matchedPosKeys,
    hintPositions,
    moves,
    score,
    level,
    targetScore,
    starThresholds,
    bestScore,
    victoryInfo,
    combo,
    gameStatus,
    praiseMessage,
    mascotMessage,
    isCelebrating,
    starsCount,
    currentHat,
    currentAccessory,
    setCurrentHat,
    setCurrentAccessory,
    sanctuaryState,
    isSanctuaryOpen,
    setIsSanctuaryOpen,
    feedBarnaby,
    petBarnaby,
    handleTilePress,
    handleSwipe,
    restartGame,
    nextLevel,
  } = useMatch3Game();

  const isGameOver = gameStatus === 'game_over';
  const isVictory = gameStatus === 'victory';

  return (
    <StorybookMeadow>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#4BB8F5" />
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Hanging Canopy Carved Wooden Signboard Header */}
            <HangingCanopyHeader
              isMuted={isMuted}
              onToggleMute={toggleMute}
              onRestart={restartGame}
            />

            {/* Score & Moves HUD */}
            <ScoreHUD
              score={score}
              moves={moves}
              combo={combo}
              praiseMessage={praiseMessage}
              level={level}
              targetScore={targetScore}
              starThresholds={starThresholds}
            />

            {/* Interactive Companion Pet (Barnaby the Bear Cub) */}
            <CompanionPet
              message={mascotMessage}
              isCelebrating={isCelebrating}
              hat={currentHat}
              accessory={currentAccessory}
              onOpenWardrobe={() => setIsWardrobeOpen(true)}
              starsCount={starsCount}
              onTickle={petBarnaby}
              sanctuaryState={sanctuaryState}
              onOpenSanctuary={() => setIsSanctuaryOpen(true)}
            />

            {/* Quick Sanctuary Care & Petting Hub Banner */}
            <TouchableOpacity
              style={styles.sanctuaryBanner}
              onPress={() => setIsSanctuaryOpen(true)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={`Open Barnaby's Sanctuary, friendship level ${sanctuaryState.friendshipLevel}`}
            >
              <View style={styles.sanctuaryBannerLeft}>
                <Text style={styles.sanctuaryBannerIcon}>🏡</Text>
                <View>
                  <Text style={styles.sanctuaryBannerTitle}>
                    Barnaby's Sanctuary{' '}
                    <Text style={styles.sanctuaryLevelBadge}>
                      Lv.{sanctuaryState.friendshipLevel} Pal
                    </Text>
                  </Text>
                  <Text style={styles.sanctuaryBannerSubtitle}>
                    Feed treats & tickle Barnaby! 💖
                  </Text>
                </View>
              </View>
              <View style={styles.sanctuaryBasketPill}>
                <Text style={styles.sanctuaryBasketText}>
                  🍓 {sanctuaryState.treatsInventory.berries} 🍯 {sanctuaryState.treatsInventory.honey}
                </Text>
                <Text style={styles.sanctuaryArrow}>›</Text>
              </View>
            </TouchableOpacity>

            {/* The Match-3 Animal Friends Board in Carved Wooden Frame */}
            <View style={styles.boardContainer}>
              <CarvedWoodFrame title="PET PALS GLADE">
                <Board
                  board={board}
                  selectedPos={selectedPos}
                  matchedPosKeys={matchedPosKeys}
                  hintPositions={hintPositions}
                  onTilePress={handleTilePress}
                  onSwipe={handleSwipe}
                  disabled={gameStatus !== 'idle'}
                  combo={combo}
                  reduceMotion={reduceMotion}
                />
              </CarvedWoodFrame>
            </View>

            {/* Storybook Magic Power Tokens Showcase */}
            <View style={styles.legendContainer}>
              <Text style={styles.legendTitle}>✨ STORYBOOK MAGIC POWER TOKENS</Text>
              <View style={styles.legendGrid}>
                <View style={styles.legendPill}>
                  <Text style={styles.legendPillEmoji}>🎊</Text>
                  <Text style={styles.legendPillText}>Confetti Popper</Text>
                </View>
                <View style={styles.legendPill}>
                  <Text style={styles.legendPillEmoji}>🍯</Text>
                  <Text style={styles.legendPillText}>Honey Pot 3x3</Text>
                </View>
                <View style={styles.legendPill}>
                  <Text style={styles.legendPillEmoji}>🐝</Text>
                  <Text style={styles.legendPillText}>Bee Copter</Text>
                </View>
                <View style={styles.legendPill}>
                  <Text style={styles.legendPillEmoji}>⭐</Text>
                  <Text style={styles.legendPillText}>Star Wand</Text>
                </View>
                <View style={styles.legendPill}>
                  <Text style={styles.legendPillEmoji}>👑</Text>
                  <Text style={styles.legendPillText}>Royal Crown</Text>
                </View>
                <View style={styles.legendPill}>
                  <Text style={styles.legendPillEmoji}>🌈</Text>
                  <Text style={styles.legendPillText}>Rainbow Butterfly</Text>
                </View>
              </View>
            </View>

            {/* Pet Dress-Up Wardrobe Modal */}
            <DressUpModal
              visible={isWardrobeOpen}
              currentHat={currentHat}
              currentAccessory={currentAccessory}
              starsCount={starsCount}
              onSelectHat={setCurrentHat}
              onSelectAccessory={setCurrentAccessory}
              onClose={() => setIsWardrobeOpen(false)}
            />

            {/* Pet Sanctuary Care & Petting Hub Drawer */}
            <PetSanctuaryDrawer
              visible={isSanctuaryOpen}
              sanctuaryState={sanctuaryState}
              currentHat={currentHat}
              currentAccessory={currentAccessory}
              onClose={() => setIsSanctuaryOpen(false)}
              onFeedBarnaby={feedBarnaby}
              onPetBarnaby={petBarnaby}
              onOpenWardrobe={() => {
                setIsSanctuaryOpen(false);
                setIsWardrobeOpen(true);
              }}
            />

            {/* Game Over / Victory Modal */}
            <GameOverModal
              visible={isGameOver || isVictory}
              isVictory={isVictory}
              score={score}
              level={level}
              targetScore={targetScore}
              starThresholds={starThresholds}
              bonusPoints={victoryInfo.bonusPoints}
              bestScore={bestScore}
              onRestart={restartGame}
              onNextLevel={nextLevel}
            />

            {/* Gentle healthy-play reminder (only between moves) */}
            <Modal
              visible={shouldRemind && gameStatus === 'idle' && !isGameOver && !isVictory}
              transparent
              animationType="fade"
              onRequestClose={dismissBreak}
            >
              <View style={styles.breakOverlay}>
                <View style={styles.breakCard}>
                  <Text style={styles.breakEmoji}>💧🧸</Text>
                  <Text style={styles.breakTitle}>Time for a little break!</Text>
                  <Text style={styles.breakText}>
                    Barnaby wants to stretch and sip some water. You can too! Then come back
                    and play some more.
                  </Text>
                  <TouchableOpacity
                    style={styles.breakButton}
                    onPress={dismissBreak}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Keep playing"
                  >
                    <Text style={styles.breakButtonText}>OK, KEEP PLAYING 🐾</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        </ScrollView>
      </SafeAreaView>
    </StorybookMeadow>
  );
}

const styles = StyleSheet.create({
  breakOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 10, 36, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  breakCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFF9E6',
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#C28854',
    padding: 22,
    alignItems: 'center',
  },
  breakEmoji: { fontSize: 40, marginBottom: 6 },
  breakTitle: { color: '#8D5B28', fontSize: 20, fontWeight: '900', marginBottom: 6, textAlign: 'center' },
  breakText: { color: '#5D4037', fontSize: 14, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  breakButton: {
    backgroundColor: '#FFB300',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  breakButtonText: { color: '#4E342E', fontSize: 14, fontWeight: '900' },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: 'transparent',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  boardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  legendContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 18,
    borderWidth: 2.5,
    borderTopColor: '#FFE082',
    borderColor: '#C28854',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 6,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#5D4037',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 4,
  },
  legendTitle: {
    color: '#8D5B28',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  legendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFE082',
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  legendPillEmoji: {
    fontSize: 13,
  },
  legendPillText: {
    color: '#6D4C41',
    fontSize: 10,
    fontWeight: '800',
  },
  sanctuaryBanner: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFF9E6',
    borderRadius: 18,
    borderWidth: 2.5,
    borderTopColor: '#FFE082',
    borderColor: '#C28854',
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginVertical: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#5D4037',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  sanctuaryBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sanctuaryBannerIcon: {
    fontSize: 24,
  },
  sanctuaryBannerTitle: {
    color: '#8D5B28',
    fontSize: 12,
    fontWeight: '900',
  },
  sanctuaryLevelBadge: {
    color: '#D84315',
    fontWeight: '900',
  },
  sanctuaryBannerSubtitle: {
    color: '#5D4037',
    fontSize: 10,
    fontWeight: '700',
  },
  sanctuaryBasketPill: {
    backgroundColor: '#FFE082',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFB300',
    paddingHorizontal: 9,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sanctuaryBasketText: {
    color: '#E65100',
    fontSize: 11,
    fontWeight: '900',
  },
  sanctuaryArrow: {
    color: '#8D5B28',
    fontSize: 14,
    fontWeight: '900',
  },
});
