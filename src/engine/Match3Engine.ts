import {
  BOARD_ROWS,
  BOARD_COLS,
  CANDY_COLORS,
  GAME_RULES,
} from '../constants/theme';
import {
  BoardGrid,
  CandyColor,
  MatchGroup,
  Position,
  SpecialType,
  Tile,
} from '../types/game';

let idCounter = 0;
export function generateTileId(): string {
  idCounter += 1;
  return `tile_${Date.now()}_${idCounter}_${Math.random().toString(36).substring(2, 7)}`;
}

export function createRandomTile(
  row: number,
  col: number,
  colorPool: CandyColor[] = CANDY_COLORS,
  special: SpecialType = 'normal'
): Tile {
  const color = colorPool[Math.floor(Math.random() * colorPool.length)];
  return {
    id: generateTileId(),
    color,
    special,
    row,
    col,
  };
}

export function cloneBoard(board: BoardGrid): BoardGrid {
  return board.map((row) =>
    row.map((tile) => (tile ? { ...tile } : null))
  );
}

export function areAdjacent(p1: Position, p2: Position): boolean {
  const dr = Math.abs(p1.row - p2.row);
  const dc = Math.abs(p1.col - p2.col);
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
}

/**
 * Creates an initial 8x8 board with NO 3-in-a-row matches,
 * guaranteed to have at least one valid move available.
 */
export function createInitialBoard(
  rows: number = BOARD_ROWS,
  cols: number = BOARD_COLS
): BoardGrid {
  let board: BoardGrid;
  let attempts = 0;

  do {
    board = [];
    for (let r = 0; r < rows; r++) {
      const row: (Tile | null)[] = [];
      for (let c = 0; c < cols; c++) {
        const forbiddenColors: CandyColor[] = [];

        // Check horizontal left
        if (c >= 2) {
          const left1 = row[c - 1]?.color;
          const left2 = row[c - 2]?.color;
          if (left1 && left1 === left2) {
            forbiddenColors.push(left1);
          }
        }

        // Check vertical above
        if (r >= 2) {
          const above1 = board[r - 1][c]?.color;
          const above2 = board[r - 2][c]?.color;
          if (above1 && above1 === above2) {
            forbiddenColors.push(above1);
          }
        }

        // Check 2x2 square (top-left, top, left)
        if (r >= 1 && c >= 1) {
          const diag = board[r - 1][c - 1]?.color;
          const above = board[r - 1][c]?.color;
          const left = row[c - 1]?.color;
          if (diag && diag === above && diag === left) {
            forbiddenColors.push(diag);
          }
        }

        const allowedColors = CANDY_COLORS.filter(
          (color) => !forbiddenColors.includes(color)
        );

        const tile = createRandomTile(
          r,
          c,
          allowedColors.length > 0 ? allowedColors : CANDY_COLORS
        );
        row.push(tile);
      }
      board.push(row);
    }
    attempts++;
  } while (!hasPossibleMoves(board) && attempts < 25);

  return board;
}

export interface MatchAnalysis {
  matchedPositions: Position[];
  groups: MatchGroup[];
  hasMatches: boolean;
}

/**
 * Scans the board for all revolutionary match patterns:
 * - 2x2 Square ("Pet Nest")
 * - Cross (+) Shape (4-way intersection)
 * - T-Shape & L-Shape (2 or 3-way intersection)
 * - 6+ Mega Line
 * - 5 in a line
 * - 4 in a line (H/V)
 * - 3 in a line (H/V)
 */
export function findMatches(board: BoardGrid): MatchAnalysis {
  const rows = board.length;
  const cols = board[0].length;
  const matchedSet = new Set<string>();
  const groups: MatchGroup[] = [];

  const posKey = (r: number, c: number) => `${r},${c}`;

  interface LineRun {
    tiles: Position[];
    color: CandyColor;
    orientation: 'h' | 'v';
    rowOrCol: number;
    start: number;
    end: number;
    length: number;
    merged: boolean;
  }

  const hRuns: LineRun[] = [];
  const vRuns: LineRun[] = [];

  // 1. Horizontal scan
  for (let r = 0; r < rows; r++) {
    let matchLength = 1;
    for (let c = 0; c < cols; c++) {
      const current = board[r][c];
      const next = c + 1 < cols ? board[r][c + 1] : null;

      if (
        current &&
        next &&
        current.color === next.color &&
        current.special !== 'color_bomb' &&
        current.special !== 'royal_crown' &&
        next.special !== 'color_bomb' &&
        next.special !== 'royal_crown'
      ) {
        matchLength++;
      } else {
        if (matchLength >= 3 && current) {
          const runTiles: Position[] = [];
          for (let i = 0; i < matchLength; i++) {
            const colIdx = c - i;
            runTiles.push({ row: r, col: colIdx });
          }
          runTiles.reverse();
          hRuns.push({
            tiles: runTiles,
            color: current.color,
            orientation: 'h',
            rowOrCol: r,
            start: c - matchLength + 1,
            end: c,
            length: matchLength,
            merged: false,
          });
        }
        matchLength = 1;
      }
    }
  }

  // 2. Vertical scan
  for (let c = 0; c < cols; c++) {
    let matchLength = 1;
    for (let r = 0; r < rows; r++) {
      const current = board[r][c];
      const next = r + 1 < rows ? board[r + 1][c] : null;

      if (
        current &&
        next &&
        current.color === next.color &&
        current.special !== 'color_bomb' &&
        current.special !== 'royal_crown' &&
        next.special !== 'color_bomb' &&
        next.special !== 'royal_crown'
      ) {
        matchLength++;
      } else {
        if (matchLength >= 3 && current) {
          const runTiles: Position[] = [];
          for (let i = 0; i < matchLength; i++) {
            const rowIdx = r - i;
            runTiles.push({ row: rowIdx, col: c });
          }
          runTiles.reverse();
          vRuns.push({
            tiles: runTiles,
            color: current.color,
            orientation: 'v',
            rowOrCol: c,
            start: r - matchLength + 1,
            end: r,
            length: matchLength,
            merged: false,
          });
        }
        matchLength = 1;
      }
    }
  }

  // 3. Detect Intersections between Horizontal and Vertical runs (Cross vs T/L shape)
  for (const hr of hRuns) {
    for (const vr of vRuns) {
      if (hr.color !== vr.color) continue;
      // Mega lines (6+) maintain their own royal crown group
      if (hr.length >= 6 || vr.length >= 6) continue;

      const interRow = hr.rowOrCol;
      const interCol = vr.rowOrCol;

      // Check if they intersect at (interRow, interCol)
      if (
        interCol >= hr.start &&
        interCol <= hr.end &&
        interRow >= vr.start &&
        interRow <= vr.end
      ) {
        hr.merged = true;
        vr.merged = true;

        const hasLeft = interCol > hr.start;
        const hasRight = interCol < hr.end;
        const hasUp = interRow > vr.start;
        const hasDown = interRow < vr.end;

        const arms =
          (hasLeft ? 1 : 0) +
          (hasRight ? 1 : 0) +
          (hasUp ? 1 : 0) +
          (hasDown ? 1 : 0);

        const tileMap = new Map<string, Position>();
        for (const t of hr.tiles) tileMap.set(posKey(t.row, t.col), t);
        for (const t of vr.tiles) tileMap.set(posKey(t.row, t.col), t);
        const combinedTiles = Array.from(tileMap.values());

        combinedTiles.forEach((p) => matchedSet.add(posKey(p.row, p.col)));

        if (arms === 4) {
          // Cross (+) Shape
          groups.push({
            tiles: combinedTiles,
            color: hr.color,
            type: 'intersect_cross',
            origin: { row: interRow, col: interCol },
          });
        } else {
          // T-Shape or L-Shape
          groups.push({
            tiles: combinedTiles,
            color: hr.color,
            type: 'intersect_t_l',
            origin: { row: interRow, col: interCol },
          });
        }
      }
    }
  }

  // 4. Add unmerged horizontal runs
  for (const hr of hRuns) {
    if (hr.merged) continue;
    hr.tiles.forEach((p) => matchedSet.add(posKey(p.row, p.col)));

    let type: MatchGroup['type'] = 'line3';
    if (hr.length >= 6) type = 'line6_plus';
    else if (hr.length === 5) type = 'line5';
    else if (hr.length === 4) type = 'line4_h';

    groups.push({
      tiles: hr.tiles,
      color: hr.color,
      type,
    });
  }

  // 5. Add unmerged vertical runs
  for (const vr of vRuns) {
    if (vr.merged) continue;
    vr.tiles.forEach((p) => matchedSet.add(posKey(p.row, p.col)));

    let type: MatchGroup['type'] = 'line3';
    if (vr.length >= 6) type = 'line6_plus';
    else if (vr.length === 5) type = 'line5';
    else if (vr.length === 4) type = 'line4_v';

    groups.push({
      tiles: vr.tiles,
      color: vr.color,
      type,
    });
  }

  // 6. Detect 2x2 Square Matches ("Pet Nest")
  const squareTilesUsed = new Set<string>();

  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const t00 = board[r][c];
      const t01 = board[r][c + 1];
      const t10 = board[r + 1][c];
      const t11 = board[r + 1][c + 1];

      if (
        t00 &&
        t01 &&
        t10 &&
        t11 &&
        t00.color === t01.color &&
        t00.color === t10.color &&
        t00.color === t11.color &&
        t00.special !== 'color_bomb' &&
        t00.special !== 'royal_crown' &&
        t01.special !== 'color_bomb' &&
        t01.special !== 'royal_crown' &&
        t10.special !== 'color_bomb' &&
        t10.special !== 'royal_crown' &&
        t11.special !== 'color_bomb' &&
        t11.special !== 'royal_crown'
      ) {
        const k00 = posKey(r, c);
        const k01 = posKey(r, c + 1);
        const k10 = posKey(r + 1, c);
        const k11 = posKey(r + 1, c + 1);

        if (
          !squareTilesUsed.has(k00) ||
          !squareTilesUsed.has(k01) ||
          !squareTilesUsed.has(k10) ||
          !squareTilesUsed.has(k11)
        ) {
          const sqTiles: Position[] = [
            { row: r, col: c },
            { row: r, col: c + 1 },
            { row: r + 1, col: c },
            { row: r + 1, col: c + 1 },
          ];

          sqTiles.forEach((p) => {
            matchedSet.add(posKey(p.row, p.col));
            squareTilesUsed.add(posKey(p.row, p.col));
          });

          groups.push({
            tiles: sqTiles,
            color: t00.color,
            type: 'square_2x2',
            origin: { row: r, col: c },
          });
        }
      }
    }
  }

  const matchedPositions: Position[] = Array.from(matchedSet).map((key) => {
    const [row, col] = key.split(',').map(Number);
    return { row, col };
  });

  return {
    matchedPositions,
    groups,
    hasMatches: matchedPositions.length > 0,
  };
}

/**
 * Validates whether swapping posA and posB produces at least one match,
 * or if either tile is a special tile capable of an active trigger.
 */
export function isValidSwap(
  board: BoardGrid,
  posA: Position,
  posB: Position
): boolean {
  if (!areAdjacent(posA, posB)) return false;

  const tileA = board[posA.row][posA.col];
  const tileB = board[posB.row][posB.col];

  if (!tileA || !tileB) return false;

  // Active specials (Color Bomb, Royal Crown, Bee Copter, Star Wand) swapped with ANY candy is always valid
  if (
    tileA.special === 'color_bomb' ||
    tileB.special === 'color_bomb' ||
    tileA.special === 'royal_crown' ||
    tileB.special === 'royal_crown' ||
    tileA.special === 'bee_copter' ||
    tileB.special === 'bee_copter' ||
    tileA.special === 'star_wand' ||
    tileB.special === 'star_wand'
  ) {
    return true;
  }

  // Two special candies swapped together is always valid
  if (tileA.special !== 'normal' && tileB.special !== 'normal') {
    return true;
  }

  // Simulate swap
  const testBoard = cloneBoard(board);
  testBoard[posA.row][posA.col] = { ...tileB, row: posA.row, col: posA.col };
  testBoard[posB.row][posB.col] = { ...tileA, row: posB.row, col: posB.col };

  const { hasMatches } = findMatches(testBoard);
  return hasMatches;
}

/**
 * Checks if there exists ANY possible valid swap on the current board.
 */
export function hasPossibleMoves(board: BoardGrid): boolean {
  const rows = board.length;
  const cols = board[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const currentPos: Position = { row: r, col: c };

      // Try swap Right
      if (c + 1 < cols) {
        if (isValidSwap(board, currentPos, { row: r, col: c + 1 })) {
          return true;
        }
      }

      // Try swap Down
      if (r + 1 < rows) {
        if (isValidSwap(board, currentPos, { row: r + 1, col: c })) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Finds the first valid swap to illuminate a gentle hint for kids
 */
export function findFirstAvailableMove(
  board: BoardGrid
): [Position, Position] | null {
  const rows = board.length;
  const cols = board[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const currentPos: Position = { row: r, col: c };

      if (c + 1 < cols) {
        const rightPos = { row: r, col: c + 1 };
        if (isValidSwap(board, currentPos, rightPos)) {
          return [currentPos, rightPos];
        }
      }

      if (r + 1 < rows) {
        const downPos = { row: r + 1, col: c };
        if (isValidSwap(board, currentPos, downPos)) {
          return [currentPos, downPos];
        }
      }
    }
  }

  return null;
}

/**
 * Milestone 2: Resolves special candy combinations when directly swapped.
 */
export function resolveSpecialSwap(
  board: BoardGrid,
  posA: Position,
  posB: Position
): { newBoard: BoardGrid; clearedPositions: Position[]; score: number } | null {
  const tileA = board[posA.row][posA.col];
  const tileB = board[posB.row][posB.col];
  if (!tileA || !tileB) return null;

  const rows = board.length;
  const cols = board[0].length;
  const clearedSet = new Set<string>();
  const addPos = (r: number, c: number) => {
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      clearedSet.add(`${r},${c}`);
    }
  };

  const addDiagonals = (centerR: number, centerC: number) => {
    const maxDim = Math.max(rows, cols);
    for (let offset = -maxDim; offset <= maxDim; offset++) {
      addPos(centerR + offset, centerC + offset);
      addPos(centerR + offset, centerC - offset);
    }
  };

  const addRowCol = (r: number, c: number) => {
    for (let colIdx = 0; colIdx < cols; colIdx++) addPos(r, colIdx);
    for (let rowIdx = 0; rowIdx < rows; rowIdx++) addPos(rowIdx, c);
  };

  const add3x3 = (centerR: number, centerC: number) => {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        addPos(centerR + dr, centerC + dc);
      }
    }
  };

  const getCandidates = (): Position[] => {
    const list: Position[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (board[r][c] !== null && !clearedSet.has(`${r},${c}`)) {
          list.push({ row: r, col: c });
        }
      }
    }
    return list;
  };

  const isCrownA = tileA.special === 'royal_crown';
  const isCrownB = tileB.special === 'royal_crown';
  const isColorBombA = tileA.special === 'color_bomb';
  const isColorBombB = tileB.special === 'color_bomb';
  const isStarWandA = tileA.special === 'star_wand';
  const isStarWandB = tileB.special === 'star_wand';
  const isBeeCopterA = tileA.special === 'bee_copter';
  const isBeeCopterB = tileB.special === 'bee_copter';
  const isStripedA = tileA.special === 'striped_h' || tileA.special === 'striped_v';
  const isStripedB = tileB.special === 'striped_h' || tileB.special === 'striped_v';
  const isWrappedA = tileA.special === 'wrapped';
  const isWrappedB = tileB.special === 'wrapped';

  // Always include swapped tiles
  addPos(posA.row, posA.col);
  addPos(posB.row, posB.col);

  // 1. Royal Crown Combos
  if (isCrownA || isCrownB) {
    if (
      (isCrownA && isCrownB) ||
      (isCrownA && isColorBombB) ||
      (isColorBombA && isCrownB)
    ) {
      // Clears entire board!
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) addPos(r, c);
      }
    } else {
      // Clears TWO entire animal species at once!
      const partner = isCrownA ? tileB : tileA;
      const targetSpecies1 = partner.color;

      const speciesCounts: Partial<Record<CandyColor, number>> = {};
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const t = board[r][c];
          if (t && t.color !== targetSpecies1) {
            speciesCounts[t.color] = (speciesCounts[t.color] || 0) + 1;
          }
        }
      }
      let targetSpecies2: CandyColor | null = null;
      let maxC = -1;
      for (const [sColor, count] of Object.entries(speciesCounts)) {
        if ((count as number) > maxC) {
          maxC = count as number;
          targetSpecies2 = sColor as CandyColor;
        }
      }

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const t = board[r][c];
          if (t && (t.color === targetSpecies1 || (targetSpecies2 && t.color === targetSpecies2))) {
            addPos(r, c);
          }
        }
      }

      if (partner.special === 'star_wand') {
        addDiagonals(posB.row, posB.col);
      } else if (partner.special === 'striped_h' || partner.special === 'striped_v') {
        addRowCol(posB.row, posB.col);
      } else if (partner.special === 'wrapped') {
        add3x3(posB.row, posB.col);
      } else if (partner.special === 'bee_copter') {
        const cands = getCandidates();
        if (cands.length > 0) {
          const trg = cands[Math.floor(Math.random() * cands.length)];
          add3x3(trg.row, trg.col);
        }
      }
    }
  }
  // 2. Color Bomb Combos
  else if (isColorBombA || isColorBombB) {
    if (isColorBombA && isColorBombB) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) addPos(r, c);
      }
    } else {
      const partner = isColorBombA ? tileB : tileA;
      const targetColor = partner.color;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (board[r][c]?.color === targetColor) {
            addPos(r, c);
            if (partner.special === 'star_wand') {
              addDiagonals(r, c);
            } else if (partner.special === 'striped_h' || partner.special === 'striped_v') {
              addRowCol(r, c);
            } else if (partner.special === 'wrapped') {
              add3x3(r, c);
            }
          }
        }
      }

      if (partner.special === 'bee_copter') {
        for (let k = 0; k < 3; k++) {
          const cands = getCandidates();
          if (cands.length > 0) {
            const trg = cands[Math.floor(Math.random() * cands.length)];
            add3x3(trg.row, trg.col);
          }
        }
      }
    }
  }
  // 3. Star Wand Combos
  else if (isStarWandA || isStarWandB) {
    if (isStarWandA && isStarWandB) {
      addDiagonals(posA.row, posA.col);
      addDiagonals(posB.row, posB.col);
      addRowCol(posB.row, posB.col);
    } else if (isStripedA || isStripedB) {
      addDiagonals(posB.row, posB.col);
      addRowCol(posB.row, posB.col);
    } else if (isWrappedA || isWrappedB) {
      const maxDim = Math.max(rows, cols);
      for (let offset = -maxDim; offset <= maxDim; offset++) {
        for (let w = -1; w <= 1; w++) {
          addPos(posB.row + offset + w, posB.col + offset);
          addPos(posB.row + offset, posB.col - offset + w);
        }
      }
    } else if (isBeeCopterA || isBeeCopterB) {
      const cands = getCandidates();
      const trg = cands.length > 0 ? cands[Math.floor(Math.random() * cands.length)] : posB;
      addDiagonals(trg.row, trg.col);
    } else {
      addDiagonals(posB.row, posB.col);
    }
  }
  // 4. Bee Copter Combos
  else if (isBeeCopterA || isBeeCopterB) {
    if (isBeeCopterA && isBeeCopterB) {
      const cands1 = getCandidates();
      if (cands1.length > 0) {
        const trg1 = cands1[Math.floor(Math.random() * cands1.length)];
        add3x3(trg1.row, trg1.col);
      }
      const cands2 = getCandidates();
      if (cands2.length > 0) {
        const trg2 = cands2[Math.floor(Math.random() * cands2.length)];
        add3x3(trg2.row, trg2.col);
      }
    } else if (isStripedA || isStripedB) {
      const cands = getCandidates();
      const trg = cands.length > 0 ? cands[Math.floor(Math.random() * cands.length)] : posB;
      addRowCol(trg.row, trg.col);
    } else if (isWrappedA || isWrappedB) {
      const cands = getCandidates();
      const trg = cands.length > 0 ? cands[Math.floor(Math.random() * cands.length)] : posB;
      add3x3(trg.row, trg.col);
    } else {
      const cands = getCandidates();
      if (cands.length > 0) {
        const trg = cands[Math.floor(Math.random() * cands.length)];
        addPos(trg.row, trg.col);
        addPos(trg.row - 1, trg.col);
        addPos(trg.row + 1, trg.col);
        addPos(trg.row, trg.col - 1);
        addPos(trg.row, trg.col + 1);
      }
    }
  }
  // 5. Two Striped Candies swapped: Cross Blast
  else if (isStripedA && isStripedB) {
    addRowCol(posB.row, posB.col);
  }
  // 6. Striped + Wrapped: 3 rows and 3 columns
  else if (
    (isStripedA && isWrappedB) ||
    (isStripedB && isWrappedA)
  ) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let c = 0; c < cols; c++) addPos(posB.row + dr, c);
    }
    for (let dc = -1; dc <= 1; dc++) {
      for (let r = 0; r < rows; r++) addPos(r, posB.col + dc);
    }
  }
  // 7. Two Wrapped Candies: Giant 5x5 explosion
  else if (isWrappedA && isWrappedB) {
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        addPos(posB.row + dr, posB.col + dc);
      }
    }
  } else if (tileA.special !== 'normal' && tileB.special !== 'normal') {
    addRowCol(posB.row, posB.col);
    add3x3(posB.row, posB.col);
  } else {
    return null; // Not a special combo swap
  }

  const clearedPositions = Array.from(clearedSet).map((key) => {
    const [row, col] = key.split(',').map(Number);
    return { row, col };
  });

  const newBoard = cloneBoard(board);
  clearedPositions.forEach(({ row, col }) => {
    newBoard[row][col] = null;
  });

  const score = clearedPositions.length * GAME_RULES.BASE_POINTS_PER_TILE * 2;
  return { newBoard, clearedPositions, score };
}

export interface ClearResult {
  newBoard: BoardGrid;
  clearedTileIds: string[];
  score: number;
  activatedSpecials?: SpecialType[];
}

/**
 * Removes matched tiles, activates special candy blasts recursively,
 * and creates new special candies for 4/5 runs.
 */
export function clearMatches(
  board: BoardGrid,
  matches: MatchAnalysis,
  userInteractedPos?: Position
): ClearResult {
  const rows = board.length;
  const cols = board[0].length;
  const newBoard = cloneBoard(board);
  const clearedSet = new Set<string>();

  const addPos = (r: number, c: number) => {
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      clearedSet.add(`${r},${c}`);
    }
  };

  // Add initial matched positions
  matches.matchedPositions.forEach((p) => addPos(p.row, p.col));

  // Determine specials to spawn
  const specialsToSpawn: { pos: Position; special: SpecialType; color: CandyColor }[] = [];

  matches.groups.forEach((group) => {
    let spawnCoord = group.tiles[Math.floor(group.tiles.length / 2)];
    if (group.origin) {
      spawnCoord = group.origin;
    }
    if (userInteractedPos) {
      const matchInGroup = group.tiles.find(
        (p) => p.row === userInteractedPos.row && p.col === userInteractedPos.col
      );
      if (matchInGroup) spawnCoord = matchInGroup;
    }

    if (group.type === 'square_2x2') {
      specialsToSpawn.push({
        pos: spawnCoord,
        special: 'bee_copter',
        color: group.color,
      });
    } else if (group.type === 'intersect_cross') {
      specialsToSpawn.push({
        pos: spawnCoord,
        special: 'star_wand',
        color: group.color,
      });
    } else if (group.type === 'intersect_t_l') {
      specialsToSpawn.push({
        pos: spawnCoord,
        special: 'wrapped',
        color: group.color,
      });
    } else if (group.type === 'line6_plus') {
      specialsToSpawn.push({
        pos: spawnCoord,
        special: 'royal_crown',
        color: group.color,
      });
    } else if (group.type === 'line5') {
      specialsToSpawn.push({
        pos: spawnCoord,
        special: 'color_bomb',
        color: group.color,
      });
    } else if (group.type === 'line4_h') {
      specialsToSpawn.push({
        pos: spawnCoord,
        special: 'striped_v', // clears column on vertical blast
        color: group.color,
      });
    } else if (group.type === 'line4_v') {
      specialsToSpawn.push({
        pos: spawnCoord,
        special: 'striped_h', // clears row on horizontal blast
        color: group.color,
      });
    }
  });

  // Check if any matched tile is an existing Special Candy and trigger blast
  const processedSpecials = new Set<string>();
  const activatedSpecials: SpecialType[] = [];
  const toProcess = Array.from(clearedSet);

  while (toProcess.length > 0) {
    const key = toProcess.pop()!;
    if (processedSpecials.has(key)) continue;
    processedSpecials.add(key);

    const [r, c] = key.split(',').map(Number);
    const tile = board[r][c];
    if (!tile) continue;

    if (tile.special !== 'normal') {
      activatedSpecials.push(tile.special);
    }

    if (tile.special === 'striped_h') {
      for (let colIdx = 0; colIdx < cols; colIdx++) {
        const newKey = `${r},${colIdx}`;
        if (!clearedSet.has(newKey)) {
          clearedSet.add(newKey);
          toProcess.push(newKey);
        }
      }
    } else if (tile.special === 'striped_v') {
      for (let rowIdx = 0; rowIdx < rows; rowIdx++) {
        const newKey = `${rowIdx},${c}`;
        if (!clearedSet.has(newKey)) {
          clearedSet.add(newKey);
          toProcess.push(newKey);
        }
      }
    } else if (tile.special === 'wrapped') {
      // Honey Bomb Splash Pot: Double 3x3 blast
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const newKey = `${r + dr},${c + dc}`;
          if (r + dr >= 0 && r + dr < rows && c + dc >= 0 && c + dc < cols) {
            if (!clearedSet.has(newKey)) {
              clearedSet.add(newKey);
              toProcess.push(newKey);
            }
          }
        }
      }
    } else if (tile.special === 'star_wand') {
      // Star Wand: fires diagonal 'X' beams clearing both diagonals across the entire board!
      const maxDim = Math.max(rows, cols);
      for (let offset = -maxDim; offset <= maxDim; offset++) {
        const d1r = r + offset;
        const d1c = c + offset;
        const d2r = r + offset;
        const d2c = c - offset;
        if (d1r >= 0 && d1r < rows && d1c >= 0 && d1c < cols) {
          const k1 = `${d1r},${d1c}`;
          if (!clearedSet.has(k1)) {
            clearedSet.add(k1);
            toProcess.push(k1);
          }
        }
        if (d2r >= 0 && d2r < rows && d2c >= 0 && d2c < cols) {
          const k2 = `${d2r},${d2c}`;
          if (!clearedSet.has(k2)) {
            clearedSet.add(k2);
            toProcess.push(k2);
          }
        }
      }
    } else if (tile.special === 'bee_copter') {
      // Bumblebee Copter: buzzes and flies to a random tile on board and detonates it!
      const candidateKeys: string[] = [];
      for (let cr = 0; cr < rows; cr++) {
        for (let cc = 0; cc < cols; cc++) {
          const ck = `${cr},${cc}`;
          if (board[cr][cc] !== null && !clearedSet.has(ck)) {
            candidateKeys.push(ck);
          }
        }
      }
      if (candidateKeys.length > 0) {
        const targetKey =
          candidateKeys[Math.floor(Math.random() * candidateKeys.length)];
        clearedSet.add(targetKey);
        toProcess.push(targetKey);

        const [tr, tc] = targetKey.split(',').map(Number);
        const splashCoords = [
          { r: tr - 1, c: tc },
          { r: tr + 1, c: tc },
          { r: tr, c: tc - 1 },
          { r: tr, c: tc + 1 },
        ];
        for (const sc of splashCoords) {
          if (sc.r >= 0 && sc.r < rows && sc.c >= 0 && sc.c < cols) {
            const sk = `${sc.r},${sc.c}`;
            if (!clearedSet.has(sk) && board[sc.r][sc.c] !== null) {
              clearedSet.add(sk);
              toProcess.push(sk);
            }
          }
        }
      }
    } else if (tile.special === 'royal_crown') {
      // Royal Crown: clears TWO entire animal species at once!
      const species1 = tile.color;
      const speciesCounts: Partial<Record<CandyColor, number>> = {};
      for (let cr = 0; cr < rows; cr++) {
        for (let cc = 0; cc < cols; cc++) {
          const t = board[cr][cc];
          if (t && t.color !== species1) {
            speciesCounts[t.color] = (speciesCounts[t.color] || 0) + 1;
          }
        }
      }
      let species2: CandyColor | null = null;
      let maxCount = -1;
      for (const [colName, count] of Object.entries(speciesCounts)) {
        if ((count as number) > maxCount) {
          maxCount = count as number;
          species2 = colName as CandyColor;
        }
      }

      for (let cr = 0; cr < rows; cr++) {
        for (let cc = 0; cc < cols; cc++) {
          const t = board[cr][cc];
          if (t && (t.color === species1 || (species2 && t.color === species2))) {
            const k = `${cr},${cc}`;
            if (!clearedSet.has(k)) {
              clearedSet.add(k);
              toProcess.push(k);
            }
          }
        }
      }
    }
  }

  // Collect tile IDs being removed
  const clearedTileIds: string[] = [];
  clearedSet.forEach((key) => {
    const [row, col] = key.split(',').map(Number);
    const tile = newBoard[row][col];
    if (tile) {
      clearedTileIds.push(tile.id);
      newBoard[row][col] = null;
    }
  });

  // Spawn new specials (higher tier specials take precedence on shared coordinates)
  const SPECIAL_TIER: Record<SpecialType, number> = {
    royal_crown: 7,
    star_wand: 6,
    color_bomb: 5,
    wrapped: 4,
    striped_h: 3,
    striped_v: 3,
    bee_copter: 2,
    normal: 1,
  };
  specialsToSpawn.sort((a, b) => SPECIAL_TIER[a.special] - SPECIAL_TIER[b.special]);

  specialsToSpawn.forEach(({ pos, special, color }) => {
    newBoard[pos.row][pos.col] = {
      id: generateTileId(),
      color,
      special,
      row: pos.row,
      col: pos.col,
    };
    const idx = clearedTileIds.indexOf(board[pos.row][pos.col]?.id || '');
    if (idx !== -1) {
      clearedTileIds.splice(idx, 1);
    }
  });

  const score = clearedSet.size * GAME_RULES.BASE_POINTS_PER_TILE;

  return {
    newBoard,
    clearedTileIds,
    score,
    activatedSpecials,
  };
}

export interface GravityResult {
  newBoard: BoardGrid;
  fallingTiles: { id: string; fromRow: number; toRow: number; col: number }[];
  spawnedTiles: Tile[];
}

/**
 * Drops existing tiles down into null spaces and refills top rows with new random tiles.
 */
export function applyGravityAndRefill(board: BoardGrid): GravityResult {
  const rows = board.length;
  const cols = board[0].length;
  const newBoard: BoardGrid = Array.from({ length: rows }, () =>
    Array(cols).fill(null)
  );

  const fallingTiles: GravityResult['fallingTiles'] = [];
  const spawnedTiles: Tile[] = [];

  for (let c = 0; c < cols; c++) {
    let writeRow = rows - 1;

    // 1. Move existing tiles down
    for (let r = rows - 1; r >= 0; r--) {
      const tile = board[r][c];
      if (tile !== null) {
        if (r !== writeRow) {
          fallingTiles.push({
            id: tile.id,
            fromRow: r,
            toRow: writeRow,
            col: c,
          });
        }
        newBoard[writeRow][c] = {
          ...tile,
          row: writeRow,
          col: c,
        };
        writeRow--;
      }
    }

    // 2. Refill remaining rows above with new candies
    while (writeRow >= 0) {
      const newTile = createRandomTile(writeRow, c);
      spawnedTiles.push(newTile);
      fallingTiles.push({
        id: newTile.id,
        fromRow: writeRow - rows,
        toRow: writeRow,
        col: c,
      });
      newBoard[writeRow][c] = newTile;
      writeRow--;
    }
  }

  return {
    newBoard,
    fallingTiles,
    spawnedTiles,
  };
}

/**
 * Shuffles current tiles on the board, ensuring the resulting layout
 * has no active matches and at least one possible move.
 */
export function shuffleBoard(board: BoardGrid): BoardGrid {
  const rows = board.length;
  const cols = board[0].length;
  const flatTiles: Tile[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tile = board[r][c];
      if (tile) flatTiles.push(tile);
    }
  }

  let shuffledBoard: BoardGrid;
  let attempts = 0;

  do {
    const pool = [...flatTiles];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    shuffledBoard = [];
    let poolIdx = 0;
    for (let r = 0; r < rows; r++) {
      const row: (Tile | null)[] = [];
      for (let c = 0; c < cols; c++) {
        const t = pool[poolIdx++];
        row.push({
          ...t,
          row: r,
          col: c,
        });
      }
      shuffledBoard.push(row);
    }

    attempts++;
  } while (
    (findMatches(shuffledBoard).hasMatches || !hasPossibleMoves(shuffledBoard)) &&
    attempts < 30
  );

  return shuffledBoard;
}
