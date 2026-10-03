import { PetTreat, FriendshipTier, StickerBadge, TreatType } from '../types/sanctuary';

export const TREATS_CATALOG: PetTreat[] = [
  {
    id: 'berries',
    name: 'Wild Berries',
    emoji: '🍓',
    cost: 3,
    xpGain: 15,
    happinessGain: 12,
    soundEffectText: 'CRUNCH CRUNCH!',
    description: 'Fresh juicy berries picked from strawberry bushes!',
    favoriteFlavor: false,
  },
  {
    id: 'honey',
    name: 'Golden Honey Pot',
    emoji: '🍯',
    cost: 2,
    xpGain: 35,
    happinessGain: 30,
    soundEffectText: 'SLURP SLURP!',
    description: "Barnaby's absolute favorite! Sweet and golden wild honey.",
    favoriteFlavor: true,
  },
  {
    id: 'acorns',
    name: 'Forest Acorns',
    emoji: '🌰',
    cost: 3,
    xpGain: 20,
    happinessGain: 15,
    soundEffectText: 'MUNCH CHOMP!',
    description: 'Crisp acorns gathered from under great oak trees.',
    favoriteFlavor: false,
  },
  {
    id: 'apples',
    name: 'Magic Star Apple',
    emoji: '🍎',
    cost: 1,
    xpGain: 50,
    happinessGain: 45,
    soundEffectText: 'CRUNCH YUM!',
    description: 'Rare enchanted fruit that makes Barnaby sparkle with joy!',
    favoriteFlavor: true,
  },
];

export const FRIENDSHIP_TIERS: FriendshipTier[] = [
  {
    level: 1,
    title: 'Forest Newbie',
    requiredXp: 0,
    perkDescription: 'You and Barnaby just met! Say hello with gentle head pats.',
    badgeEmoji: '🌱',
  },
  {
    level: 2,
    title: 'Playful Pal',
    requiredXp: 75,
    perkDescription: 'Barnaby wiggles his ears when you visit! +1 Extra starting move.',
    badgeEmoji: '🐾',
  },
  {
    level: 3,
    title: 'Best Bear Friend',
    requiredXp: 200,
    perkDescription: 'Barnaby shares honey treats with you! +10% Treat drop bonus.',
    badgeEmoji: '🐻',
  },
  {
    level: 4,
    title: 'Honey Guardian',
    requiredXp: 400,
    perkDescription: 'Unlocks Barnaby\'s Golden Honeycomb Crown sticker badge!',
    badgeEmoji: '🍯',
  },
  {
    level: 5,
    title: 'Sanctuary Hero',
    requiredXp: 700,
    perkDescription: 'Barnaby performs a special happy tap dance in the meadow!',
    badgeEmoji: '⭐',
  },
  {
    level: 6,
    title: 'Eternal Soulmates',
    requiredXp: 1100,
    perkDescription: 'Permanent rainbow sparkle aura around Barnaby in all games!',
    badgeEmoji: '👑',
  },
];

export const STICKER_BADGES_LIST: StickerBadge[] = [
  {
    id: 'badge_first_treat',
    name: 'First Feast',
    emoji: '🍓',
    description: 'Fed Barnaby his very first delicious treat!',
    isUnlocked: false,
    category: 'feeding',
  },
  {
    id: 'badge_honey_lover',
    name: 'Honey Feast',
    emoji: '🍯',
    description: 'Fed Barnaby sweet golden honey pots 3 times.',
    isUnlocked: false,
    category: 'feeding',
  },
  {
    id: 'badge_tickle_champ',
    name: 'Giggle Master',
    emoji: '💖',
    description: 'Tickled Barnaby 10 times until he burst into giggles!',
    isUnlocked: false,
    category: 'affection',
  },
  {
    id: 'badge_bear_hug',
    name: 'Bear Hugger',
    emoji: '🤗',
    description: 'Filled Barnaby\'s happiness meter all the way to 100%!',
    isUnlocked: false,
    category: 'affection',
  },
  {
    id: 'badge_pal_level_2',
    name: 'Buddy Badge',
    emoji: '🐾',
    description: 'Reached Friendship Level 2: Playful Pal!',
    isUnlocked: false,
    category: 'milestone',
  },
  {
    id: 'badge_bestie_level_3',
    name: 'Bestie Forever',
    emoji: '⭐',
    description: 'Reached Friendship Level 3: Best Bear Friend!',
    isUnlocked: false,
    category: 'milestone',
  },
  {
    id: 'badge_rainbow_sparkle',
    name: 'Star Catcher',
    emoji: '🌈',
    description: 'Fed Barnaby a Magic Star Apple from puzzle cascades!',
    isUnlocked: false,
    category: 'puzzle',
  },
];

export const TICKLE_REACTIONS = [
  'Hehehe! That tickles my bear tummy! 🐻💖',
  'Aww, you give the sweetest cuddles! ✨',
  '*Wiggles little fuzzy ears happily!* 🐾',
  'Hehe squeak! More tickles please! 💕',
  'Barnaby loves you so much! 🤗❤️',
  'You are my absolute favorite human! 🌟',
  '*Soft cozy bear purrs of joy* 🐻💤',
];

export const FEED_REACTIONS: Record<TreatType, string[]> = {
  berries: [
    'NUM NUM CRUNCH! Juicy forest strawberries! 🍓😋',
    'Yum! Berry sweet and berry delicious! 🍓🐻',
    'Barnaby licks his paws! Thank you for the berries! 🍓✨',
  ],
  honey: [
    'MMMMMM HONEY! My absolute favorite golden nectar! 🍯🐻✨',
    'SLURP! So sticky and sweet! Barnaby is in bear heaven! 🍯💛',
    'HONEY TIME! Barnaby dances a happy honey jig! 🍯🐝🎉',
  ],
  acorns: [
    'CRUNCH CRUNCH! Crunchy acorns make my tummy warm! 🌰🐾',
    'Nutty goodness! Barnaby loves forest snacks! 🌰✨',
  ],
  apples: [
    'WOW! A glowing Magic Star Apple! Barnaby feels unstoppable! 🍎🌈✨',
    'CRUNCH! Sparks of rainbow joy! You are the best friend! 🍎💖',
  ],
};
