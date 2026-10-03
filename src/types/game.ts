export type AnimalType = 'fox' | 'panda' | 'bunny' | 'frog' | 'bear' | 'otter';

// Backward compatibility alias for color
export type CandyColor = AnimalType;

export type SpecialType =
  | 'normal'
  | 'striped_h' // Confetti Popper Horizontal
  | 'striped_v' // Confetti Popper Vertical
  | 'wrapped'   // Honey Splash Pot (3x3)
  | 'color_bomb' // Rainbow Butterfly (Color Clear)
  | 'bee_copter' // 🐝 Bumblebee Copter with spinning propeller and stardust trail
  | 'star_wand'  // ⭐ Star Wand with glowing diagonal cosmic rays
  | 'royal_crown'; // 👑 Royal Crown with sparkling gemstones

export interface Tile {
  id: string;
  color: AnimalType;
  special: SpecialType;
  row: number;
  col: number;
}

export type BoardGrid = (Tile | null)[][];

export interface Position {
  row: number;
  col: number;
}

export interface MatchGroup {
  tiles: Position[];
  color: AnimalType;
  type:
    | 'line3'
    | 'line4_h'
    | 'line4_v'
    | 'line5'
    | 'line6_plus'
    | 'intersect_t_l'
    | 'intersect_cross'
    | 'square_2x2';
  origin?: Position;
}

export type GameStatus =
  | 'idle'
  | 'swapping'
  | 'clearing'
  | 'falling'
  | 'game_over'
  | 'victory';

export type PetHat = 'none' | 'wizard' | 'crown' | 'flower' | 'chef' | 'pirate';
export type PetAccessory = 'none' | 'sunglasses' | 'cape' | 'bow';

export interface PetCustomization {
  hat: PetHat;
  accessory: PetAccessory;
  name: string;
}

export * from './sanctuary';
