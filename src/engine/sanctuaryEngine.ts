import {
  PetSanctuaryState,
  TreatType,
  StickerBadge,
  FriendshipTier,
} from '../types/sanctuary';
import {
  TREATS_CATALOG,
  FRIENDSHIP_TIERS,
  STICKER_BADGES_LIST,
  TICKLE_REACTIONS,
  FEED_REACTIONS,
} from '../constants/sanctuary';
import { MatchGroup } from '../types/game';

/**
 * Creates the initial state for Barnaby's Pet Sanctuary
 */
export function createInitialSanctuaryState(): PetSanctuaryState {
  return {
    friendshipLevel: 1,
    friendshipXp: 25,
    friendshipNextXp: 75,
    happiness: 70,
    hunger: 55,
    treatsInventory: {
      berries: 12,
      honey: 6,
      acorns: 8,
      apples: 2,
    },
    totalPetsCount: 0,
    totalFeedsCount: 0,
    unlockedStickers: ['badge_first_treat'],
    currentMood: 'happy',
    lastReactionMessage: "Barnaby's tummy is ready for delicious treats! 🍓🍯",
  };
}

/**
 * Calculates XP threshold required for the next friendship tier
 */
export function getRequiredXpForLevel(level: number): number {
  const tier = FRIENDSHIP_TIERS.find((t) => t.level === level + 1);
  if (tier) return tier.requiredXp;
  // Beyond defined tiers: scale by 400 XP per level
  return 1100 + (level - 5) * 400;
}

/**
 * Evaluates and unlocks any newly achieved sticker badges
 */
export function checkUnlockedStickers(
  state: PetSanctuaryState,
  lastFedType?: TreatType
): string[] {
  const currentUnlocked = new Set(state.unlockedStickers);

  // 1. Feeding badges
  if (state.totalFeedsCount >= 1) {
    currentUnlocked.add('badge_first_treat');
  }
  if (lastFedType === 'honey' || state.totalFeedsCount >= 3) {
    currentUnlocked.add('badge_honey_lover');
  }
  if (lastFedType === 'apples') {
    currentUnlocked.add('badge_rainbow_sparkle');
  }

  // 2. Affection badges
  if (state.totalPetsCount >= 10) {
    currentUnlocked.add('badge_tickle_champ');
  }
  if (state.happiness >= 95) {
    currentUnlocked.add('badge_bear_hug');
  }

  // 3. Milestone badges
  if (state.friendshipLevel >= 2) {
    currentUnlocked.add('badge_pal_level_2');
  }
  if (state.friendshipLevel >= 3) {
    currentUnlocked.add('badge_bestie_level_3');
  }

  return Array.from(currentUnlocked);
}

/**
 * Feeds Barnaby a treat from the player's gathered inventory
 */
export function feedBarnabyInState(
  state: PetSanctuaryState,
  treatType: TreatType
): {
  newState: PetSanctuaryState;
  success: boolean;
  leveledUp: boolean;
  message: string;
} {
  const treat = TREATS_CATALOG.find((t) => t.id === treatType);
  if (!treat) {
    return {
      newState: state,
      success: false,
      leveledUp: false,
      message: 'Unknown treat!',
    };
  }

  const currentCount = state.treatsInventory[treatType] || 0;
  if (currentCount < treat.cost) {
    return {
      newState: state,
      success: false,
      leveledUp: false,
      message: `Need ${treat.cost} ${treat.emoji} ${treat.name}! Match more in the meadow! 🐾`,
    };
  }

  // Deduct inventory cost
  const newInventory = {
    ...state.treatsInventory,
    [treatType]: currentCount - treat.cost,
  };

  const newTotalFeeds = state.totalFeedsCount + 1;
  const newHappiness = Math.min(100, state.happiness + treat.happinessGain);
  const newHunger = Math.min(100, state.hunger + 25);

  let newXp = state.friendshipXp + treat.xpGain;
  let newLevel = state.friendshipLevel;
  let nextXp = state.friendshipNextXp;
  let leveledUp = false;

  // Check level up loop (in case a large treat jumps levels)
  while (newXp >= nextXp) {
    newLevel += 1;
    leveledUp = true;
    nextXp = getRequiredXpForLevel(newLevel);
  }

  // Pick cute reaction line
  const reactions = FEED_REACTIONS[treatType] || FEED_REACTIONS.berries;
  const reaction =
    reactions[Math.floor(Math.random() * reactions.length)];

  const updatedState: PetSanctuaryState = {
    ...state,
    treatsInventory: newInventory,
    happiness: newHappiness,
    hunger: newHunger,
    friendshipXp: newXp,
    friendshipLevel: newLevel,
    friendshipNextXp: nextXp,
    totalFeedsCount: newTotalFeeds,
    currentMood: 'munching',
    lastReactionMessage: reaction,
    unlockedStickers: checkUnlockedStickers(
      {
        ...state,
        friendshipLevel: newLevel,
        totalFeedsCount: newTotalFeeds,
        happiness: newHappiness,
      },
      treatType
    ),
  };

  return {
    newState: updatedState,
    success: true,
    leveledUp,
    message: reaction,
  };
}

/**
 * Pets or tickles Barnaby the Bear Cub
 */
export function petBarnabyInState(state: PetSanctuaryState): {
  newState: PetSanctuaryState;
  leveledUp: boolean;
  message: string;
} {
  const newTotalPets = state.totalPetsCount + 1;
  const newHappiness = Math.min(100, state.happiness + 6);
  let newXp = state.friendshipXp + 5;
  let newLevel = state.friendshipLevel;
  let nextXp = state.friendshipNextXp;
  let leveledUp = false;

  while (newXp >= nextXp) {
    newLevel += 1;
    leveledUp = true;
    nextXp = getRequiredXpForLevel(newLevel);
  }

  const reaction =
    TICKLE_REACTIONS[Math.floor(Math.random() * TICKLE_REACTIONS.length)];

  const updatedState: PetSanctuaryState = {
    ...state,
    happiness: newHappiness,
    friendshipXp: newXp,
    friendshipLevel: newLevel,
    friendshipNextXp: nextXp,
    totalPetsCount: newTotalPets,
    currentMood: 'tickled',
    lastReactionMessage: reaction,
    unlockedStickers: checkUnlockedStickers({
      ...state,
      friendshipLevel: newLevel,
      totalPetsCount: newTotalPets,
      happiness: newHappiness,
    }),
  };

  return {
    newState: updatedState,
    leveledUp,
    message: reaction,
  };
}

/**
 * Awards treats based on match-3 combinations
 */
export function calculateTreatDropsFromMatches(
  currentInventory: Record<TreatType, number>,
  groups: MatchGroup[],
  combo: number
): {
  newInventory: Record<TreatType, number>;
  gathered: Partial<Record<TreatType, number>>;
} {
  const gathered: Partial<Record<TreatType, number>> = {};

  const addGathered = (type: TreatType, count: number) => {
    gathered[type] = (gathered[type] || 0) + count;
  };

  for (const group of groups) {
    const tileCount = group.tiles.length;
    if (group.color === 'bear') {
      // Golden honey!
      addGathered('honey', tileCount >= 4 ? 2 : 1);
    } else if (group.color === 'bunny' || group.color === 'fox') {
      // Juicy berries!
      addGathered('berries', tileCount >= 4 ? 3 : 2);
    } else if (group.color === 'frog' || group.color === 'otter' || group.color === 'panda') {
      // Crunchy acorns!
      addGathered('acorns', tileCount >= 4 ? 3 : 2);
    }

    // 5-match or special line creates a rare magic apple
    if (
      group.type === 'line5' ||
      group.type === 'line6_plus' ||
      group.type === 'intersect_t_l' ||
      group.type === 'intersect_cross'
    ) {
      addGathered('apples', 1);
    }
  }

  // Combo multiplier extra drop
  if (combo >= 3) {
    addGathered('honey', 1);
    addGathered('berries', 2);
  }

  const newInventory: Record<TreatType, number> = {
    berries: currentInventory.berries + (gathered.berries || 0),
    honey: currentInventory.honey + (gathered.honey || 0),
    acorns: currentInventory.acorns + (gathered.acorns || 0),
    apples: currentInventory.apples + (gathered.apples || 0),
  };

  return { newInventory, gathered };
}
