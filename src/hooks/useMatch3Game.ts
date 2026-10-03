import { useState, useCallback, useRef, useEffect } from 'react';
import {
  BOARD_ROWS,
  BOARD_COLS,
  GAME_RULES,
} from '../constants/theme';
import {
  BoardGrid,
  GameStatus,
  Position,
  PetHat,
  PetAccessory,
  PetSanctuaryState,
  TreatType,
} from '../types/game';
import {
  createInitialBoard,
  isValidSwap,
  findMatches,
  clearMatches,
  applyGravityAndRefill,
  hasPossibleMoves,
  findBestMove,
  shuffleBoard,
  cloneBoard,
  areAdjacent,
  resolveSpecialSwap,
} from '../engine/Match3Engine';
import {
  createInitialSanctuaryState,
  feedBarnabyInState,
  petBarnabyInState,
  calculateTreatDropsFromMatches,
} from '../engine/sanctuaryEngine';
import { soundSynthesizer } from '../audio/SoundSynthesizer';
import {
  getLevelConfig,
  leftoverMovesBonus,
  starsAwardedForVictory,
} from '../engine/progression';
import { loadProgress, saveProgress } from '../storage/progressStore';
import { PROGRESS_VERSION } from '../storage/progressSchema';
import { haptics } from '../utils/haptics';

const PRAISE_MESSAGES = [
  'Sweet! 🐾',
  'Pawsome! 🌟',
  'Yummy Berries! 🍓',
  'Super Pet Power! ⚡',
  'Magic Star Rush! ✨',
];

export interface VictoryInfo {
  bonusPoints: number;
  starsEarned: number;
}

export function useMatch3Game() {
  const [level, setLevel] = useState<number>(1);
  const [unlockedLevel, setUnlockedLevel] = useState<number>(1);
  const [bestScore, setBestScore] = useState<number>(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const [victoryInfo, setVictoryInfo] = useState<VictoryInfo>({ bonusPoints: 0, starsEarned: 0 });
  const levelConfig = getLevelConfig(level);
  const levelConfigRef = useRef(levelConfig);
  levelConfigRef.current = levelConfig;

  const [board, setBoard] = useState<BoardGrid>(() => createInitialBoard());
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [matchedPosKeys, setMatchedPosKeys] = useState<Set<string>>(new Set());
  const [hintPositions, setHintPositions] = useState<[Position, Position] | null>(null);
  const [moves, setMoves] = useState<number>(GAME_RULES.DEFAULT_MOVES);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [praiseMessage, setPraiseMessage] = useState<string | null>(null);
  const [mascotMessage, setMascotMessage] = useState<string>(
    'Hi! Tap or swipe two animal friends to match 3! 🐾'
  );
  const [isCelebrating, setIsCelebrating] = useState(false);

  // Kid-Friendly Pet Customization & Stars
  const [starsCount, setStarsCount] = useState<number>(3); // 3 starting stars to try wardrobe!
  const [currentHat, setCurrentHat] = useState<PetHat>('wizard');
  const [currentAccessory, setCurrentAccessory] = useState<PetAccessory>('bow');

  // Emotional Companion Pet Sanctuary State (Barnaby the Bear Cub)
  const [sanctuaryState, setSanctuaryState] = useState<PetSanctuaryState>(() =>
    createInitialSanctuaryState()
  );
  const sanctuaryStateRef = useRef<PetSanctuaryState>(sanctuaryState);
  const [isSanctuaryOpen, setIsSanctuaryOpen] = useState(false);

  // Synchronous mirrors of game state. Async cascades must read these (not stale
  // closures) and must never trigger side effects from inside state updaters.
  const movesRef = useRef(GAME_RULES.DEFAULT_MOVES);
  const scoreRef = useRef(0);
  const hasUsedRescueRef = useRef(false);
  /** Input/animation lock, set synchronously so double taps can't start two swaps. */
  const busyRef = useRef(false);
  /** Bumped on restart/level change/unmount so in-flight cascades abandon themselves. */
  const runIdRef = useRef(0);
  const mountedRef = useRef(true);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const isRunAlive = (runId: number) => mountedRef.current && runIdRef.current === runId;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      runIdRef.current += 1;
    };
  }, []);

  const applyMoves = (n: number) => {
    movesRef.current = n;
    setMoves(n);
  };
  const addScore = (n: number) => {
    scoreRef.current += n;
    setScore(scoreRef.current);
  };

  // Reset 4-second idle hint timer
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    setHintPositions(null);

    if (gameStatus === 'idle' && !busyRef.current) {
      idleTimerRef.current = setTimeout(() => {
        const hint = findBestMove(board);
        if (hint) {
          setHintPositions(hint);
          setMascotMessage('Psst! Look where the sparkles are! ✨');
        }
      }, GAME_RULES.IDLE_HINT_DELAY_MS);
    }
  }, [board, gameStatus]);

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  /**
   * Decides what happens once a turn has fully settled: victory (as soon as the
   * goal is reached, cashing in leftover moves), a one-time rescue boost, game
   * over, or back to idle. Runs once per turn, outside any state updater.
   */
  const resolveTurnEnd = () => {
    const cfg = levelConfigRef.current;
    const movesLeft = movesRef.current;

    if (scoreRef.current >= cfg.targetScore) {
      const bonusPoints = leftoverMovesBonus(movesLeft);
      if (bonusPoints > 0) addScore(bonusPoints);
      const finalScore = scoreRef.current;
      const starsEarned = starsAwardedForVictory(finalScore, cfg.starThresholds);

      setVictoryInfo({ bonusPoints, starsEarned });
      setStarsCount((prev) => prev + starsEarned);
      setBestScore((prev) => Math.max(prev, finalScore));
      setUnlockedLevel((prev) => Math.max(prev, cfg.level + 1));
      setGameStatus('victory');
      setMascotMessage(
        bonusPoints > 0
          ? `PAWSOME VICTORY! ${movesLeft} spare moves = +${bonusPoints} bonus! 🏆⭐`
          : `PAWSOME VICTORY! You won ${starsEarned} bonus star${starsEarned > 1 ? 's' : ''}! 🏆⭐`
      );
      soundSynthesizer.playVictory();
      haptics.success();
      return;
    }

    if (movesLeft <= 0) {
      if (!hasUsedRescueRef.current) {
        hasUsedRescueRef.current = true;
        applyMoves(GAME_RULES.RESCUE_MOVES);
        setMascotMessage(`Magic Paw Boost! 🐾✨ Here are +${GAME_RULES.RESCUE_MOVES} extra moves!`);
        soundSynthesizer.playRescueBoost();
        haptics.success();
        setGameStatus('idle');
        return;
      }
      setBestScore((prev) => Math.max(prev, scoreRef.current));
      setGameStatus('game_over');
      setMascotMessage('Great try! Tap retry to play with your friends again! 💖');
      return;
    }

    setGameStatus('idle');
    if (movesLeft <= 5) {
      setMascotMessage(`Only ${movesLeft} moves left! Aim for big combos! 🐾`);
    } else {
      setMascotMessage('Great move! Select your next friend. 🦊🐼');
    }
  };

  /**
   * Cascade loop with child-friendly animal animations.
   * Abandons silently (without touching state) if a restart or unmount supersedes it.
   */
  const processCascades = useCallback(
    async (initialBoard: BoardGrid, runId: number, userMovePos?: Position) => {
      const pause = async (ms: number) => {
        await sleep(ms);
        return isRunAlive(runId);
      };

      setGameStatus('clearing');
      setHintPositions(null);

      let currentBoard = cloneBoard(initialBoard);
      let currentCombo = 0;

      while (true) {
        const matchResult = findMatches(currentBoard);
        if (!matchResult.hasMatches) {
          break;
        }

        currentCombo++;
        setCombo(currentCombo);
        setIsCelebrating(true);
        soundSynthesizer.playMatch(currentCombo);
        haptics.match(currentCombo);

        if (currentCombo >= 2) {
          const praise = PRAISE_MESSAGES[Math.min(currentCombo - 2, PRAISE_MESSAGES.length - 1)];
          setPraiseMessage(praise);
          setMascotMessage(`${praise} Combo x${currentCombo}! 🐾⭐`);
        } else {
          setMascotMessage('Yummy match! Animals are so happy! 💖');
        }

        // 1. Highlight matching tiles
        const keys = new Set(
          matchResult.matchedPositions.map((p) => `${p.row},${p.col}`)
        );
        setMatchedPosKeys(keys);
        if (!(await pause(240))) return;

        // 2. Clear matches and specials
        const clearRes = clearMatches(
          currentBoard,
          matchResult,
          currentCombo === 1 ? userMovePos : undefined
        );
        currentBoard = clearRes.newBoard;
        setBoard(cloneBoard(currentBoard));
        setMatchedPosKeys(new Set());

        // Play punchy, deep explosion sounds and special pattern audio triggers
        if (clearRes.activatedSpecials && clearRes.activatedSpecials.length > 0) {
          let hasExplosion = false;
          let maxIntensity = 1.0;

          for (const sp of clearRes.activatedSpecials) {
            if (sp === 'bee_copter') {
              soundSynthesizer.playBeeCopter();
            } else if (sp === 'star_wand') {
              soundSynthesizer.playStarWand();
            } else if (sp === 'royal_crown') {
              soundSynthesizer.playRoyalCrown();
            } else if (sp === 'wrapped') {
              hasExplosion = true;
              maxIntensity = Math.max(maxIntensity, 1.5);
            } else if (sp === 'striped_h' || sp === 'striped_v') {
              hasExplosion = true;
              maxIntensity = Math.max(maxIntensity, 1.2);
            } else if (sp === 'color_bomb') {
              hasExplosion = true;
              maxIntensity = Math.max(maxIntensity, 1.8);
              soundSynthesizer.playSpecialBlast();
            }
          }

          haptics.blast();
          if (hasExplosion) {
            soundSynthesizer.playExplosionPunch(maxIntensity);
          }
        } else if (currentCombo >= 3) {
          // Escalating sub-bass impact for high combo cascades
          soundSynthesizer.playExplosionPunch(1.0 + Math.min(1.0, (currentCombo - 3) * 0.25));
        }

        // Award animal treats (berries, honey, acorns, apples) to Barnaby's Sanctuary Basket
        const { newInventory, gathered } = calculateTreatDropsFromMatches(
          sanctuaryStateRef.current.treatsInventory,
          matchResult.groups,
          currentCombo
        );
        if (Object.keys(gathered).length > 0) {
          const updatedSanctuary = {
            ...sanctuaryStateRef.current,
            treatsInventory: newInventory,
          };
          sanctuaryStateRef.current = updatedSanctuary;
          setSanctuaryState(updatedSanctuary);

          if (currentCombo === 1) {
            const gatheredText = Object.entries(gathered)
              .map(([type, count]) => {
                const icon =
                  type === 'berries'
                    ? '🍓'
                    : type === 'honey'
                    ? '🍯'
                    : type === 'acorns'
                    ? '🌰'
                    : '🍎';
                return `+${count} ${icon}`;
              })
              .join(' ');
            setMascotMessage(`Barnaby gathered ${gatheredText} for his basket! 🐾`);
          }
        }

        // Score with combo multiplier
        const comboMultiplier = 1 + (currentCombo - 1) * 0.5;
        addScore(Math.round(clearRes.score * comboMultiplier));

        if (!(await pause(160))) return;

        // 3. Gravity and Refill
        setGameStatus('falling');
        const gravityRes = applyGravityAndRefill(currentBoard);
        currentBoard = gravityRes.newBoard;
        setBoard(cloneBoard(currentBoard));

        if (!(await pause(240))) return;
      }

      // Check if board has possible moves left
      if (!hasPossibleMoves(currentBoard)) {
        setMascotMessage('Animals need room to play! Shuffling... 🔄');
        if (!(await pause(700))) return;
        currentBoard = shuffleBoard(currentBoard);
        setBoard(cloneBoard(currentBoard));
        setMascotMessage('All ready! Pick your next friend! 🐾');
      }

      setCombo(0);
      setIsCelebrating(false);
      setPraiseMessage(null);
      busyRef.current = false;

      resolveTurnEnd();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  /**
   * Executes a swap between posA and posB
   */
  const executeSwap = useCallback(
    async (posA: Position, posB: Position) => {
      if (busyRef.current || gameStatus !== 'idle') return;

      if (!areAdjacent(posA, posB)) {
        setSelectedPos(posB);
        setMascotMessage('Picked a new friend! Tap an adjacent buddy to swap. 👆');
        resetIdleTimer();
        return;
      }

      // Lock synchronously so a duplicate touch/press event can't start a second swap.
      busyRef.current = true;
      const runId = runIdRef.current;
      const pause = async (ms: number) => {
        await sleep(ms);
        return isRunAlive(runId);
      };

      const valid = isValidSwap(board, posA, posB);

      if (!valid) {
        // Visual wobble feedback
        setGameStatus('swapping');
        const tempBoard = cloneBoard(board);
        const tA = tempBoard[posA.row][posA.col]!;
        const tB = tempBoard[posB.row][posB.col]!;
        tempBoard[posA.row][posA.col] = { ...tB, row: posA.row, col: posA.col };
        tempBoard[posB.row][posB.col] = { ...tA, row: posB.row, col: posB.col };
        setBoard(tempBoard);

        haptics.bump();
        setMascotMessage('No match there! Match 3 of the same friends! 🔄');
        if (!(await pause(200))) return;

        // Revert back
        setBoard(cloneBoard(board));
        setSelectedPos(null);
        setGameStatus('idle');
        busyRef.current = false;
        return;
      }

      // Valid swap!
      setSelectedPos(null);
      setGameStatus('swapping');
      setHintPositions(null);
      applyMoves(Math.max(0, movesRef.current - 1));

      // Special combos
      const specialCombo = resolveSpecialSwap(board, posA, posB);
      if (specialCombo) {
        setIsCelebrating(true);
        const tileA = board[posA.row][posA.col];
        const tileB = board[posB.row][posB.col];

        // Deep satisfying resonant explosion thump combined with celebratory fanfare
        soundSynthesizer.playExplosionPunch(1.8);
        soundSynthesizer.playSpecialBlast();
        haptics.blast();

        if (tileA?.special === 'bee_copter' || tileB?.special === 'bee_copter') {
          soundSynthesizer.playBeeCopter();
        }
        if (tileA?.special === 'star_wand' || tileB?.special === 'star_wand') {
          soundSynthesizer.playStarWand();
        }
        if (tileA?.special === 'royal_crown' || tileB?.special === 'royal_crown') {
          soundSynthesizer.playRoyalCrown();
        }

        setMascotMessage('PARTY CELEBRATION! 🎊🌈');

        const keys = new Set(
          specialCombo.clearedPositions.map((p) => `${p.row},${p.col}`)
        );
        setMatchedPosKeys(keys);
        if (!(await pause(300))) return;

        setBoard(cloneBoard(specialCombo.newBoard));
        setMatchedPosKeys(new Set());
        addScore(specialCombo.score);

        if (!(await pause(180))) return;
        setGameStatus('falling');
        const gravityRes = applyGravityAndRefill(specialCombo.newBoard);
        setBoard(cloneBoard(gravityRes.newBoard));
        if (!(await pause(250))) return;

        await processCascades(gravityRes.newBoard, runId, posB);
        return;
      }

      // Standard swap
      const newBoard = cloneBoard(board);
      const tileA = newBoard[posA.row][posA.col]!;
      const tileB = newBoard[posB.row][posB.col]!;

      newBoard[posA.row][posA.col] = { ...tileB, row: posA.row, col: posA.col };
      newBoard[posB.row][posB.col] = { ...tileA, row: posB.row, col: posB.col };

      setBoard(cloneBoard(newBoard));
      if (!(await pause(160))) return;

      await processCascades(newBoard, runId, posB);
    },
    [board, gameStatus, processCascades, resetIdleTimer]
  );

  const handleTilePress = useCallback(
    (row: number, col: number) => {
      if (busyRef.current || gameStatus !== 'idle') return;
      resetIdleTimer();
      soundSynthesizer.playTap();
      haptics.tap();

      if (!selectedPos) {
        setSelectedPos({ row, col });
        setMascotMessage('Friend selected! Tap an adjacent neighbor to swap. 👆');
      } else {
        if (selectedPos.row === row && selectedPos.col === col) {
          setSelectedPos(null);
          setMascotMessage('Tap any animal friend to pick it! 🐾');
        } else {
          executeSwap(selectedPos, { row, col });
        }
      }
    },
    [selectedPos, gameStatus, executeSwap, resetIdleTimer]
  );

  const handleSwipe = useCallback(
    (row: number, col: number, direction: 'up' | 'down' | 'left' | 'right') => {
      if (busyRef.current || gameStatus !== 'idle') return;
      resetIdleTimer();

      let targetRow = row;
      let targetCol = col;

      if (direction === 'up') targetRow--;
      if (direction === 'down') targetRow++;
      if (direction === 'left') targetCol--;
      if (direction === 'right') targetCol++;

      if (
        targetRow >= 0 &&
        targetRow < BOARD_ROWS &&
        targetCol >= 0 &&
        targetCol < BOARD_COLS
      ) {
        executeSwap({ row, col }, { row: targetRow, col: targetCol });
      }
    },
    [gameStatus, executeSwap, resetIdleTimer]
  );

  /** Starts a fresh round of the given level, cancelling any cascade in flight. */
  const startLevel = useCallback((targetLevel: number, message: string) => {
    const cfg = getLevelConfig(targetLevel);
    runIdRef.current += 1;
    busyRef.current = false;
    hasUsedRescueRef.current = false;
    scoreRef.current = 0;
    movesRef.current = cfg.moves;

    setLevel(cfg.level);
    setBoard(createInitialBoard());
    setSelectedPos(null);
    setMatchedPosKeys(new Set());
    setHintPositions(null);
    setMoves(cfg.moves);
    setScore(0);
    setCombo(0);
    setPraiseMessage(null);
    setIsCelebrating(false);
    setVictoryInfo({ bonusPoints: 0, starsEarned: 0 });
    setGameStatus('idle');
    setMascotMessage(message);
  }, []);

  const restartGame = useCallback(() => {
    soundSynthesizer.playTap();
    startLevel(levelConfigRef.current.level, 'Fresh animal meadow! Make your first move! 🦊');
  }, [startLevel]);

  const nextLevel = useCallback(() => {
    soundSynthesizer.playTap();
    const next = levelConfigRef.current.level + 1;
    startLevel(next, `Level ${next}! The meadow is bigger and brighter. Let's go! 🌈`);
  }, [startLevel]);

  // Feed Barnaby with collected treats from the metagame inventory
  const feedBarnaby = useCallback((treatType: TreatType) => {
    const res = feedBarnabyInState(sanctuaryStateRef.current, treatType);
    sanctuaryStateRef.current = res.newState;
    setSanctuaryState(res.newState);
    if (res.success) {
      setMascotMessage(res.message);
      if (res.leveledUp) {
        setIsCelebrating(true);
        setStarsCount((prevStars) => prevStars + 2); // Award bonus stars to spend on hats/capes!
        setTimeout(() => setIsCelebrating(false), 2000);
      }
    }
  }, []);

  // Pet or tickle Barnaby the Bear Cub
  const petBarnaby = useCallback(() => {
    const res = petBarnabyInState(sanctuaryStateRef.current);
    sanctuaryStateRef.current = res.newState;
    setSanctuaryState(res.newState);
    setMascotMessage(res.message);
    if (res.leveledUp) {
      setIsCelebrating(true);
      setStarsCount((prevStars) => prevStars + 2);
      setTimeout(() => setIsCelebrating(false), 2000);
    }
  }, []);

  // Restore saved progress once on launch.
  useEffect(() => {
    let cancelled = false;
    loadProgress().then((saved) => {
      if (cancelled) return;
      if (saved) {
        setStarsCount(saved.starsCount);
        setCurrentHat(saved.hat);
        setCurrentAccessory(saved.accessory);
        setBestScore(saved.bestScore);
        setUnlockedLevel(saved.level);
        sanctuaryStateRef.current = saved.sanctuary;
        setSanctuaryState(saved.sanctuary);
        // Resume at the highest unlocked level, but never yank a round already in progress.
        if (saved.level !== levelConfigRef.current.level && scoreRef.current === 0 && !busyRef.current) {
          startLevel(saved.level, `Welcome back! Ready for level ${saved.level}? 🐾`);
        } else if (saved.level === 1 && scoreRef.current === 0) {
          setMascotMessage('Welcome back, friend! Barnaby missed you! 🐻💖');
        }
      }
      setIsHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [startLevel]);

  // Debounced auto-save of long-term progress (never before hydration finished).
  useEffect(() => {
    if (!isHydrated) return;
    const id = setTimeout(() => {
      saveProgress({
        version: PROGRESS_VERSION,
        starsCount,
        hat: currentHat,
        accessory: currentAccessory,
        level: unlockedLevel,
        bestScore,
        sanctuary: sanctuaryState,
      });
    }, 400);
    return () => clearTimeout(id);
  }, [isHydrated, starsCount, currentHat, currentAccessory, unlockedLevel, bestScore, sanctuaryState]);

  return {
    board,
    selectedPos,
    matchedPosKeys,
    hintPositions,
    moves,
    score,
    level,
    targetScore: levelConfig.targetScore,
    starThresholds: levelConfig.starThresholds,
    bestScore,
    victoryInfo,
    isHydrated,
    combo,
    gameStatus,
    praiseMessage,
    mascotMessage,
    isCelebrating,
    starsCount,
    currentHat,
    currentAccessory,
    setCurrentHat,
    setCurrentAccessory,
    sanctuaryState,
    isSanctuaryOpen,
    setIsSanctuaryOpen,
    feedBarnaby,
    petBarnaby,
    handleTilePress,
    handleSwipe,
    restartGame,
    nextLevel,
  };
}
