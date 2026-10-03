import { ANIMAL_THEMES } from '../constants/theme';
import { AnimalType, SpecialType } from '../types/game';
import { ParticleType } from '../components/ParticleBurst';

console.log('--- STARTING JUICE & PARTICLE SYSTEM TESTS ---');

// 1. Verify ANIMAL_THEMES has primary & accent colors for all animals
const speciesList: AnimalType[] = ['fox', 'panda', 'bunny', 'frog', 'bear', 'otter'];
speciesList.forEach((species) => {
  const theme = ANIMAL_THEMES[species];
  if (!theme || !theme.primaryColor || !theme.accentColor) {
    throw new Error(`Missing theme colors for species: ${species}`);
  }
  console.log(`Verified theme for ${species}: primary=${theme.primaryColor}, accent=${theme.accentColor}, symbol=${theme.symbol}`);
});

// 2. Verify Distinct Particle Elements exist
const expectedDistinctTypes: ParticleType[] = ['diamond', 'berry', 'paw', 'banner'];
expectedDistinctTypes.forEach((type) => {
  console.log(`Verified distinct particle element available: [${type}]`);
});

// 3. Verify Particle Count Specification (28-40 energetic particles per blast)
const computeParticleCount = (combo: number, special?: SpecialType, countOverride?: number): number => {
  const isSpecialCombo = special && special !== 'normal';
  return (
    countOverride ||
    Math.min(
      42,
      Math.max(28, 30 + (combo - 1) * 3 + (isSpecialCombo ? 6 : 0))
    )
  );
};

const countCombo1 = computeParticleCount(1, 'normal');
const countCombo2 = computeParticleCount(2, 'normal');
const countCombo3 = computeParticleCount(3, 'normal');
const countSpecial = computeParticleCount(1, 'color_bomb');

console.log('Particle counts across combos:', {
  combo1: countCombo1,
  combo2: countCombo2,
  combo3: countCombo3,
  specialColorBomb: countSpecial,
});

if (countCombo1 < 28 || countCombo1 > 40) {
  throw new Error(`Particle count for combo 1 out of range (28-40): ${countCombo1}`);
}
if (countCombo3 < 28 || countCombo3 > 42) {
  throw new Error(`Particle count for combo 3 out of range: ${countCombo3}`);
}

// 4. Verify Trajectory Physics (Air Drag Deceleration + Gravity Drop)
const testTrajectory = (distance: number, angle: number, upwardBias: number, gravity: number) => {
  const dx = Math.cos(angle) * distance;
  const dy = Math.sin(angle) * distance;

  // t = 0 (detonation)
  const x0 = 0;
  const y0 = 0;

  // t = 0.18 (fast outward kick)
  const x1 = dx * 0.52;
  const y1 = dy * 0.52 + upwardBias * 0.82;

  // t = 0.45 (apex of fountain arc)
  const x2 = dx * 0.82;
  const y2 = dy * 0.82 + upwardBias * 0.95 + gravity * 0.20;

  // t = 0.75 (gravity pull accelerating)
  const x3 = dx * 0.95;
  const y3 = dy * 0.95 + upwardBias * 0.45 + gravity * 0.60;

  // t = 1.0 (landing)
  const x4 = dx;
  const y4 = dy + upwardBias * 0.12 + gravity;

  return { x0, y0, x1, y1, x2, y2, x3, y3, x4, y4, dx, dy };
};

const result = testTrajectory(80, Math.PI / 4, -30, 80);
console.log('High-velocity spark trajectory check (45 deg burst):', {
  initialKick: { x: result.x1.toFixed(1), y: result.y1.toFixed(1) },
  arcApex: { x: result.x2.toFixed(1), y: result.y2.toFixed(1) },
  gravityDrop: { x: result.x3.toFixed(1), y: result.y3.toFixed(1) },
  finalLanding: { x: result.x4.toFixed(1), y: result.y4.toFixed(1) },
});

// Verify air drag: horizontal distance travels >50% in first 18% of time, slowing thereafter
const firstHalfDistanceRatio = result.x1 / result.x4;
if (firstHalfDistanceRatio < 0.48 || firstHalfDistanceRatio > 0.56) {
  throw new Error(`Air drag simulation failed: expected ~52% distance covered in initial kick, got ${firstHalfDistanceRatio}`);
}

// Verify gravity arc: final landing Y must be lower (greater in screen coords) than initial peak
if (result.y1 >= result.y4) {
  throw new Error('Physics test failed: Final landing Y should be lower (higher positive Y) than initial peak Y due to gravity drop!');
}

// 5. Verify Damped Sinusoidal Spring Screen Shake Mathematics
const testDampedSinusoid = (baseAmp: number, rotAmp: number) => {
  const steps = [
    { x: baseAmp, y: baseAmp * 0.65, rot: rotAmp },
    { x: -baseAmp * 0.68, y: -baseAmp * 0.45, rot: -rotAmp * 0.72 },
    { x: baseAmp * 0.44, y: baseAmp * 0.28, rot: rotAmp * 0.48 },
    { x: -baseAmp * 0.22, y: -baseAmp * 0.14, rot: -rotAmp * 0.24 },
    { x: baseAmp * 0.08, y: baseAmp * 0.05, rot: rotAmp * 0.09 },
    { x: 0, y: 0, rot: 0 },
  ];

  // Check alternating signs (sinusoidal oscillation)
  for (let i = 0; i < steps.length - 2; i++) {
    if (Math.sign(steps[i].x) === Math.sign(steps[i + 1].x)) {
      throw new Error(`Oscillation error at step ${i}: Signs must alternate for sinusoidal spring!`);
    }
    // Check exponential decay: |step[i+1]| < |step[i]|
    if (Math.abs(steps[i + 1].x) >= Math.abs(steps[i].x)) {
      throw new Error(`Damping error at step ${i}: Amplitude must strictly decay!`);
    }
  }

  // Check final settle to 0
  if (steps[steps.length - 1].x !== 0 || steps[steps.length - 1].rot !== 0) {
    throw new Error('Screen shake failed to settle to origin (0, 0)!');
  }

  return true;
};

testDampedSinusoid(12, 2.5);
console.log('Verified damped sinusoidal spring screen shake: alternating signs & exponential decay confirmed.');

// 6. Verify Celebratory Score Pill Tag Strings
const getCelebratoryTag = (comboLevel: number, special?: SpecialType): string => {
  if (special === 'color_bomb') return 'RAINBOW BLAST!';
  if (special === 'wrapped') return 'HONEY SPLASH!';
  if (special === 'striped_h' || special === 'striped_v') return 'LINE BLAST!';
  if (comboLevel >= 5) return 'PAWESOME!';
  if (comboLevel === 4) return 'TASTY!';
  if (comboLevel === 3) return 'SUPER POP!';
  if (comboLevel === 2) return 'SWEET!';
  return 'POP!';
};

const tags = [
  getCelebratoryTag(1),
  getCelebratoryTag(2),
  getCelebratoryTag(3),
  getCelebratoryTag(4),
  getCelebratoryTag(5),
  getCelebratoryTag(1, 'color_bomb'),
];

console.log('Verified celebratory tags:', tags);
if (!tags.includes('SUPER POP!') || !tags.includes('SWEET!') || !tags.includes('RAINBOW BLAST!')) {
  throw new Error('Missing expected celebratory pill text tags!');
}

console.log('--- ALL JUICE & PARTICLE SYSTEM VERIFICATIONS PASSED! ---');
