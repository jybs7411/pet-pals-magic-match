import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  GestureResponderEvent,
  Animated,
  Easing,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { BoardGrid, Position, SpecialType } from '../types/game';
import { BOARD_COLS, BOARD_ROWS, ANIMAL_THEMES } from '../constants/theme';
import { CandyPiece } from './CandyPiece';
import { ParticleSystem, BurstEvent } from './ParticleBurst';

interface BoardProps {
  board: BoardGrid;
  selectedPos: Position | null;
  matchedPosKeys: Set<string>;
  hintPositions?: [Position, Position] | null;
  onTilePress: (row: number, col: number) => void;
  onSwipe: (
    row: number,
    col: number,
    direction: 'up' | 'down' | 'left' | 'right'
  ) => void;
  disabled?: boolean;
  combo?: number;
  reduceMotion?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOARD_PADDING = 8;
const BOARD_BORDER = 3.5; // must match styles.boardContainer.borderWidth
const MAX_BOARD_WIDTH = 410;
const FRAME_OFFSET = 58; // wood bezel + inner rim + board padding around the grid
const MAX_ACTIVE_BURSTS = 36; // keeps low-end phones smooth during huge cascades
const MAX_ACTIVE_BURSTS_REDUCED = 6;

/** Tile size for a given window width; recomputed on rotation / split-screen / fold. */
export const computeTileSize = (windowWidth: number): number => {
  const available = Math.min(windowWidth - 20, MAX_BOARD_WIDTH) - FRAME_OFFSET;
  return Math.max(24, Math.floor((available - BOARD_PADDING * 2) / BOARD_COLS));
};
export const TILE_SIZE = computeTileSize(SCREEN_WIDTH);

// Helper for punchy floating score banners
const getCelebratoryLabel = (comboLevel: number, special?: SpecialType): string => {
  if (special === 'color_bomb') return 'RAINBOW BLAST!';
  if (special === 'wrapped') return 'HONEY SPLASH!';
  if (special === 'striped_h' || special === 'striped_v') return 'LINE BLAST!';
  if (comboLevel >= 5) return 'PAWESOME!';
  if (comboLevel === 4) return 'TASTY!';
  if (comboLevel === 3) return 'SUPER POP!';
  if (comboLevel === 2) return 'SWEET!';
  return 'POP!';
};

interface BoardCellProps {
  r: number;
  c: number;
  tile: BoardGrid[number][number];
  tileSize: number;
  isSelected: boolean;
  isNeighbor: boolean;
  isMatched: boolean;
  isHinted: boolean;
  disabled: boolean;
  onTouchStartCell: (r: number, c: number, e: GestureResponderEvent) => void;
  onTouchEndCell: (r: number, c: number, e: GestureResponderEvent) => void;
  onPressCell: (r: number, c: number) => void;
}

const SPECIAL_NAMES: Record<SpecialType, string> = {
  normal: '',
  striped_h: 'confetti popper, ',
  striped_v: 'confetti popper, ',
  wrapped: 'honey pot, ',
  color_bomb: 'rainbow butterfly, ',
  bee_copter: 'bee copter, ',
  star_wand: 'star wand, ',
  royal_crown: 'royal crown, ',
};

/** One grid cell. Memoised so a board update only re-renders cells that changed. */
const BoardCell = React.memo(
  ({
    r,
    c,
    tile,
    tileSize,
    isSelected,
    isNeighbor,
    isMatched,
    isHinted,
    disabled,
    onTouchStartCell,
    onTouchEndCell,
    onPressCell,
  }: BoardCellProps) => {
    const label = tile
      ? `${SPECIAL_NAMES[tile.special]}${ANIMAL_THEMES[tile.color].species} ${ANIMAL_THEMES[tile.color].name}, row ${r + 1}, column ${c + 1}${isHinted ? ', suggested move' : ''}`
      : `Empty space, row ${r + 1}, column ${c + 1}`;

    return (
      <Pressable
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint="Double tap to select, then double tap a neighbouring friend to swap"
        accessibilityState={{ selected: isSelected, disabled }}
        onTouchStart={(e: GestureResponderEvent) => onTouchStartCell(r, c, e)}
        onTouchEnd={(e: GestureResponderEvent) => onTouchEndCell(r, c, e)}
        onPress={() => onPressCell(r, c)}
        style={({ pressed }) => [
          styles.cellRecess,
          (r + c) % 2 === 0 ? styles.cellRecessLight : styles.cellRecessDark,
          isSelected && styles.cellRecessSelected,
          isNeighbor && styles.cellRecessNeighbor,
          isHinted && styles.cellRecessHinted,
          {
            width: tileSize,
            height: tileSize,
            opacity: pressed ? 0.82 : 1,
          },
        ]}
      >
        {/* Chiseled Woodgrain Inner Recess Shadow */}
        <View style={styles.recessInnerShadow} pointerEvents="none" />

        {tile && (
          <CandyPiece
            tile={tile}
            size={tileSize}
            isSelected={isSelected}
            isNeighborTarget={isNeighbor}
            isMatched={isMatched}
            isHinted={isHinted}
          />
        )}
      </Pressable>
    );
  },
  (prev, next) =>
    prev.tileSize === next.tileSize &&
    prev.isSelected === next.isSelected &&
    prev.isNeighbor === next.isNeighbor &&
    prev.isMatched === next.isMatched &&
    prev.isHinted === next.isHinted &&
    prev.disabled === next.disabled &&
    prev.onTouchStartCell === next.onTouchStartCell &&
    prev.onTouchEndCell === next.onTouchEndCell &&
    prev.onPressCell === next.onPressCell &&
    (prev.tile === next.tile ||
      (!!prev.tile &&
        !!next.tile &&
        prev.tile.id === next.tile.id &&
        prev.tile.color === next.tile.color &&
        prev.tile.special === next.tile.special &&
        prev.tile.row === next.tile.row &&
        prev.tile.col === next.tile.col))
);

export const Board: React.FC<BoardProps> = ({
  board,
  selectedPos,
  matchedPosKeys,
  hintPositions,
  onTilePress,
  onSwipe,
  disabled = false,
  combo = 1,
  reduceMotion = false,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const tileSize = computeTileSize(windowWidth);
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;
  // Touch devices fire both onTouchEnd and onPress for one gesture; handle it once.
  const touchHandledAtRef = useRef(0);
  // Track swipe touch coordinates per tile
  const touchStartMap = useRef<{ [key: string]: { x: number; y: number } }>({});

  // Active particle explosions state
  const [bursts, setBursts] = useState<BurstEvent[]>([]);
  const prevMatchedKeysRef = useRef<Set<string>>(new Set());

  // Damped sinusoidal spring screen-shake animation values
  const shakeOffset = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const shakeRot = useRef(new Animated.Value(0)).current;

  // Trigger damped sinusoidal spring screen shake with tactile punch on every match & combo
  const triggerScreenShake = useCallback((comboLevel: number) => {
    if (reduceMotion) return;
    // Amplitude scales with combo for visceral impact
    const shakeAmp = Math.min(18, 6.0 + comboLevel * 3.4);
    const rotAmp = Math.min(3.6, 1.2 + comboLevel * 0.65);
    const signX = Math.random() > 0.5 ? 1 : -1;
    const signY = Math.random() > 0.5 ? 1 : -1;
    const signR = Math.random() > 0.5 ? 1 : -1;

    // Damped sinusoidal spring sequence:
    // High-impact strike followed by exponential decay oscillations (rattles X, Y and rotation)
    Animated.sequence([
      // Cycle 0: Sudden detonation punch!
      Animated.parallel([
        Animated.timing(shakeOffset, {
          toValue: { x: signX * shakeAmp, y: signY * shakeAmp * 0.65 },
          duration: 30,
          easing: Easing.out(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(shakeRot, {
          toValue: signR * rotAmp,
          duration: 30,
          easing: Easing.out(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
      // Cycle 1: Strong sinusoidal rebound (decay ~0.68)
      Animated.parallel([
        Animated.timing(shakeOffset, {
          toValue: { x: -signX * shakeAmp * 0.68, y: -signY * shakeAmp * 0.45 },
          duration: 40,
          easing: Easing.linear,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(shakeRot, {
          toValue: -signR * rotAmp * 0.72,
          duration: 40,
          easing: Easing.linear,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
      // Cycle 2: Secondary sinusoidal rebound (decay ~0.44)
      Animated.parallel([
        Animated.timing(shakeOffset, {
          toValue: { x: signX * shakeAmp * 0.44, y: signY * shakeAmp * 0.28 },
          duration: 45,
          easing: Easing.linear,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(shakeRot, {
          toValue: signR * rotAmp * 0.48,
          duration: 45,
          easing: Easing.linear,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
      // Cycle 3: Tertiary sinusoidal oscillation (decay ~0.22)
      Animated.parallel([
        Animated.timing(shakeOffset, {
          toValue: { x: -signX * shakeAmp * 0.22, y: -signY * shakeAmp * 0.14 },
          duration: 50,
          easing: Easing.linear,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(shakeRot, {
          toValue: -signR * rotAmp * 0.24,
          duration: 50,
          easing: Easing.linear,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
      // Cycle 4: Micro-rattle settling (decay ~0.08)
      Animated.parallel([
        Animated.timing(shakeOffset, {
          toValue: { x: signX * shakeAmp * 0.08, y: signY * shakeAmp * 0.05 },
          duration: 55,
          easing: Easing.linear,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(shakeRot, {
          toValue: signR * rotAmp * 0.09,
          duration: 55,
          easing: Easing.linear,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
      // Rest: Smooth return to origin
      Animated.parallel([
        Animated.timing(shakeOffset, {
          toValue: { x: 0, y: 0 },
          duration: 55,
          easing: Easing.out(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(shakeRot, {
          toValue: 0,
          duration: 55,
          easing: Easing.out(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    ]).start();
  }, [shakeOffset, shakeRot, reduceMotion]);

  // Listen to matched tiles and trigger particle bursts from matched coordinates
  useEffect(() => {
    if (matchedPosKeys.size > 0) {
      const newKeys: string[] = [];
      matchedPosKeys.forEach((key) => {
        if (!prevMatchedKeysRef.current.has(key)) {
          newKeys.push(key);
        }
      });

      if (newKeys.length > 0) {
        // Trigger board tactile damped sinusoidal screen shake
        triggerScreenShake(combo);

        // Spawn particle bursts for each matched tile
        const newBursts: BurstEvent[] = newKeys.map((key) => {
          const [r, c] = key.split(',').map(Number);
          const tile = board[r]?.[c];
          const tileTheme = tile ? ANIMAL_THEMES[tile.color] : undefined;

          // Board coordinate center of the tile
          const x = BOARD_PADDING + c * tileSize + tileSize / 2;
          const y = BOARD_PADDING + r * tileSize + tileSize / 2;

          return {
            id: `burst_${r}_${c}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            x,
            y,
            color: tileTheme?.primaryColor || '#FFD700',
            accentColor: tileTheme?.accentColor || '#FF4081',
            species: tile?.color,
            special: tile?.special,
            combo,
            scorePoints: 60 * combo,
            label: getCelebratoryLabel(combo, tile?.special),
          };
        });

        const cap = reduceMotion ? MAX_ACTIVE_BURSTS_REDUCED : MAX_ACTIVE_BURSTS;
        setBursts((prev) => [...prev, ...newBursts].slice(-cap));
      }
    }
    prevMatchedKeysRef.current = new Set(matchedPosKeys);
  }, [matchedPosKeys, board, combo, triggerScreenShake, reduceMotion, tileSize]);

  // Clean up completed burst animations
  const handleBurstComplete = useCallback((id: string) => {
    setBursts((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const handleTouchStart = useCallback(
    (r: number, c: number, e: GestureResponderEvent) => {
      if (disabledRef.current) return;
      const { pageX, pageY } = e.nativeEvent;
      touchStartMap.current[`${r},${c}`] = { x: pageX, y: pageY };
    },
    []
  );

  const handleTouchEnd = useCallback(
    (r: number, c: number, e: GestureResponderEvent) => {
      if (disabledRef.current) return;
      const start = touchStartMap.current[`${r},${c}`];
      if (!start) return;
      delete touchStartMap.current[`${r},${c}`];
      touchHandledAtRef.current = Date.now();

      const { pageX, pageY } = e.nativeEvent;
      const dx = pageX - start.x;
      const dy = pageY - start.y;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      // If gesture moved more than 16px, trigger swipe
      if (absX > 16 || absY > 16) {
        if (absX > absY) {
          onSwipe(r, c, dx > 0 ? 'right' : 'left');
        } else {
          onSwipe(r, c, dy > 0 ? 'down' : 'up');
        }
      } else {
        // Standard tap
        onTilePress(r, c);
      }
    },
    [onSwipe, onTilePress]
  );

  // onPress covers mouse clicks and screen-reader activation; skip it when the
  // touch handlers already processed this same gesture (otherwise taps double-fire
  // and swipes also "select" the tile they started on).
  const handlePress = useCallback(
    (r: number, c: number) => {
      if (Date.now() - touchHandledAtRef.current < 400) return;
      onTilePress(r, c);
    },
    [onTilePress]
  );

  return (
    <View style={styles.boardWrapper}>
      {/* Gingerbread / Cookie Waffle Frame with Damped Sinusoidal Screen-Shake */}
      <Animated.View
        style={[
          styles.boardContainer,
          {
            // RN boxes are border-box: include the border or the last row/column is clipped.
            width: tileSize * BOARD_COLS + (BOARD_PADDING + BOARD_BORDER) * 2,
            height: tileSize * BOARD_ROWS + (BOARD_PADDING + BOARD_BORDER) * 2,
            padding: BOARD_PADDING,
            transform: [
              { translateX: shakeOffset.x },
              { translateY: shakeOffset.y },
              {
                rotate: shakeRot.interpolate({
                  inputRange: [-10, 0, 10],
                  outputRange: ['-10deg', '0deg', '10deg'],
                }),
              },
            ],
          },
        ]}
      >
        {board.map((rowArr, r) => (
          <View key={`row_${r}`} style={styles.row}>
            {rowArr.map((tile, c) => {
              const isSelected =
                selectedPos?.row === r && selectedPos?.col === c;

              // Check if this tile is an adjacent neighbor to the currently selected tile
              const isNeighbor =
                !!selectedPos &&
                ((Math.abs(selectedPos.row - r) === 1 && selectedPos.col === c) ||
                  (Math.abs(selectedPos.col - c) === 1 && selectedPos.row === r));

              const isMatched = matchedPosKeys.has(`${r},${c}`);
              const isHinted = !!hintPositions?.some(
                (p) => p.row === r && p.col === c
              );

              return (
                <BoardCell
                  key={tile ? tile.id : `empty_${r}_${c}`}
                  r={r}
                  c={c}
                  tile={tile}
                  tileSize={tileSize}
                  isSelected={isSelected}
                  isNeighbor={isNeighbor}
                  isMatched={isMatched}
                  isHinted={isHinted}
                  disabled={disabled}
                  onTouchStartCell={handleTouchStart}
                  onTouchEndCell={handleTouchEnd}
                  onPressCell={handlePress}
                />
              );
            })}
          </View>
        ))}

        {/* High-Performance Particle Burst Overlay */}
        <ParticleSystem
          bursts={bursts}
          onBurstComplete={handleBurstComplete}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  boardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  boardContainer: {
    backgroundColor: '#4E2A0E', // Rich honey-amber hardwood
    borderRadius: 20,
    borderWidth: BOARD_BORDER,
    borderTopColor: '#C28854', // Honey wood bevel highlight
    borderLeftColor: '#A26F3E',
    borderBottomColor: '#281305', // Deep chiseled underside
    borderRightColor: '#3D1C07',
    position: 'relative',
    ...Platform.select({
      web: {
        boxShadow:
          'inset 0 4px 14px rgba(18, 9, 3, 0.8), 0 10px 24px rgba(45, 22, 7, 0.55)',
      },
      default: {
        shadowColor: '#281305',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 8,
      },
    }),
  },
  row: {
    flexDirection: 'row',
  },
  cellRecess: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    margin: 1,
    borderWidth: 1.5,
    borderTopColor: 'rgba(255, 224, 130, 0.32)',
    borderLeftColor: 'rgba(255, 224, 130, 0.24)',
    borderBottomColor: '#261205',
    borderRightColor: '#2C1506',
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow:
          'inset 0 3px 6px rgba(18, 9, 3, 0.75), inset 0 1px 2px rgba(0, 0, 0, 0.6), 0 1px 1px rgba(255, 235, 170, 0.18)',
      },
    }),
  },
  cellRecessLight: {
    backgroundColor: '#583013', // Warm honey oak recess
  },
  cellRecessDark: {
    backgroundColor: '#40200A', // Deep amber walnut recess
  },
  cellRecessSelected: {
    borderColor: '#FFD700',
    borderWidth: 2,
    backgroundColor: 'rgba(255, 215, 0, 0.26)',
    ...Platform.select({
      web: {
        boxShadow:
          '0 0 12px rgba(255, 215, 0, 0.85), inset 0 0 8px rgba(255, 215, 0, 0.4)',
      },
      default: {
        shadowColor: '#FFD700',
        shadowOpacity: 0.9,
        shadowRadius: 8,
      },
    }),
  },
  cellRecessNeighbor: {
    borderColor: '#00E676',
    borderWidth: 1.8,
    backgroundColor: 'rgba(0, 230, 118, 0.2)',
    ...Platform.select({
      web: {
        boxShadow:
          '0 0 8px rgba(0, 230, 118, 0.65), inset 0 0 5px rgba(0, 230, 118, 0.3)',
      },
    }),
  },
  cellRecessHinted: {
    borderColor: '#FFF59D',
    borderWidth: 2,
    backgroundColor: 'rgba(255, 235, 59, 0.28)',
    ...Platform.select({
      web: {
        boxShadow:
          '0 0 10px rgba(255, 235, 59, 0.8), inset 0 0 6px rgba(255, 235, 59, 0.35)',
      },
    }),
  },
  recessInnerShadow: {
    ...StyleSheet.absoluteFill,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(30, 15, 5, 0.4)',
  },
});
