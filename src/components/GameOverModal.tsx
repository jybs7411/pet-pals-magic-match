import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { GAME_RULES } from '../constants/theme';

interface GameOverModalProps {
  visible: boolean;
  isVictory: boolean;
  score: number;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  visible,
  isVictory,
  score,
  onRestart,
}) => {
  const [star1, star2, star3] = GAME_RULES.STAR_THRESHOLDS;
  const starsCount = score >= star3 ? 3 : score >= star2 ? 2 : score >= star1 ? 1 : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.bannerEmoji}>{isVictory ? '🐾🎉' : '💖🐾'}</Text>
          <Text style={[styles.title, isVictory ? styles.titleWin : styles.titleTryAgain]}>
            {isVictory ? 'PAWSOME VICTORY!' : 'GREAT EFFORT!'}
          </Text>
          <Text style={styles.encouragingText}>
            {isVictory
              ? 'Your animal pals are so happy and playful!'
              : 'You did a wonderful job helping the animals!'}
          </Text>

          {/* Stars */}
          <View style={styles.starsContainer}>
            <Text style={[styles.star, starsCount >= 1 && styles.starEarned]}>⭐</Text>
            <Text style={[styles.star, styles.middleStar, starsCount >= 2 && styles.starEarned]}>
              ⭐
            </Text>
            <Text style={[styles.star, starsCount >= 3 && styles.starEarned]}>⭐</Text>
          </View>

          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>PET POINTS</Text>
            <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
            <Text style={styles.targetLabel}>
              Goal: {GAME_RULES.TARGET_SCORE.toLocaleString()}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, isVictory ? styles.buttonWin : styles.buttonTryAgain]}
            onPress={onRestart}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              {isVictory ? 'PLAY AGAIN! 🐾' : 'TRY AGAIN! 🔄'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 10, 36, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#35165E',
    borderRadius: 26,
    borderWidth: 4,
    borderColor: '#FFD700',
    padding: 22,
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 12,
  },
  bannerEmoji: {
    fontSize: 44,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 4,
  },
  titleWin: {
    color: '#FFD700',
  },
  titleTryAgain: {
    color: '#FF80AB',
  },
  encouragingText: {
    color: '#DCBAFF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 4,
  },
  star: {
    fontSize: 34,
    opacity: 0.25,
  },
  middleStar: {
    fontSize: 44,
    marginTop: -8,
  },
  starEarned: {
    opacity: 1,
  },
  scoreBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  scoreLabel: {
    color: '#DCBAFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  scoreValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    marginVertical: 2,
  },
  targetLabel: {
    color: '#CE93D8',
    fontSize: 12,
    fontWeight: '700',
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonWin: {
    backgroundColor: '#00E676',
  },
  buttonTryAgain: {
    backgroundColor: '#FF6F00',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
