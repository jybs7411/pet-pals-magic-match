import { GAME_RULES } from '../constants/theme';

export interface LevelConfig {
  level: number;
  moves: number;
  targetScore: number;
  /** Score needed for 1, 2 and 3 stars. */
  starThresholds: [number, number, number];
}

const round50 = (n: number) => Math.round(n / 50) * 50;

/**
 * Level 1 matches the original tuning (3000 goal, 1200/2200/3200 stars).
 * Each later level asks for a little more, capped so it stays kid-friendly.
 */
export function getLevelConfig(level: number): LevelConfig {
  const safeLevel = Math.max(1, Math.floor(level) || 1);
  const target = Math.min(
    GAME_RULES.TARGET_SCORE + (safeLevel - 1) * GAME_RULES.LEVEL_TARGET_STEP,
    GAME_RULES.MAX_TARGET_SCORE
  );
  return {
    level: safeLevel,
    moves: GAME_RULES.DEFAULT_MOVES,
    targetScore: target,
    starThresholds: [
      round50(target * (0.4)),
      round50(target * (11 / 15)),
      round50(target * (16 / 15)),
    ],
  };
}

export function starsForScore(
  score: number,
  thresholds: [number, number, number]
): 0 | 1 | 2 | 3 {
  if (score >= thresholds[2]) return 3;
  if (score >= thresholds[1]) return 2;
  if (score >= thresholds[0]) return 1;
  return 0;
}

/** Leftover moves are cashed in as bonus points when the goal is reached early. */
export function leftoverMovesBonus(movesLeft: number): number {
  return Math.max(0, Math.floor(movesLeft)) * GAME_RULES.BONUS_POINTS_PER_LEFTOVER_MOVE;
}

/** Wardrobe stars granted for clearing a level: 1-3 depending on performance. */
export function starsAwardedForVictory(
  finalScore: number,
  thresholds: [number, number, number]
): number {
  return Math.max(1, starsForScore(finalScore, thresholds));
}
