import { PetHat, PetAccessory } from './game';

export type TreatType = 'berries' | 'honey' | 'acorns' | 'apples';

export interface PetTreat {
  id: TreatType;
  name: string;
  emoji: string;
  cost: number;
  xpGain: number;
  happinessGain: number;
  soundEffectText: string;
  description: string;
  favoriteFlavor: boolean;
}

export type PetMood = 'happy' | 'munching' | 'tickled' | 'excited' | 'sleepy' | 'curious';

export interface StickerBadge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  isUnlocked: boolean;
  category: 'feeding' | 'affection' | 'milestone' | 'puzzle';
}

export interface FriendshipTier {
  level: number;
  title: string;
  requiredXp: number;
  perkDescription: string;
  badgeEmoji: string;
}

export interface FloatingBubble {
  id: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  opacity: number;
}

export interface PetSanctuaryState {
  friendshipLevel: number;
  friendshipXp: number;
  friendshipNextXp: number;
  happiness: number; // 0 - 100
  hunger: number; // 0 - 100 (100 = completely full and satisfied)
  treatsInventory: Record<TreatType, number>;
  totalPetsCount: number;
  totalFeedsCount: number;
  unlockedStickers: string[];
  currentMood: PetMood;
  lastReactionMessage: string;
}
