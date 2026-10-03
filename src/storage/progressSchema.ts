import { ACCESSORIES, HATS } from '../constants/theme';
import { PetAccessory, PetHat, PetSanctuaryState, TreatType } from '../types/game';
import { createInitialSanctuaryState } from '../engine/sanctuaryEngine';

export const PROGRESS_VERSION = 1;

export interface SavedProgress {
  version: number;
  starsCount: number;
  hat: PetHat;
  accessory: PetAccessory;
  level: number;
  bestScore: number;
  sanctuary: PetSanctuaryState;
}

const TREAT_KEYS: TreatType[] = ['berries', 'honey', 'acorns', 'apples'];
const MOODS = ['happy', 'munching', 'tickled', 'excited', 'sleepy', 'curious'];

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const toCount = (v: unknown, fallback: number, max = 1_000_000): number =>
  typeof v === 'number' && Number.isFinite(v)
    ? Math.min(max, Math.max(0, Math.floor(v)))
    : fallback;

export function sanitizeSanctuary(raw: unknown): PetSanctuaryState {
  const base = createInitialSanctuaryState();
  if (!isObject(raw)) return base;

  const inv = isObject(raw.treatsInventory) ? raw.treatsInventory : {};
  const treatsInventory = { ...base.treatsInventory };
  for (const key of TREAT_KEYS) {
    treatsInventory[key] = toCount(inv[key], base.treatsInventory[key], 9999);
  }

  const stickers = Array.isArray(raw.unlockedStickers)
    ? raw.unlockedStickers.filter((s): s is string => typeof s === 'string')
    : base.unlockedStickers;

  return {
    friendshipLevel: Math.max(1, toCount(raw.friendshipLevel, base.friendshipLevel, 999)),
    friendshipXp: toCount(raw.friendshipXp, base.friendshipXp),
    friendshipNextXp: Math.max(1, toCount(raw.friendshipNextXp, base.friendshipNextXp)),
    happiness: toCount(raw.happiness, base.happiness, 100),
    hunger: toCount(raw.hunger, base.hunger, 100),
    treatsInventory,
    totalPetsCount: toCount(raw.totalPetsCount, 0),
    totalFeedsCount: toCount(raw.totalFeedsCount, 0),
    unlockedStickers: stickers,
    currentMood: (MOODS.includes(raw.currentMood as string)
      ? raw.currentMood
      : base.currentMood) as PetSanctuaryState['currentMood'],
    lastReactionMessage:
      typeof raw.lastReactionMessage === 'string' && raw.lastReactionMessage.length < 300
        ? raw.lastReactionMessage
        : base.lastReactionMessage,
  };
}

/** Validates untrusted JSON from storage. Returns null when nothing usable is there. */
export function sanitizeProgress(raw: unknown): SavedProgress | null {
  if (!isObject(raw) || raw.version !== PROGRESS_VERSION) return null;

  const hat = HATS.some((h) => h.id === raw.hat) ? (raw.hat as PetHat) : 'none';
  const accessory = ACCESSORIES.some((a) => a.id === raw.accessory)
    ? (raw.accessory as PetAccessory)
    : 'none';

  return {
    version: PROGRESS_VERSION,
    starsCount: toCount(raw.starsCount, 0, 99999),
    hat,
    accessory,
    level: Math.max(1, toCount(raw.level, 1, 9999)),
    bestScore: toCount(raw.bestScore, 0),
    sanctuary: sanitizeSanctuary(raw.sanctuary),
  };
}
