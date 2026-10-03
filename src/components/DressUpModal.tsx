import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { PetHat, PetAccessory } from '../types/game';
import { HATS, ACCESSORIES } from '../constants/theme';
import { soundSynthesizer } from '../audio/SoundSynthesizer';

interface DressUpModalProps {
  visible: boolean;
  currentHat: PetHat;
  currentAccessory: PetAccessory;
  starsCount: number;
  onSelectHat: (hat: PetHat) => void;
  onSelectAccessory: (acc: PetAccessory) => void;
  onClose: () => void;
}

export const DressUpModal: React.FC<DressUpModalProps> = ({
  visible,
  currentHat,
  currentAccessory,
  starsCount,
  onSelectHat,
  onSelectAccessory,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>🐾 Pet Dress-Up</Text>
              <Text style={styles.subtitle}>Customize Barnaby the Bear!</Text>
            </View>
            <View style={styles.starsBadge}>
              <Text style={styles.starsText}>⭐ {starsCount}</Text>
            </View>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* HATS SECTION */}
            <Text style={styles.sectionTitle}>👒 Silly Hats</Text>
            <View style={styles.grid}>
              {HATS.map((item) => {
                const isSelected = currentHat === item.id;
                const isUnlocked = starsCount >= item.costStars;

                return (
                  <TouchableOpacity
                    key={item.id}
                    disabled={!isUnlocked}
                    style={[
                      styles.itemCard,
                      isSelected && styles.itemCardSelected,
                      !isUnlocked && styles.itemCardLocked,
                    ]}
                    onPress={() => {
                      if (item.id === 'crown') {
                        soundSynthesizer.playRoyalCrown();
                      } else if (item.id === 'wizard') {
                        soundSynthesizer.playStarWand();
                      } else if (item.id === 'flower') {
                        soundSynthesizer.playBeeCopter();
                      } else {
                        soundSynthesizer.playTap();
                      }
                      onSelectHat(item.id);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.itemEmoji}>{item.emoji}</Text>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {!isUnlocked ? (
                      <Text style={styles.costLocked}>🔒 {item.costStars} ⭐</Text>
                    ) : (
                      <Text style={[styles.costFree, isSelected && styles.costSelected]}>
                        {isSelected ? 'Equipped ✓' : item.costStars === 0 ? 'Free' : 'Unlocked'}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ACCESSORIES SECTION */}
            <Text style={styles.sectionTitle}>🕶️ Fun Props & Capes</Text>
            <View style={styles.grid}>
              {ACCESSORIES.map((item) => {
                const isSelected = currentAccessory === item.id;
                const isUnlocked = starsCount >= item.costStars;

                return (
                  <TouchableOpacity
                    key={item.id}
                    disabled={!isUnlocked}
                    style={[
                      styles.itemCard,
                      isSelected && styles.itemCardSelected,
                      !isUnlocked && styles.itemCardLocked,
                    ]}
                    onPress={() => {
                      soundSynthesizer.playTap();
                      onSelectAccessory(item.id);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.itemEmoji}>{item.emoji}</Text>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {!isUnlocked ? (
                      <Text style={styles.costLocked}>🔒 {item.costStars} ⭐</Text>
                    ) : (
                      <Text style={[styles.costFree, isSelected && styles.costSelected]}>
                        {isSelected ? 'Equipped ✓' : item.costStars === 0 ? 'Free' : 'Unlocked'}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => {
              soundSynthesizer.playTap();
              onClose();
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.doneButtonText}>Done & Play! 🐾</Text>
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
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    backgroundColor: '#35165E',
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#FFD700',
    padding: 18,
    shadowColor: '#FFD700',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(255, 215, 0, 0.3)',
    paddingBottom: 8,
  },
  title: {
    color: '#FFD700',
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    color: '#DCBAFF',
    fontSize: 12,
    fontWeight: '600',
  },
  starsBadge: {
    backgroundColor: '#FFA000',
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  starsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  scrollArea: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  itemCard: {
    width: '31%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  itemCardSelected: {
    borderColor: '#00E676',
    backgroundColor: 'rgba(0, 230, 118, 0.25)',
  },
  itemCardLocked: {
    opacity: 0.45,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  itemEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  itemName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  costFree: {
    color: '#81C784',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  costSelected: {
    color: '#00E676',
  },
  costLocked: {
    color: '#FF8A80',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  doneButton: {
    backgroundColor: '#00E676',
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  doneButtonText: {
    color: '#1B5E20',
    fontSize: 16,
    fontWeight: '900',
  },
});
