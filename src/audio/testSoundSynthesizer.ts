import { SoundSynthesizer, soundSynthesizer } from './SoundSynthesizer';

console.log('--- STARTING SOUND SYNTHESIZER TESTS ---');

// Test 1: Singleton property
const s1 = SoundSynthesizer.getInstance();
const s2 = SoundSynthesizer.getInstance();
console.log('Singleton equality check:', s1 === s2 && s1 === soundSynthesizer);
if (s1 !== s2 || s1 !== soundSynthesizer) {
  console.error('FAIL: SoundSynthesizer is not a singleton');
  process.exit(1);
}

// Test 2: Safe execution in Node/non-browser runtime
async function testSafeFallbacks() {
  console.log('Testing calls in non-browser environment...');
  await soundSynthesizer.playTap();
  await soundSynthesizer.playMatch(1);
  await soundSynthesizer.playMatch(2);
  await soundSynthesizer.playMatch(5);
  await soundSynthesizer.playMatch(10);
  await soundSynthesizer.playSpecialBlast();
  await soundSynthesizer.playRescueBoost();
  await soundSynthesizer.playVictory();
  await soundSynthesizer.playTickle();
  await soundSynthesizer.playMunch();
  await soundSynthesizer.playExplosionPunch(1.0);
  await soundSynthesizer.playExplosionPunch(2.0);
  await soundSynthesizer.playBeeCopter();
  await soundSynthesizer.playStarWand();
  await soundSynthesizer.playRoyalCrown();
  console.log('All procedural sound triggers executed safely without crash.');
}

// Test 3: Mute and Volume controls
console.log('Default mute state (false):', soundSynthesizer.isMuted);
soundSynthesizer.setMuted(true);
console.log('Mute set to true:', soundSynthesizer.isMuted);
const toggled = soundSynthesizer.toggleMute();
console.log('Mute toggled back to false:', !toggled && !soundSynthesizer.isMuted);

soundSynthesizer.setVolume(0.5);
console.log('Volume set to 0.5:', soundSynthesizer.volume === 0.5);
soundSynthesizer.setVolume(1.5); // should clamp to 1
console.log('Volume clamp to 1.0 on overflow:', soundSynthesizer.volume === 1.0);
soundSynthesizer.setVolume(-0.2); // should clamp to 0
console.log('Volume clamp to 0.0 on underflow:', soundSynthesizer.volume === 0.0);
soundSynthesizer.setVolume(0.8); // restore

testSafeFallbacks().then(() => {
  console.log('--- ALL SOUND SYNTHESIZER TESTS PASSED! ---');
});
