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
  findFirstAvailableMove,
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

const PRAISE_MESSAGES = [
  'Sweet! 🐾',
  'Pawsome! 🌟',
  'Yummy Berries! 🍓',
  'Super Pet Power! ⚡',
  'Magic Star Rush! ✨',
];

export function useMatch3Game() {
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
  const [hasUsedRescue, setHasUsedRescue] = useState<boolean>(false);

  // Emotional Companion Pet Sanctuary State (Barnaby the Bear Cub)
  const [sanctuaryState, setSanctuaryState] = useState<PetSanctuaryState>(() =>
    createInitialSanctuaryState()
  );
  const sanctuaryStateRef = useRef<PetSanctuaryState>(sanctuaryState);
  const [isSanctuaryOpen, setIsSanctuaryOpen] = useState(false);

  const isResolvingRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Reset 4-second idle hint timer
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    setHintPositions(null);

    if (gameStatus === 'idle' && !isResolvingRef.current) {
      idleTimerRef.current = setTimeout(() => {
        const hint = findFirstAvailableMove(board);
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
   * Cascade loop with child-friendly animal animations
   */
  const processCascades = useCallback(
    async (initialBoard: BoardGrid, userMovePos?: Position) => {
      isResolvingRef.current = true;
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
        await sleep(240);

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
        const stepScore = Math.round(clearRes.score * comboMultiplier);
        setScore((prev) => prev + stepScore);

        await sleep(160);

        // 3. Gravity and Refill
        setGameStatus('falling');
        const gravityRes = applyGravityAndRefill(currentBoard);
        currentBoard = gravityRes.newBoard;
        setBoard(cloneBoard(currentBoard));

        await sleep(240);
      }

      // Check if board has possible moves left
      if (!hasPossibleMoves(currentBoard)) {
        setMascotMessage('Animals need room to play! Shuffling... 🔄');
        await sleep(700);
        currentBoard = shuffleBoard(currentBoard);
        setBoard(cloneBoard(currentBoard));
        setMascotMessage('All ready! Pick your next friend! 🐾');
      }

      setCombo(0);
      setIsCelebrating(false);
      setPraiseMessage(null);
      isResolvingRef.current = false;

      // Check game end conditions
      setMoves((currentMoves) => {
        if (currentMoves <= 0) {
          // Check if child gets friendly rescue boost
          if (!hasUsedRescue) {
            setHasUsedRescue(true);
            const rescueMoves = GAME_RULES.RESCUE_MOVES;
            setMascotMessage('Magic Paw Boost! 🐾✨ Here are +5 extra moves!');
            soundSynthesizer.playRescueBoost();
            setGameStatus('idle');
            return rescueMoves;
          }

          setScore((currentFinalScore) => {
            if (currentFinalScore >= GAME_RULES.TARGET_SCORE) {
              setGameStatus('victory');
              setStarsCount((prev) => prev + 2); // Award stars to spend in closet!
              setMascotMessage('PAWSOME VICTORY! You won 2 bonus stars! 🏆⭐');
              soundSynthesizer.playVictory();
            } else {
              setGameStatus('game_over');
              setMascotMessage('Great try! Tap retry to play with your friends again! 💖');
            }
            return currentFinalScore;
          });
          return 0;
        } else {
          setGameStatus('idle');
          if (currentMoves <= 5) {
            setMascotMessage(`Only ${currentMoves} moves left! Aim for big combos! 🐾`);
          } else {
            setMascotMessage('Great move! Select your next friend. 🦊🐼');
          }
          return currentMoves;
        }
      });
    },
    [hasUsedRescue]
  );

  /**
   * Executes a swap between posA and posB
   */
  const executeSwap = useCallback(
    async (posA: Position, posB: Position) => {
      if (isResolvingRef.current || gameStatus !== 'idle') return;

      if (!areAdjacent(posA, posB)) {
        setSelectedPos(posB);
        setMascotMessage('Picked a new friend! Tap an adjacent buddy to swap. 👆');
        resetIdleTimer();
        return;
      }

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

        setMascotMessage('No match there! Match 3 of the same friends! 🔄');
        await sleep(200);

        // Revert back
        setBoard(cloneBoard(board));
        setSelectedPos(null);
        setGameStatus('idle');
        resetIdleTimer();
        return;
      }

      // Valid swap!
      setSelectedPos(null);
      setGameStatus('swapping');
      setHintPositions(null);
      setMoves((prev) => Math.max(0, prev - 1));

      // Special combos
      const specialCombo = resolveSpecialSwap(board, posA, posB);
      if (specialCombo) {
        setIsCelebrating(true);
        const tileA = board[posA.row][posA.col];
        const tileB = board[posB.row][posB.col];

        // Deep satisfying resonant explosion thump combined with celebratory fanfare
        soundSynthesizer.playExplosionPunch(1.8);
        soundSynthesizer.playSpecialBlast();

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
        await sleep(300);

        setBoard(cloneBoard(specialCombo.newBoard));
        setMatchedPosKeys(new Set());
        setScore((prev) => prev + specialCombo.score);

        await sleep(180);
        setGameStatus('falling');
        const gravityRes = applyGravityAndRefill(specialCombo.newBoard);
        setBoard(cloneBoard(gravityRes.newBoard));
        await sleep(250);

        await processCascades(gravityRes.newBoard, posB);
        return;
      }

      // Standard swap
      const newBoard = cloneBoard(board);
      const tileA = newBoard[posA.row][posA.col]!;
      const tileB = newBoard[posB.row][posB.col]!;

      newBoard[posA.row][posA.col] = { ...tileB, row: posA.row, col: posA.col };
      newBoard[posB.row][posB.col] = { ...tileA, row: posB.row, col: posB.col };

      setBoard(cloneBoard(newBoard));
      await sleep(160);

      await processCascades(newBoard, posB);
    },
    [board, gameStatus, processCascades, resetIdleTimer]
  );

  const handleTilePress = useCallback(
    (row: number, col: number) => {
      if (isResolvingRef.current || gameStatus !== 'idle') return;
      resetIdleTimer();
      soundSynthesizer.playTap();

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
      if (isResolvingRef.current || gameStatus !== 'idle') return;
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

  const restartGame = useCallback(() => {
    soundSynthesizer.playTap();
    isResolvingRef.current = false;
    setBoard(createInitialBoard());
    setSelectedPos(null);
    setMatchedPosKeys(new Set());
    setHintPositions(null);
    setMoves(GAME_RULES.DEFAULT_MOVES);
    setScore(0);
    setCombo(0);
    setPraiseMessage(null);
    setIsCelebrating(false);
    setHasUsedRescue(false);
    setGameStatus('idle');
    setMascotMessage('Fresh animal meadow! Make your first move! 🦊');
  }, []);

  // Feed Barnaby with collected treats from the metagame inventory
  const feedBarnaby = useCallback((treatType: TreatType) => {
    setSanctuaryState((prev) => {
      const res = feedBarnabyInState(prev, treatType);
      if (res.success) {
        setMascotMessage(res.message);
        if (res.leveledUp) {
          setIsCelebrating(true);
          setStarsCount((prevStars) => prevStars + 2); // Award bonus stars to spend on hats/capes!
          setTimeout(() => setIsCelebrating(false), 2000);
        }
      }
      sanctuaryStateRef.current = res.newState;
      return res.newState;
    });
  }, []);

  // Pet or tickle Barnaby the Bear Cub
  const petBarnaby = useCallback(() => {
    setSanctuaryState((prev) => {
      const res = petBarnabyInState(prev);
      setMascotMessage(res.message);
      if (res.leveledUp) {
        setIsCelebrating(true);
        setStarsCount((prevStars) => prevStars + 2);
        setTimeout(() => setIsCelebrating(false), 2000);
      }
      sanctuaryStateRef.current = res.newState;
      return res.newState;
    });
  }, []);

  return {
    board,
    selectedPos,
    matchedPosKeys,
    hintPositions,
    moves,
    score,
    targetScore: GAME_RULES.TARGET_SCORE,
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
  };
}
