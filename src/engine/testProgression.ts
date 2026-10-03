import {
  getLevelConfig,
  starsForScore,
  leftoverMovesBonus,
  starsAwardedForVictory,
} from './progression';
import {
  createInitialBoard,
  findBestMove,
  findMatches,
  hasPossibleMoves,
  isValidSwap,
  shuffleBoard,
} from './Match3Engine';
import { sanitizeProgress, PROGRESS_VERSION } from '../storage/progressSchema';
import { GAME_RULES } from '../constants/theme';

const fail = (msg: string): never => {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
  throw new Error(msg);
};
const assert = {
  ok: (v: unknown, msg = 'expected truthy') => {
    if (!v) fail(msg);
  },
  equal: (a: unknown, b: unknown, msg?: string) => {
    if (a !== b) fail(msg ?? `expected ${String(a)} === ${String(b)}`);
  },
  deepEqual: (a: unknown, b: unknown) => {
    if (JSON.stringify(a) !== JSON.stringify(b)) fail(`expected ${JSON.stringify(a)} deep-equal ${JSON.stringify(b)}`);
  },
};

console.log('--- STARTING PROGRESSION & PERSISTENCE TESTS ---');

// Level 1 must equal the original tuning.
const l1 = getLevelConfig(1);
assert.equal(l1.targetScore, GAME_RULES.TARGET_SCORE);
assert.deepEqual(l1.starThresholds, [1200, 2200, 3200]);
assert.ok(getLevelConfig(3).targetScore > getLevelConfig(2).targetScore);
assert.equal(getLevelConfig(999).targetScore, GAME_RULES.MAX_TARGET_SCORE);
assert.equal(getLevelConfig(-4).level, 1);
assert.equal(getLevelConfig(NaN).level, 1);
console.log('Level scaling OK');

// Stars and bonus.
assert.equal(starsForScore(0, l1.starThresholds), 0);
assert.equal(starsForScore(1200, l1.starThresholds), 1);
assert.equal(starsForScore(2200, l1.starThresholds), 2);
assert.equal(starsForScore(3200, l1.starThresholds), 3);
assert.equal(starsAwardedForVictory(3000, l1.starThresholds), 2);
assert.equal(starsAwardedForVictory(1, l1.starThresholds), 1, 'victory always awards >= 1 star');
assert.equal(leftoverMovesBonus(4), 4 * GAME_RULES.BONUS_POINTS_PER_LEFTOVER_MOVE);
assert.equal(leftoverMovesBonus(-3), 0);
console.log('Stars & leftover-move bonus OK');

// Best-move hint is always a valid swap.
for (let i = 0; i < 25; i++) {
  const b = createInitialBoard();
  const best = findBestMove(b);
  assert.ok(best, 'a fresh board always has a best move');
  assert.ok(isValidSwap(b, best![0], best![1]));
}
console.log('findBestMove returns valid swaps OK');

// Shuffle always yields a playable, match-free board.
for (let i = 0; i < 25; i++) {
  const s = shuffleBoard(createInitialBoard());
  assert.equal(findMatches(s).hasMatches, false);
  assert.ok(hasPossibleMoves(s));
}
console.log('shuffleBoard postconditions OK');

// Persistence sanitising: garbage in, safe values out.
assert.equal(sanitizeProgress(null), null);
assert.equal(sanitizeProgress('x'), null);
assert.equal(sanitizeProgress({ version: 999 }), null);
const dirty = sanitizeProgress({
  version: PROGRESS_VERSION,
  starsCount: -5,
  hat: 'laser-helmet',
  accessory: 'cape',
  level: 'abc',
  bestScore: 12.9,
  sanctuary: {
    friendshipLevel: 3,
    hunger: 9999,
    treatsInventory: { berries: -1, honey: 'x', acorns: 4 },
    unlockedStickers: ['a', 5, null],
    currentMood: 'angry',
  },
})!;
assert.equal(dirty.starsCount, 0);
assert.equal(dirty.hat, 'none');
assert.equal(dirty.accessory, 'cape');
assert.equal(dirty.level, 1);
assert.equal(dirty.bestScore, 12);
assert.equal(dirty.sanctuary.friendshipLevel, 3);
assert.equal(dirty.sanctuary.hunger, 100);
assert.equal(dirty.sanctuary.treatsInventory.berries, 0);
assert.equal(dirty.sanctuary.treatsInventory.acorns, 4);
assert.deepEqual(dirty.sanctuary.unlockedStickers, ['a']);
assert.equal(dirty.sanctuary.currentMood, 'happy');
console.log('Progress sanitising OK');

console.log('--- ALL PROGRESSION & PERSISTENCE TESTS PASSED! ---');
