import {
  createInitialBoard,
  findMatches,
  hasPossibleMoves,
  findFirstAvailableMove,
  isValidSwap,
  clearMatches,
  applyGravityAndRefill,
  resolveSpecialSwap,
  cloneBoard,
} from './Match3Engine';
import { BoardGrid, Tile, AnimalType } from '../types/game';

console.log('--- STARTING PET PALS ENGINE TEST ---');

// Test 1: Initial Board
const board = createInitialBoard(8, 8);
console.log('Board Dimensions:', board.length, 'x', board[0].length);

const initialMatches = findMatches(board);
console.log('Initial matches count (should be 0):', initialMatches.matchedPositions.length);
if (initialMatches.matchedPositions.length !== 0) {
  console.error('FAIL: Initial board has matches!');
  process.exit(1);
}

const movesAvailable = hasPossibleMoves(board);
console.log('Has available moves (should be true):', movesAvailable);
if (!movesAvailable) {
  console.error('FAIL: Board has no possible moves!');
  process.exit(1);
}

// Test Smart Idle Hint Finder
const hint = findFirstAvailableMove(board);
console.log('Smart 4s Hint found valid move:', hint !== null);
if (!hint) {
  console.error('FAIL: Hint finder failed to find valid move!');
  process.exit(1);
}

// Test 2: Detect 3-in-a-row match
const testBoard: BoardGrid = Array.from({ length: 8 }, (_, r) =>
  Array.from({ length: 8 }, (_, c) => ({
    id: `t_${r}_${c}`,
    color: 'otter' as const,
    special: 'normal' as const,
    row: r,
    col: c,
  }))
);

const animals: AnimalType[] = ['fox', 'panda', 'bunny', 'frog', 'bear', 'otter'];
for (let r = 0; r < 8; r++) {
  for (let c = 0; c < 8; c++) {
    testBoard[r][c] = {
      id: `t_${r}_${c}`,
      color: animals[(r * 2 + c) % animals.length],
      special: 'normal',
      row: r,
      col: c,
    };
  }
}

// Create a horizontal match of 3 foxes at row 0, cols 1, 2, 3
testBoard[0][1]!.color = 'fox';
testBoard[0][2]!.color = 'fox';
testBoard[0][3]!.color = 'fox';

const matchesFound = findMatches(testBoard);
console.log('Matches found count (should be >= 3):', matchesFound.matchedPositions.length);
if (matchesFound.matchedPositions.length < 3) {
  console.error('FAIL: Expected at least 3 matched positions');
  process.exit(1);
}

// Test 3: Clear and Gravity
const clearRes = clearMatches(testBoard, matchesFound);
console.log('Cleared tile IDs count:', clearRes.clearedTileIds.length);
console.log('Score gained:', clearRes.score);

const gravityRes = applyGravityAndRefill(clearRes.newBoard);
console.log('Spawned new tiles count:', gravityRes.spawnedTiles.length);

let hasNulls = false;
for (let r = 0; r < 8; r++) {
  for (let c = 0; c < 8; c++) {
    if (gravityRes.newBoard[r][c] === null) hasNulls = true;
  }
}
console.log('Any nulls after refill (should be false):', hasNulls);
if (hasNulls) {
  console.error('FAIL: Board contains nulls after refill!');
  process.exit(1);
}

// Test 4: Rainbow Butterfly creation on 5-in-a-row
const board5 = cloneBoard(testBoard);
for (let c = 0; c < 5; c++) {
  board5[2][c]!.color = 'bunny';
}
const matches5 = findMatches(board5);
console.log('5-in-a-row match group found:', matches5.groups.some((g) => g.type === 'line5'));
const clear5Res = clearMatches(board5, matches5);
const spawnedBomb = clear5Res.newBoard[2].some((t) => t?.special === 'color_bomb');
console.log('Rainbow Butterfly spawned correctly:', spawnedBomb);

// Test 5: Rainbow Butterfly + Animal Pal swap
const boardSpecial = cloneBoard(testBoard);
boardSpecial[3][3] = {
  id: 'bomb_1',
  color: 'bear',
  special: 'color_bomb',
  row: 3,
  col: 3,
};
const comboRes = resolveSpecialSwap(boardSpecial, { row: 3, col: 3 }, { row: 3, col: 4 });
console.log('Rainbow Butterfly swap resolved (cleared positions > 0):', (comboRes?.clearedPositions.length || 0) > 0);

// Test 6: Confetti Popper Cross Blast
const boardStriped = cloneBoard(testBoard);
boardStriped[4][4] = {
  id: 'str_1',
  color: 'otter',
  special: 'striped_h',
  row: 4,
  col: 4,
};
boardStriped[4][5] = {
  id: 'str_2',
  color: 'panda',
  special: 'striped_v',
  row: 4,
  col: 5,
};
const crossRes = resolveSpecialSwap(boardStriped, { row: 4, col: 4 }, { row: 4, col: 5 });
console.log('Confetti Cross Blast cleared tiles count (expected 15):', crossRes?.clearedPositions.length);
if (crossRes?.clearedPositions.length !== 15) {
  console.error('FAIL: Cross blast did not clear exactly 15 tiles!');
  process.exit(1);
}

// Test 7: Pet Sanctuary Metagame - Care & Petting Hub Tests
import {
  createInitialSanctuaryState,
  feedBarnabyInState,
  petBarnabyInState,
  calculateTreatDropsFromMatches,
} from './sanctuaryEngine';

console.log('--- STARTING PET SANCTUARY METAGAME TESTS ---');
const sanctuary = createInitialSanctuaryState();
console.log('Initial friendship level:', sanctuary.friendshipLevel);
console.log('Initial berries inventory:', sanctuary.treatsInventory.berries);

// Test feeding berries
const feedRes = feedBarnabyInState(sanctuary, 'berries');
console.log('Feeding berries success:', feedRes.success);
console.log('Remaining berries (expected 9):', feedRes.newState.treatsInventory.berries);
console.log('Happiness increased (expected 82):', feedRes.newState.happiness);
if (feedRes.newState.treatsInventory.berries !== 9) {
  console.error('FAIL: Berries cost not properly deducted!');
  process.exit(1);
}

// Test tickling / petting Barnaby
const petRes = petBarnabyInState(feedRes.newState);
console.log('Petting count (expected 1):', petRes.newState.totalPetsCount);
console.log('Tickle message:', petRes.message);
if (petRes.newState.totalPetsCount !== 1) {
  console.error('FAIL: Petting count not incremented!');
  process.exit(1);
}

// Test Level Up from feeding golden honey
let testLevelState = feedRes.newState;
testLevelState.treatsInventory.honey = 10;
const honeyFeed1 = feedBarnabyInState(testLevelState, 'honey');
const honeyFeed2 = feedBarnabyInState(honeyFeed1.newState, 'honey');
console.log('Friendship level after treats:', honeyFeed2.newState.friendshipLevel);
console.log('Friendship XP:', honeyFeed2.newState.friendshipXp);
if (honeyFeed2.newState.friendshipLevel < 2) {
  console.error('FAIL: Friendship did not level up as expected!');
  process.exit(1);
}

// Test Treat Drops from Match-3
const dropTest = calculateTreatDropsFromMatches(
  sanctuary.treatsInventory,
  [
    { tiles: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }], color: 'bear', type: 'line3' },
    { tiles: [{ row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }], color: 'bunny', type: 'line3' },
  ],
  1
);
console.log('Honey gathered from bear match:', dropTest.gathered.honey);
console.log('Berries gathered from bunny match:', dropTest.gathered.berries);
if (!dropTest.gathered.honey || !dropTest.gathered.berries) {
  console.error('FAIL: Treats not awarded from matches!');
  process.exit(1);
}

// ==========================================
// Test 8: 2x2 Square Match ("Pet Nest") & Bumblebee Copter
// ==========================================
console.log('--- STARTING 2x2 SQUARE MATCH ("PET NEST") TESTS ---');
const board2x2 = cloneBoard(testBoard);
for (let r = 0; r < 8; r++) {
  for (let c = 0; c < 8; c++) {
    board2x2[r][c] = {
      id: `t_${r}_${c}`,
      color: animals[(r * 2 + c) % animals.length],
      special: 'normal',
      row: r,
      col: c,
    };
  }
}
// Form an exact 2x2 square of 4 pandas at (2, 2), (2, 3), (3, 2), (3, 3)
board2x2[2][1]!.color = 'fox';
board2x2[2][4]!.color = 'fox';
board2x2[1][2]!.color = 'frog';
board2x2[4][2]!.color = 'frog';
board2x2[2][2]!.color = 'panda';
board2x2[2][3]!.color = 'panda';
board2x2[3][2]!.color = 'panda';
board2x2[3][3]!.color = 'panda';

const match2x2Res = findMatches(board2x2);
const squareGroup = match2x2Res.groups.find((g) => g.type === 'square_2x2');
console.log('2x2 Square Match ("Pet Nest") detected:', squareGroup !== undefined);
if (!squareGroup) {
  console.error('FAIL: 2x2 Square Match ("Pet Nest") was not detected!');
  process.exit(1);
}

const clear2x2Res = clearMatches(board2x2, match2x2Res, { row: 2, col: 2 });
const beeCopterSpawned =
  clear2x2Res.newBoard[2][2]?.special === 'bee_copter' ||
  clear2x2Res.newBoard[2][3]?.special === 'bee_copter' ||
  clear2x2Res.newBoard[3][2]?.special === 'bee_copter' ||
  clear2x2Res.newBoard[3][3]?.special === 'bee_copter';
console.log('🐝 Bumblebee Copter special spawned:', beeCopterSpawned);
if (!beeCopterSpawned) {
  console.error('FAIL: Bee Copter was not spawned from 2x2 match!');
  process.exit(1);
}

// Test Bee Copter detonation on swap
const boardBeeSwap = cloneBoard(testBoard);
boardBeeSwap[2][2] = {
  id: 'bee_1',
  color: 'panda',
  special: 'bee_copter',
  row: 2,
  col: 2,
};
const beeSwapRes = resolveSpecialSwap(boardBeeSwap, { row: 2, col: 2 }, { row: 2, col: 3 });
console.log('Bee Copter swap resolved (cleared tiles > 2):', (beeSwapRes?.clearedPositions.length || 0) > 2);
if (!beeSwapRes || beeSwapRes.clearedPositions.length <= 2) {
  console.error('FAIL: Bee Copter did not fly to and detonate a board tile!');
  process.exit(1);
}

// ==========================================
// Test 9: T-Shape and L-Shape ("Honey Bomb Splash Pot")
// ==========================================
console.log('--- STARTING T-SHAPE & L-SHAPE TESTS ---');
const boardTShape = cloneBoard(testBoard);
for (let r = 0; r < 8; r++) {
  for (let c = 0; c < 8; c++) {
    boardTShape[r][c] = {
      id: `t_${r}_${c}`,
      color: animals[(r * 2 + c) % animals.length],
      special: 'normal',
      row: r,
      col: c,
    };
  }
}
// Row 2 cols 1, 2, 3 = frog, and col 2 rows 2, 3, 4 = frog (T-Shape centered at 2, 2)
boardTShape[2][1]!.color = 'frog';
boardTShape[2][2]!.color = 'frog';
boardTShape[2][3]!.color = 'frog';
boardTShape[3][2]!.color = 'frog';
boardTShape[4][2]!.color = 'frog';
boardTShape[1][2]!.color = 'otter';
boardTShape[5][2]!.color = 'otter';
boardTShape[2][0]!.color = 'otter';
boardTShape[2][4]!.color = 'otter';
boardTShape[3][1]!.color = 'bear';
boardTShape[3][3]!.color = 'bear';
boardTShape[4][1]!.color = 'bear';
boardTShape[4][3]!.color = 'bear';

const tMatches = findMatches(boardTShape);
const tGroup = tMatches.groups.find((g) => g.type === 'intersect_t_l');
console.log('T-Shape 5-tile intersection detected:', tGroup !== undefined);
if (!tGroup) {
  console.error('FAIL: T-Shape intersection not detected!');
  process.exit(1);
}
const clearTRes = clearMatches(boardTShape, tMatches, { row: 2, col: 2 });
const wrappedFromT = clearTRes.newBoard[2][2]?.special === 'wrapped';
console.log('🍯 Honey Splash Pot (wrapped) spawned at T-intersection:', wrappedFromT);
if (!wrappedFromT) {
  console.error('FAIL: Wrapped candy not spawned at T-intersection!');
  process.exit(1);
}

// L-Shape
const boardLShape = cloneBoard(testBoard);
for (let r = 0; r < 8; r++) {
  for (let c = 0; c < 8; c++) {
    boardLShape[r][c] = {
      id: `t_${r}_${c}`,
      color: animals[(r * 2 + c) % animals.length],
      special: 'normal',
      row: r,
      col: c,
    };
  }
}
// Col 1 rows 1, 2, 3 = bear, Row 3 cols 1, 2, 3 = bear (L-Shape corner at 3, 1)
boardLShape[1][1]!.color = 'bear';
boardLShape[2][1]!.color = 'bear';
boardLShape[3][1]!.color = 'bear';
boardLShape[3][2]!.color = 'bear';
boardLShape[3][3]!.color = 'bear';
boardLShape[0][1]!.color = 'otter';
boardLShape[4][1]!.color = 'otter';
boardLShape[3][0]!.color = 'otter';
boardLShape[3][4]!.color = 'otter';
boardLShape[2][2]!.color = 'fox';
boardLShape[2][0]!.color = 'fox';
boardLShape[1][0]!.color = 'fox';
boardLShape[1][2]!.color = 'fox';

const lMatches = findMatches(boardLShape);
const lGroup = lMatches.groups.find((g) => g.type === 'intersect_t_l');
console.log('L-Shape 5-tile intersection detected:', lGroup !== undefined);
if (!lGroup) {
  console.error('FAIL: L-Shape intersection not detected!');
  process.exit(1);
}
const clearLRes = clearMatches(boardLShape, lMatches, { row: 3, col: 1 });
const wrappedFromL = clearLRes.newBoard[3][1]?.special === 'wrapped';
console.log('🍯 Honey Splash Pot (wrapped) spawned at L-corner:', wrappedFromL);
if (!wrappedFromL) {
  console.error('FAIL: Wrapped candy not spawned at L-corner!');
  process.exit(1);
}

// ==========================================
// Test 10: Cross (+) Shape & Star Wand
// ==========================================
console.log('--- STARTING CROSS (+) SHAPE & STAR WAND TESTS ---');
const boardCross = cloneBoard(testBoard);
for (let r = 0; r < 8; r++) {
  for (let c = 0; c < 8; c++) {
    boardCross[r][c] = {
      id: `t_${r}_${c}`,
      color: animals[(r * 2 + c) % animals.length],
      special: 'normal',
      row: r,
      col: c,
    };
  }
}
// Cross (+) centered at (3, 3): row 3 cols 2, 3, 4 and col 3 rows 2, 3, 4
boardCross[3][2]!.color = 'otter';
boardCross[3][3]!.color = 'otter';
boardCross[3][4]!.color = 'otter';
boardCross[2][3]!.color = 'otter';
boardCross[4][3]!.color = 'otter';
boardCross[3][1]!.color = 'fox';
boardCross[3][5]!.color = 'fox';
boardCross[1][3]!.color = 'fox';
boardCross[5][3]!.color = 'fox';

const crossMatches = findMatches(boardCross);
const crossGroup = crossMatches.groups.find((g) => g.type === 'intersect_cross');
console.log('Cross (+) Shape 4-way intersection detected:', crossGroup !== undefined);
if (!crossGroup) {
  console.error('FAIL: Cross (+) intersection not detected!');
  process.exit(1);
}
const clearCrossRes = clearMatches(boardCross, crossMatches, { row: 3, col: 3 });
const starWandSpawned = clearCrossRes.newBoard[3][3]?.special === 'star_wand';
console.log('⭐ Star Wand spawned at Cross center:', starWandSpawned);
if (!starWandSpawned) {
  console.error('FAIL: Star Wand was not spawned at Cross (+) center!');
  process.exit(1);
}

// Test Star Wand diagonal 'X' beams
const boardStarWand = cloneBoard(testBoard);
boardStarWand[3][3] = {
  id: 'star_1',
  color: 'otter',
  special: 'star_wand',
  row: 3,
  col: 3,
};
const starSwapRes = resolveSpecialSwap(boardStarWand, { row: 3, col: 3 }, { row: 3, col: 4 });
console.log('Star Wand diagonal X blast cleared tiles (expected >= 14):', starSwapRes?.clearedPositions.length);
if (!starSwapRes || starSwapRes.clearedPositions.length < 14) {
  console.error('FAIL: Star Wand did not clear both diagonals across the board!');
  process.exit(1);
}

// ==========================================
// Test 11: 6+ Mega Line & Royal Crown
// ==========================================
console.log('--- STARTING 6+ MEGA LINE & ROYAL CROWN TESTS ---');
const board6 = cloneBoard(testBoard);
for (let r = 0; r < 8; r++) {
  for (let c = 0; c < 8; c++) {
    board6[r][c] = {
      id: `t_${r}_${c}`,
      color: animals[(r * 2 + c) % animals.length],
      special: 'normal',
      row: r,
      col: c,
    };
  }
}
// 6 in a row: row 4 cols 0, 1, 2, 3, 4, 5 all 'bunny'
for (let c = 0; c < 6; c++) {
  board6[4][c]!.color = 'bunny';
}
const matches6 = findMatches(board6);
const group6 = matches6.groups.find((g) => g.type === 'line6_plus');
console.log('6+ Mega Line match detected:', group6 !== undefined);
if (!group6) {
  console.error('FAIL: 6+ Mega Line match was not detected!');
  process.exit(1);
}

const clear6Res = clearMatches(board6, matches6, { row: 4, col: 2 });
const crownSpawned = clear6Res.newBoard[4].some((t) => t?.special === 'royal_crown');
console.log('👑 Royal Crown spawned from Mega Line:', crownSpawned);
if (!crownSpawned) {
  console.error('FAIL: Royal Crown was not spawned from 6+ Mega Line!');
  process.exit(1);
}

// Test Royal Crown clears TWO entire animal species
const boardCrownSwap = cloneBoard(testBoard);
boardCrownSwap[3][3] = {
  id: 'crown_1',
  color: 'bunny',
  special: 'royal_crown',
  row: 3,
  col: 3,
};
const crownSwapRes = resolveSpecialSwap(boardCrownSwap, { row: 3, col: 3 }, { row: 3, col: 4 });
const partnerColor = boardCrownSwap[3][4]!.color;
let species1Count = 0;
for (let r = 0; r < 8; r++) {
  for (let c = 0; c < 8; c++) {
    if (boardCrownSwap[r][c]?.color === partnerColor) species1Count++;
  }
}
console.log(
  `Royal Crown swap cleared ${crownSwapRes?.clearedPositions.length} tiles (greater than species 1 count ${species1Count}):`,
  (crownSwapRes?.clearedPositions.length || 0) > species1Count
);
if (!crownSwapRes || crownSwapRes.clearedPositions.length <= species1Count) {
  console.error('FAIL: Royal Crown did not clear TWO full animal species!');
  process.exit(1);
}

// ==========================================
// Test 12: Special Combos (Bee + Bee, Star + Striped)
// ==========================================
console.log('--- STARTING SPECIAL COMBOS TESTS ---');
// Bee Copter + Bee Copter
const boardTwinBees = cloneBoard(testBoard);
boardTwinBees[2][2] = { id: 'b1', color: 'bear', special: 'bee_copter', row: 2, col: 2 };
boardTwinBees[2][3] = { id: 'b2', color: 'frog', special: 'bee_copter', row: 2, col: 3 };
const twinBeeRes = resolveSpecialSwap(boardTwinBees, { row: 2, col: 2 }, { row: 2, col: 3 });
console.log('Twin Bee Copter swap resolved (cleared tiles > 5):', (twinBeeRes?.clearedPositions.length || 0) > 5);
if (!twinBeeRes || twinBeeRes.clearedPositions.length <= 5) {
  console.error('FAIL: Twin Bee Copter swap failed!');
  process.exit(1);
}

// Star Wand + Striped (8-way starburst)
const boardStarStriped = cloneBoard(testBoard);
boardStarStriped[3][3] = { id: 's1', color: 'fox', special: 'star_wand', row: 3, col: 3 };
boardStarStriped[3][4] = { id: 's2', color: 'fox', special: 'striped_h', row: 3, col: 4 };
const starStripedRes = resolveSpecialSwap(boardStarStriped, { row: 3, col: 3 }, { row: 3, col: 4 });
console.log(
  'Star Wand + Striped 8-Way Starburst cleared tiles (expected >= 25):',
  starStripedRes?.clearedPositions.length
);
if (!starStripedRes || starStripedRes.clearedPositions.length < 25) {
  console.error('FAIL: Star Wand + Striped 8-Way Starburst failed!');
  process.exit(1);
}

console.log('--- ALL PET PALS & SANCTUARY ENGINE TESTS PASSED SUCCESSFULLY! ---');


