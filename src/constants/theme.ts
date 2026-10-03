import { AnimalType, PetHat, PetAccessory } from '../types/game';

export const BOARD_ROWS = 8;
export const BOARD_COLS = 8;

export const ANIMAL_TYPES: AnimalType[] = [
  'fox',
  'panda',
  'bunny',
  'frog',
  'bear',
  'otter',
];

// Compatibility alias
export const CANDY_COLORS = ANIMAL_TYPES;

export interface AnimalVisualInfo {
  name: string;
  species: string;
  primaryColor: string;
  accentColor: string;
  lightColor: string;
  glowColor: string;
  symbol: string;
  personality: string;
}

export const ANIMAL_THEMES: Record<AnimalType, AnimalVisualInfo> = {
  fox: {
    name: 'Pippin',
    species: 'Fox Kit',
    primaryColor: '#FF6F00',
    accentColor: '#D84315',
    lightColor: '#FFE0B2',
    glowColor: 'rgba(255, 111, 0, 0.45)',
    symbol: '🦊',
    personality: 'Clever & playful',
  },
  panda: {
    name: 'Bao',
    species: 'Panda Cub',
    primaryColor: '#00BFA5',
    accentColor: '#00796B',
    lightColor: '#E0F2F1',
    glowColor: 'rgba(0, 191, 165, 0.45)',
    symbol: '🐼',
    personality: 'Gentle & cuddly',
  },
  bunny: {
    name: 'Bella',
    species: 'Bunny',
    primaryColor: '#EC407A',
    accentColor: '#C2185B',
    lightColor: '#FCE4EC',
    glowColor: 'rgba(236, 64, 122, 0.45)',
    symbol: '🐰',
    personality: 'Bouncy & cheerful',
  },
  frog: {
    name: 'Ribbit',
    species: 'Tree Frog',
    primaryColor: '#43A047',
    accentColor: '#2E7D32',
    lightColor: '#E8F5E9',
    glowColor: 'rgba(67, 160, 71, 0.45)',
    symbol: '🐸',
    personality: 'Curious & jumpy',
  },
  bear: {
    name: 'Barnaby',
    species: 'Honey Bear',
    primaryColor: '#FFB300',
    accentColor: '#F57F17',
    lightColor: '#FFF8E1',
    glowColor: 'rgba(255, 179, 0, 0.45)',
    symbol: '🐻',
    personality: 'Warm & sweet',
  },
  otter: {
    name: 'Pip',
    species: 'Sea Otter',
    primaryColor: '#039BE5',
    accentColor: '#0277BD',
    lightColor: '#E1F5FE',
    glowColor: 'rgba(3, 155, 229, 0.45)',
    symbol: '🐬',
    personality: 'Splashy & bubbly',
  },
};

export const GAME_RULES = {
  DEFAULT_MOVES: 25,
  TARGET_SCORE: 3000,
  RESCUE_MOVES: 5,
  STAR_THRESHOLDS: [1200, 2200, 3200],
  BASE_POINTS_PER_TILE: 60,
  COMBO_BONUS_MULTIPLIER: 1.5,
  IDLE_HINT_DELAY_MS: 4000, // 4 seconds before hinting to help the child
  LEVEL_TARGET_STEP: 600, // extra goal points per level
  MAX_TARGET_SCORE: 6000,
  BONUS_POINTS_PER_LEFTOVER_MOVE: 150,
  BREAK_REMINDER_MINUTES: 20, // gentle healthy-play nudge
};

export interface WardrobeItem<T> {
  id: T;
  name: string;
  emoji: string;
  costStars: number;
  description: string;
}

export const HATS: WardrobeItem<PetHat>[] = [
  { id: 'none', name: 'No Hat', emoji: '🐾', costStars: 0, description: 'Natural furry look' },
  { id: 'wizard', name: 'Star Wizard', emoji: '🧙‍♂️', costStars: 1, description: 'Cast sparkly spells!' },
  { id: 'crown', name: 'Royal Crown', emoji: '👑', costStars: 2, description: 'King of the Pet Pals' },
  { id: 'flower', name: 'Daisy Crown', emoji: '🌸', costStars: 1, description: 'Fresh spring blossoms' },
  { id: 'chef', name: 'Baker Toque', emoji: '👨‍🍳', costStars: 2, description: 'Bakes yummy pet treats' },
  { id: 'pirate', name: 'Pirate Hat', emoji: '🏴‍☠️', costStars: 3, description: 'Ahoy, matey!' },
];

export const ACCESSORIES: WardrobeItem<PetAccessory>[] = [
  { id: 'none', name: 'No Prop', emoji: '✨', costStars: 0, description: 'Clean and tidy' },
  { id: 'sunglasses', name: 'Star Shades', emoji: '🕶️', costStars: 1, description: 'Super cool buddy' },
  { id: 'cape', name: 'Hero Cape', emoji: '🦸', costStars: 2, description: 'Ready to save the day!' },
  { id: 'bow', name: 'Silk Bowtie', emoji: '🎀', costStars: 1, description: 'Fancy party style' },
];
