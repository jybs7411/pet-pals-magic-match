/**
 * SoundSynthesizer.ts
 *
 * 100% self-contained procedural audio engine using the standard Web Audio API.
 * Zero external audio files/MP3 downloads required.
 *
 * Supports:
 * - Mobile & Web autoplay unlock via user gesture listeners.
 * - Master DynamicsCompressor limiter to prevent clipping/distortion.
 * - Full mute & master volume control.
 * - Safe graceful fallback on non-web/SSR/Node environments.
 */

import { useState, useCallback } from 'react';

// Pentatonic scale frequencies for marimba match combos (C4 up to C7)
const MARIMBA_PENTATONIC_SCALE = [
  261.63, // C4 (Combo 1)
  293.66, // D4 (Combo 2)
  329.63, // E4 (Combo 3)
  392.00, // G4 (Combo 4)
  440.00, // A4 (Combo 5)
  523.25, // C5 (Combo 6)
  587.33, // D5 (Combo 7)
  659.25, // E5 (Combo 8)
  783.99, // G5 (Combo 9)
  880.00, // A5 (Combo 10)
  1046.50, // C6 (Combo 11)
  1174.66, // D6 (Combo 12)
  1318.51, // E6 (Combo 13)
  1567.98, // G6 (Combo 14)
  1760.00, // A6 (Combo 15)
  2093.00, // C7 (Combo 16+)
];

export class SoundSynthesizer {
  private static instance: SoundSynthesizer | null = null;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private _isMuted: boolean = false;
  private _volume: number = 0.8;
  private listenersAttached: boolean = false;

  private constructor() {
    // Attempt lazy initialization
    if (typeof window !== 'undefined') {
      this.attachAutoUnlock();
    }
  }

  public static getInstance(): SoundSynthesizer {
    if (!SoundSynthesizer.instance) {
      SoundSynthesizer.instance = new SoundSynthesizer();
    }
    return SoundSynthesizer.instance;
  }

  public get isMuted(): boolean {
    return this._isMuted;
  }

  public get volume(): number {
    return this._volume;
  }

  /**
   * Set mute state
   */
  public setMuted(muted: boolean): void {
    this._isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        muted ? 0 : this._volume,
        this.ctx.currentTime
      );
    }
  }

  /**
   * Toggle mute state and return new state
   */
  public toggleMute(): boolean {
    this.setMuted(!this._isMuted);
    return this._isMuted;
  }

  /**
   * Set master volume (0.0 to 1.0)
   */
  public setVolume(volume: number): void {
    this._volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.ctx && !this._isMuted) {
      this.masterGain.gain.setValueAtTime(this._volume, this.ctx.currentTime);
    }
  }

  /**
   * Safe AudioContext initialization with limiter
   */
  private initContext(): void {
    if (this.ctx) return;
    try {
      const AudioCtxClass =
        (typeof window !== 'undefined' &&
          (window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext })
              .webkitAudioContext)) ||
        null;

      if (!AudioCtxClass) return;

      this.ctx = new AudioCtxClass();

      // Master Limiter / Compressor to avoid clipping during simultaneous explosions
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(20, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(10, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.2, this.ctx.currentTime);

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(
        this._isMuted ? 0 : this._volume,
        this.ctx.currentTime
      );

      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.ctx.destination);
    } catch {
      // AudioContext unavailable in current runtime
    }
  }

  /**
   * Unlock Web Audio on mobile iOS/Android upon first user interaction
   */
  private attachAutoUnlock(): void {
    if (this.listenersAttached || typeof window === 'undefined') return;
    this.listenersAttached = true;

    const unlock = () => {
      this.ensureContext();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    };

    ['click', 'touchstart', 'touchend', 'pointerdown', 'keydown'].forEach(
      (evt) => {
        window.addEventListener(evt, unlock, { once: true, passive: true });
      }
    );
  }

  /**
   * Ensure AudioContext is initialized and resumed
   */
  private async ensureContext(): Promise<AudioContext | null> {
    if (!this.ctx) {
      this.initContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch {
        // Ignored until user gesture
      }
    }
    return this.ctx;
  }

  /**
   * 1. playTap(): Soft wooden pop / bubble pop
   * Ideal for tile selections, UI clicks, and button presses.
   */
  public async playTap(): Promise<void> {
    const ctx = await this.ensureContext();
    if (!ctx || this._isMuted || !this.masterGain) return;

    const now = ctx.currentTime;

    // Bubble pop oscillator: fast upward pitch chirp
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    // Frequency sweep: 380Hz to 760Hz in 35ms gives a juicy bubble pop
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(760, now + 0.035);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.075);

    // Warm lowpass filter to remove any harsh digital edge
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, now);

    // Amplitude envelope: snappy attack and quick wooden decay
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    // Wooden click transient: micro burst of higher tone
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(1200, now);
    clickOsc.frequency.exponentialRampToValueAtTime(150, now + 0.012);

    clickGain.gain.setValueAtTime(0.12, now);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

    // Route connections
    osc.connect(gain);
    clickOsc.connect(clickGain);
    clickGain.connect(gain);
    gain.connect(filter);
    filter.connect(this.masterGain);

    osc.start(now);
    clickOsc.start(now);
    osc.stop(now + 0.085);
    clickOsc.stop(now + 0.02);
  }

  /**
   * 2. playMatch(combo: number): Melodic marimba note scaling up with combo count!
   * Scale: C4, D4, E4, G4, A4, C5... climbing higher as combo multiplies.
   * Marimba Timbre: Fundamental sine + 4th harmonic overtone + wooden mallet transient.
   */
  public async playMatch(combo: number = 1): Promise<void> {
    const ctx = await this.ensureContext();
    if (!ctx || this._isMuted || !this.masterGain) return;

    const now = ctx.currentTime;
    const noteIdx = Math.min(
      Math.max(0, (combo || 1) - 1),
      MARIMBA_PENTATONIC_SCALE.length - 1
    );
    const fundamentalFreq = MARIMBA_PENTATONIC_SCALE[noteIdx];

    // --- Component A: Fundamental Sine Bar ---
    const fundOsc = ctx.createOscillator();
    const fundGain = ctx.createGain();
    fundOsc.type = 'sine';
    fundOsc.frequency.setValueAtTime(fundamentalFreq, now);

    // Decay scales slightly with pitch (higher notes decay a bit faster)
    const decayTime = Math.max(0.28, 0.48 - noteIdx * 0.015);

    fundGain.gain.setValueAtTime(0.001, now);
    fundGain.gain.linearRampToValueAtTime(0.35, now + 0.003);
    fundGain.gain.exponentialRampToValueAtTime(0.0001, now + decayTime);

    // --- Component B: Marimba Rosewood 4th Harmonic Overtone (Double Octave) ---
    // Physical rosewood marimba bars are carved underneath to tune 1st overtone to 4x
    const overtoneOsc = ctx.createOscillator();
    const overtoneGain = ctx.createGain();
    overtoneOsc.type = 'sine';
    overtoneOsc.frequency.setValueAtTime(fundamentalFreq * 3.98, now);

    overtoneGain.gain.setValueAtTime(0.18, now);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

    // --- Component C: Wooden Mallet Click Transient ---
    const malletOsc = ctx.createOscillator();
    const malletGain = ctx.createGain();
    malletOsc.type = 'triangle';
    malletOsc.frequency.setValueAtTime(fundamentalFreq * 2, now);
    malletOsc.frequency.exponentialRampToValueAtTime(60, now + 0.014);

    malletGain.gain.setValueAtTime(0.15, now);
    malletGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.016);

    // Combine into main node
    fundOsc.connect(fundGain);
    overtoneOsc.connect(overtoneGain);
    malletOsc.connect(malletGain);

    fundGain.connect(this.masterGain);
    overtoneGain.connect(this.masterGain);
    malletGain.connect(this.masterGain);

    fundOsc.start(now);
    overtoneOsc.start(now);
    malletOsc.start(now);

    fundOsc.stop(now + decayTime + 0.02);
    overtoneOsc.stop(now + 0.08);
    malletOsc.stop(now + 0.02);

    // For combo streaks (combo >= 2), add a sweet ascending sparkle shimmer echo
    if (combo >= 2) {
      const shimmerOsc = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      const shimmerTime = now + 0.07;

      shimmerOsc.type = 'sine';
      shimmerOsc.frequency.setValueAtTime(fundamentalFreq * 2, shimmerTime);

      shimmerGain.gain.setValueAtTime(0.0001, shimmerTime);
      shimmerGain.gain.linearRampToValueAtTime(0.15, shimmerTime + 0.004);
      shimmerGain.gain.exponentialRampToValueAtTime(
        0.0001,
        shimmerTime + decayTime * 0.7
      );

      shimmerOsc.connect(shimmerGain);
      shimmerGain.connect(this.masterGain);

      shimmerOsc.start(shimmerTime);
      shimmerOsc.stop(shimmerTime + decayTime * 0.7 + 0.01);
    }
  }

  /**
   * 3. playSpecialBlast(): Festive confetti whistle / chime rush
   * Triggered on Rainbow Butterfly or Confetti Popper explosions.
   */
  public async playSpecialBlast(): Promise<void> {
    const ctx = await this.ensureContext();
    if (!ctx || this._isMuted || !this.masterGain) return;

    const now = ctx.currentTime;

    // --- Sub Party Popper Thump ---
    const thumpOsc = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    thumpOsc.type = 'sine';
    thumpOsc.frequency.setValueAtTime(220, now);
    thumpOsc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

    thumpGain.gain.setValueAtTime(0.35, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

    thumpOsc.connect(thumpGain);
    thumpGain.connect(this.masterGain);
    thumpOsc.start(now);
    thumpOsc.stop(now + 0.15);

    // --- Party Confetti Whistle / Slide Whistle ---
    const whistleOsc = ctx.createOscillator();
    const whistleGain = ctx.createGain();
    whistleOsc.type = 'sine';

    // Slide whistle pitch swoop up
    whistleOsc.frequency.setValueAtTime(580, now);
    whistleOsc.frequency.exponentialRampToValueAtTime(1650, now + 0.18);
    whistleOsc.frequency.linearRampToValueAtTime(1450, now + 0.22);

    whistleGain.gain.setValueAtTime(0.001, now);
    whistleGain.gain.linearRampToValueAtTime(0.24, now + 0.02);
    whistleGain.gain.setValueAtTime(0.24, now + 0.14);
    whistleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

    whistleOsc.connect(whistleGain);
    whistleGain.connect(this.masterGain);
    whistleOsc.start(now);
    whistleOsc.stop(now + 0.26);

    // --- Sparkling Chime Rush Cascade ---
    // Staggered crystalline high chimes bursting like colorful confetti!
    const chimeFreqs = [1046.5, 1318.5, 1567.98, 2093.0, 2637.0, 3135.96];
    chimeFreqs.forEach((freq, idx) => {
      const noteTime = now + 0.06 + idx * 0.032;

      const chimeOsc = ctx.createOscillator();
      const bellOvertone = ctx.createOscillator();
      const chimeGain = ctx.createGain();

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, noteTime);

      bellOvertone.type = 'sine';
      bellOvertone.frequency.setValueAtTime(freq * 2.756, noteTime);

      chimeGain.gain.setValueAtTime(0.001, noteTime);
      chimeGain.gain.linearRampToValueAtTime(0.18, noteTime + 0.003);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.26);

      chimeOsc.connect(chimeGain);
      bellOvertone.connect(chimeGain);
      chimeGain.connect(this.masterGain!);

      chimeOsc.start(noteTime);
      bellOvertone.start(noteTime);
      chimeOsc.stop(noteTime + 0.28);
      bellOvertone.stop(noteTime + 0.18);
    });
  }

  /**
   * 4. playRescueBoost(): Magical fairy sparkle arpeggio
   * Triggered when Barnaby grants +5 rescue moves or magical boost.
   */
  public async playRescueBoost(): Promise<void> {
    const ctx = await this.ensureContext();
    if (!ctx || this._isMuted || !this.masterGain) return;

    const now = ctx.currentTime;

    // Ascending fairy wand harp arpeggio: C5, E5, G5, B5, C6, E6, G6, C7
    const fairyNotes = [
      523.25, 659.25, 783.99, 987.77, 1046.5, 1318.51, 1567.98, 2093.0,
    ];

    fairyNotes.forEach((freq, index) => {
      const noteTime = now + index * 0.048;

      const osc = ctx.createOscillator();
      const overtone = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      // Shimmering bell harmonic
      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(freq * 2, noteTime);

      gain.gain.setValueAtTime(0.0001, noteTime);
      gain.gain.linearRampToValueAtTime(0.2, noteTime + 0.006);
      // Gentle dreamy shimmering tail
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.42);

      osc.connect(gain);
      overtone.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(noteTime);
      overtone.start(noteTime);
      osc.stop(noteTime + 0.45);
      overtone.stop(noteTime + 0.3);
    });
  }

  /**
   * 5. playVictory(): Celebratory fanfare chord
   * Herald trumpet arpeggio leading into a glorious sustained chord!
   */
  public async playVictory(): Promise<void> {
    const ctx = await this.ensureContext();
    if (!ctx || this._isMuted || !this.masterGain) return;

    const now = ctx.currentTime;

    // Herald Trumpet Fanfare Motif (C5, G4, C5, E5, G5)
    const herald = [
      { f: 523.25, t: 0.0, d: 0.12 },
      { f: 392.0, t: 0.11, d: 0.1 },
      { f: 523.25, t: 0.21, d: 0.12 },
      { f: 659.25, t: 0.32, d: 0.13 },
      { f: 783.99, t: 0.44, d: 0.16 },
    ];

    herald.forEach(({ f, t, d }) => {
      const noteStart = now + t;
      const osc = ctx.createOscillator();
      const oscTri = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Brass-like warmth: combo of sawtooth and triangle through lowpass filter
      osc.type = 'sawtooth';
      oscTri.type = 'triangle';
      osc.frequency.setValueAtTime(f, noteStart);
      oscTri.frequency.setValueAtTime(f, noteStart);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, noteStart);

      gain.gain.setValueAtTime(0.001, noteStart);
      gain.gain.linearRampToValueAtTime(0.22, noteStart + 0.01);
      gain.gain.setValueAtTime(0.2, noteStart + d - 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + d);

      osc.connect(gain);
      oscTri.connect(gain);
      gain.connect(filter);
      filter.connect(this.masterGain!);

      osc.start(noteStart);
      oscTri.start(noteStart);
      osc.stop(noteStart + d + 0.01);
      oscTri.stop(noteStart + d + 0.01);
    });

    // Grand Celebratory Sustained Major Triad (at t = 0.58s)
    const chordTime = now + 0.58;
    const chordFreqs = [
      261.63, // C4
      392.0, // G4
      523.25, // C5
      659.25, // E5
      783.99, // G5
      1046.5, // C6
    ];

    chordFreqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, chordTime);

      // Lowpass brass filter opening up
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, chordTime);
      filter.frequency.linearRampToValueAtTime(3200, chordTime + 0.2);
      filter.frequency.exponentialRampToValueAtTime(1800, chordTime + 1.2);

      gain.gain.setValueAtTime(0.001, chordTime);
      gain.gain.linearRampToValueAtTime(0.14, chordTime + 0.03);
      gain.gain.setValueAtTime(0.12, chordTime + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, chordTime + 1.6);

      osc.connect(gain);
      gain.connect(filter);
      filter.connect(this.masterGain!);

      osc.start(chordTime);
      osc.stop(chordTime + 1.65);
    });

    // Shimmering Golden Confetti Chimes over the grand chord
    const highSparkles = [1318.51, 1567.98, 2093.0];
    highSparkles.forEach((freq, idx) => {
      const sparkleTime = chordTime + 0.12 + idx * 0.05;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, sparkleTime);

      gain.gain.setValueAtTime(0.001, sparkleTime);
      gain.gain.linearRampToValueAtTime(0.15, sparkleTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, sparkleTime + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(sparkleTime);
      osc.stop(sparkleTime + 0.52);
    });
  }

  /**
   * 6. playTickle(): Cute squeak / giggle chirp
   * Barnaby the Bear Cub giggles when tapped or pet!
   */
  public async playTickle(): Promise<void> {
    const ctx = await this.ensureContext();
    if (!ctx || this._isMuted || !this.masterGain) return;

    const now = ctx.currentTime;

    // Chirp 1: cute upward squeak with giggle wobble
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';

    osc1.frequency.setValueAtTime(620, now);
    osc1.frequency.exponentialRampToValueAtTime(1250, now + 0.04);
    osc1.frequency.linearRampToValueAtTime(920, now + 0.09);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.26, now + 0.008);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.095);

    osc1.connect(gain1);
    gain1.connect(this.masterGain);

    osc1.start(now);
    osc1.stop(now + 0.1);

    // Chirp 2: second higher squeak (giggle reply)
    const t2 = now + 0.11;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';

    osc2.frequency.setValueAtTime(850, t2);
    osc2.frequency.exponentialRampToValueAtTime(1580, t2 + 0.045);
    osc2.frequency.linearRampToValueAtTime(1180, t2 + 0.11);

    gain2.gain.setValueAtTime(0.001, t2);
    gain2.gain.linearRampToValueAtTime(0.24, t2 + 0.008);
    gain2.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.12);

    osc2.connect(gain2);
    gain2.connect(this.masterGain);

    osc2.start(t2);
    osc2.stop(t2 + 0.13);
  }

  /**
   * 7. playMunch(): Cute crunchy munching sound
   * Barnaby chomps happily on berries, honey, or acorns!
   */
  public async playMunch(): Promise<void> {
    const ctx = await this.ensureContext();
    if (!ctx || this._isMuted || !this.masterGain) return;

    const now = ctx.currentTime;

    // Chomp 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(340, now);
    osc1.frequency.exponentialRampToValueAtTime(140, now + 0.08);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.24, now + 0.005);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start(now);
    osc1.stop(now + 0.1);

    // Chomp 2
    const t2 = now + 0.11;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(460, t2);
    osc2.frequency.exponentialRampToValueAtTime(180, t2 + 0.08);

    gain2.gain.setValueAtTime(0.001, t2);
    gain2.gain.linearRampToValueAtTime(0.22, t2 + 0.005);
    gain2.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.09);

    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(t2);
    osc2.stop(t2 + 0.1);
  }

  /**
   * 8. playExplosionPunch(intensity: number):
   * Deep, punchy, tactile explosion designed specifically for match-3 blasts!
   * - Deep resonant sub-bass thump: pitch-dropped sine from 150Hz down to 35Hz with overdrive saturation.
   * - Snappy acoustic transient crack: crisp high-impact attack transient.
   * - High-frequency sparkle fizzle: glittering crystalline fizzle tail.
   */
  public async playExplosionPunch(intensity: number = 1.0): Promise<void> {
    const ctx = await this.ensureContext();
    if (!ctx || this._isMuted || !this.masterGain) return;

    const safeIntensity = Math.max(0.4, Math.min(2.5, intensity || 1.0));
    const now = ctx.currentTime;

    // ==========================================
    // 1. Deep Resonant Sub-Bass Thump with Overdrive
    // ==========================================
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    const subFilter = ctx.createBiquadFilter();
    const shaper = ctx.createWaveShaper();

    // Soft-clipping overdrive saturation curve for warm, punchy analog harmonic drive
    const curveSamples = 512;
    const curve = new Float32Array(curveSamples);
    const k = 18 * safeIntensity;
    const deg = Math.PI / 180;
    for (let i = 0; i < curveSamples; ++i) {
      const x = (i * 2) / curveSamples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    shaper.curve = curve;
    shaper.oversample = '4x';

    // Pitch-dropped sine from 150Hz down to 35Hz
    subOsc.type = 'sine';
    const startFreq = 150 * (1 + (safeIntensity - 1) * 0.12);
    subOsc.frequency.setValueAtTime(startFreq, now);
    const dropDuration = 0.16 * Math.sqrt(safeIntensity);
    subOsc.frequency.exponentialRampToValueAtTime(35, now + dropDuration);
    subOsc.frequency.linearRampToValueAtTime(30, now + dropDuration + 0.15);

    // Warm sub-bass lowpass filter to tame harsh highs while preserving warm body
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(280, now);
    subFilter.frequency.exponentialRampToValueAtTime(80, now + 0.25 * safeIntensity);

    // Amplitude envelope for punch thump
    const peakSubGain = Math.min(0.46, 0.36 * safeIntensity);
    const totalSubDecay = 0.32 * safeIntensity;
    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(peakSubGain, now + 0.003);
    subGain.gain.setValueAtTime(peakSubGain, now + 0.04);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + totalSubDecay);

    // Sub-bass audio graph routing
    subOsc.connect(subGain);
    subGain.connect(shaper);
    shaper.connect(subFilter);
    subFilter.connect(this.masterGain);

    subOsc.start(now);
    subOsc.stop(now + totalSubDecay + 0.02);

    // ==========================================
    // 2. Snappy Acoustic Transient Crack
    // ==========================================
    // Layer A: Micro-pitch snap chirp
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(1400, now);
    snapOsc.frequency.exponentialRampToValueAtTime(70, now + 0.018);

    const snapPeak = Math.min(0.35, 0.25 * safeIntensity);
    snapGain.gain.setValueAtTime(snapPeak, now);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

    snapOsc.connect(snapGain);
    snapGain.connect(this.masterGain);
    snapOsc.start(now);
    snapOsc.stop(now + 0.025);

    // Layer B: Procedural acoustic crack noise transient
    try {
      const crackSamples = Math.floor(ctx.sampleRate * 0.035);
      const crackBuffer = ctx.createBuffer(1, crackSamples, ctx.sampleRate);
      const crackData = crackBuffer.getChannelData(0);
      for (let i = 0; i < crackSamples; i++) {
        crackData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.006));
      }
      const crackSource = ctx.createBufferSource();
      crackSource.buffer = crackBuffer;

      const crackFilter = ctx.createBiquadFilter();
      crackFilter.type = 'bandpass';
      crackFilter.frequency.setValueAtTime(2400, now);
      crackFilter.Q.setValueAtTime(2.0, now);

      const crackGainNode = ctx.createGain();
      crackGainNode.gain.setValueAtTime(Math.min(0.32, 0.22 * safeIntensity), now);
      crackGainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.034);

      crackSource.connect(crackFilter);
      crackFilter.connect(crackGainNode);
      crackGainNode.connect(this.masterGain);
      crackSource.start(now);
    } catch {
      // Safe fallback if buffer is unavailable
    }

    // ==========================================
    // 3. High-Frequency Sparkle Fizzle
    // ==========================================
    // Sparkling fizzle noise tail
    try {
      const fizzleDuration = 0.26 * safeIntensity;
      const fizzleSamples = Math.floor(ctx.sampleRate * fizzleDuration);
      const fizzleBuffer = ctx.createBuffer(1, fizzleSamples, ctx.sampleRate);
      const fizzleData = fizzleBuffer.getChannelData(0);
      for (let i = 0; i < fizzleSamples; i++) {
        fizzleData[i] = (Math.random() * 2 - 1) * (1 - i / fizzleSamples);
      }
      const fizzleSource = ctx.createBufferSource();
      fizzleSource.buffer = fizzleBuffer;

      const fizzleFilter = ctx.createBiquadFilter();
      fizzleFilter.type = 'bandpass';
      fizzleFilter.frequency.setValueAtTime(5400, now);
      fizzleFilter.frequency.linearRampToValueAtTime(3200, now + fizzleDuration);
      fizzleFilter.Q.setValueAtTime(3.5, now);

      const fizzleGainNode = ctx.createGain();
      fizzleGainNode.gain.setValueAtTime(0.001, now);
      fizzleGainNode.gain.linearRampToValueAtTime(0.14 * safeIntensity, now + 0.015);
      fizzleGainNode.gain.exponentialRampToValueAtTime(0.0001, now + fizzleDuration);

      fizzleSource.connect(fizzleFilter);
      fizzleFilter.connect(fizzleGainNode);
      fizzleGainNode.connect(this.masterGain);
      fizzleSource.start(now);
    } catch {
      // Safe fallback
    }

    // Crystalline high sparkle pings
    const sparklePings = [2637.0, 3520.0];
    sparklePings.forEach((freq, idx) => {
      const pingStart = now + 0.02 + idx * 0.035;
      const pOsc = ctx.createOscillator();
      const pGain = ctx.createGain();

      pOsc.type = 'sine';
      pOsc.frequency.setValueAtTime(freq, pingStart);

      pGain.gain.setValueAtTime(0.001, pingStart);
      pGain.gain.linearRampToValueAtTime(0.12 * Math.min(1.2, safeIntensity), pingStart + 0.004);
      pGain.gain.exponentialRampToValueAtTime(0.0001, pingStart + 0.14);

      pOsc.connect(pGain);
      pGain.connect(this.masterGain!);

      pOsc.start(pingStart);
      pOsc.stop(pingStart + 0.15);
    });
  }

  /**
   * 9. playBeeCopter():
   * Cute buzzing whir sound with rising pitch that ends in a comedic cartoon pop!
   * - Buzzing whir: modulated dual-oscillator with LFO propeller flutter ramping up in pitch.
   * - Cartoon pop: bouncy wooden cork bubble pop ending!
   */
  public async playBeeCopter(): Promise<void> {
    const ctx = await this.ensureContext();
    if (!ctx || this._isMuted || !this.masterGain) return;

    const now = ctx.currentTime;
    const whirDuration = 0.28;

    // --- Component A: Propeller/Wing Flutter LFO ---
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'triangle';
    // LFO frequency accelerates from 38Hz to 62Hz as the copter takes flight!
    lfo.frequency.setValueAtTime(38, now);
    lfo.frequency.linearRampToValueAtTime(62, now + whirDuration);

    lfoGain.gain.setValueAtTime(0.35, now);

    // --- Component B: Cute Buzzing Tone (Sawtooth + Triangle) ---
    const buzzOsc1 = ctx.createOscillator();
    const buzzOsc2 = ctx.createOscillator();
    const buzzGain = ctx.createGain();
    const buzzFilter = ctx.createBiquadFilter();

    buzzOsc1.type = 'sawtooth';
    buzzOsc2.type = 'triangle';

    // Rising pitch sweep: 200Hz up to 520Hz
    buzzOsc1.frequency.setValueAtTime(200, now);
    buzzOsc1.frequency.exponentialRampToValueAtTime(520, now + whirDuration);

    // 1.5x harmonic overtone (musical fifth for cute bumblebee character)
    buzzOsc2.frequency.setValueAtTime(300, now);
    buzzOsc2.frequency.exponentialRampToValueAtTime(780, now + whirDuration);

    // Lowpass filter keeps the buzz sweet and warm, avoiding digital harshness
    buzzFilter.type = 'lowpass';
    buzzFilter.frequency.setValueAtTime(1400, now);
    buzzFilter.frequency.linearRampToValueAtTime(2600, now + whirDuration);

    buzzGain.gain.setValueAtTime(0.001, now);
    buzzGain.gain.linearRampToValueAtTime(0.24, now + 0.02);
    buzzGain.gain.setValueAtTime(0.24, now + whirDuration - 0.02);
    // Snaps shut right before the pop!
    buzzGain.gain.exponentialRampToValueAtTime(0.0001, now + whirDuration);

    // Connect LFO flutter to buzzGain
    lfo.connect(lfoGain);
    lfoGain.connect(buzzGain.gain);

    buzzOsc1.connect(buzzGain);
    buzzOsc2.connect(buzzGain);
    buzzGain.connect(buzzFilter);
    buzzFilter.connect(this.masterGain);

    lfo.start(now);
    buzzOsc1.start(now);
    buzzOsc2.start(now);
    lfo.stop(now + whirDuration + 0.01);
    buzzOsc1.stop(now + whirDuration + 0.01);
    buzzOsc2.stop(now + whirDuration + 0.01);

    // --- Component C: Comedic Cartoon Pop! ---
    const popStart = now + whirDuration;
    const popOsc = ctx.createOscillator();
    const popGain = ctx.createGain();
    const popFilter = ctx.createBiquadFilter();

    popOsc.type = 'sine';
    // Upward bubble/cork chirp that snaps down: 280Hz -> 1180Hz -> 360Hz
    popOsc.frequency.setValueAtTime(280, popStart);
    popOsc.frequency.exponentialRampToValueAtTime(1180, popStart + 0.035);
    popOsc.frequency.exponentialRampToValueAtTime(360, popStart + 0.08);

    popFilter.type = 'bandpass';
    popFilter.frequency.setValueAtTime(1100, popStart);
    popFilter.Q.setValueAtTime(3.0, popStart);

    popGain.gain.setValueAtTime(0.001, popStart);
    popGain.gain.linearRampToValueAtTime(0.38, popStart + 0.004);
    popGain.gain.exponentialRampToValueAtTime(0.0001, popStart + 0.09);

    // Click transient for crisp cork pop
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(1800, popStart);
    clickOsc.frequency.exponentialRampToValueAtTime(180, popStart + 0.015);
    clickGain.gain.setValueAtTime(0.18, popStart);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, popStart + 0.018);

    popOsc.connect(popGain);
    clickOsc.connect(clickGain);
    clickGain.connect(popFilter);
    popGain.connect(popFilter);
    popFilter.connect(this.masterGain);

    popOsc.start(popStart);
    clickOsc.start(popStart);
    popOsc.stop(popStart + 0.1);
    clickOsc.stop(popStart + 0.025);
  }

  /**
   * 10. playStarWand():
   * Diagonal laser shimmer sound with cosmic bell chime.
   * - Diagonal laser shimmer: sweeping dual-detuned oscillator beam with high-Q bandpass sweep.
   * - Cosmic bell chime: crystalline celestial bell cluster with long shimmering decay.
   */
  public async playStarWand(): Promise<void> {
    const ctx = await this.ensureContext();
    if (!ctx || this._isMuted || !this.masterGain) return;

    const now = ctx.currentTime;

    // --- Component A: Diagonal Laser Shimmer Sweep ---
    const laserOsc1 = ctx.createOscillator();
    const laserOsc2 = ctx.createOscillator();
    const laserGain = ctx.createGain();
    const laserFilter = ctx.createBiquadFilter();

    laserOsc1.type = 'sawtooth';
    laserOsc2.type = 'triangle';

    // Rapid diagonal beam pitch drop: 2800Hz down to 260Hz
    laserOsc1.frequency.setValueAtTime(2800, now);
    laserOsc1.frequency.exponentialRampToValueAtTime(260, now + 0.18);

    // Slightly detuned second oscillator for phaser/shimmer beam effect
    laserOsc2.frequency.setValueAtTime(2950, now);
    laserOsc2.frequency.exponentialRampToValueAtTime(280, now + 0.19);

    // Resonant bandpass filter sweeps through harmonic spectrum
    laserFilter.type = 'bandpass';
    laserFilter.frequency.setValueAtTime(3400, now);
    laserFilter.frequency.exponentialRampToValueAtTime(420, now + 0.2);
    laserFilter.Q.setValueAtTime(4.5, now);

    laserGain.gain.setValueAtTime(0.001, now);
    laserGain.gain.linearRampToValueAtTime(0.24, now + 0.006);
    laserGain.gain.setValueAtTime(0.22, now + 0.1);
    laserGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    laserOsc1.connect(laserGain);
    laserOsc2.connect(laserGain);
    laserGain.connect(laserFilter);
    laserFilter.connect(this.masterGain);

    laserOsc1.start(now);
    laserOsc2.start(now);
    laserOsc1.stop(now + 0.23);
    laserOsc2.stop(now + 0.23);

    // --- Component B: Cosmic Bell Chime Cascade ---
    // Celestial chord: C6 (1046.5Hz), E6 (1318.5Hz), G6 (1568Hz), B6 (1975.5Hz), D7 (2349.3Hz)
    const cosmicNotes = [1046.5, 1318.51, 1567.98, 1975.53, 2349.32];
    cosmicNotes.forEach((freq, idx) => {
      const bellStart = now + 0.04 + idx * 0.038;
      const bellOsc = ctx.createOscillator();
      const overtoneOsc = ctx.createOscillator();
      const bellGain = ctx.createGain();

      bellOsc.type = 'sine';
      bellOsc.frequency.setValueAtTime(freq, bellStart);

      // Inharmonic bell overtone at 2.76x frequency (true acoustic bell timbre)
      overtoneOsc.type = 'sine';
      overtoneOsc.frequency.setValueAtTime(freq * 2.756, bellStart);

      const bellDecay = 0.42 + idx * 0.04;
      bellGain.gain.setValueAtTime(0.001, bellStart);
      bellGain.gain.linearRampToValueAtTime(0.18, bellStart + 0.004);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, bellStart + bellDecay);

      bellOsc.connect(bellGain);
      overtoneOsc.connect(bellGain);
      bellGain.connect(this.masterGain!);

      bellOsc.start(bellStart);
      overtoneOsc.start(bellStart);
      bellOsc.stop(bellStart + bellDecay + 0.02);
      overtoneOsc.stop(bellStart + 0.22);
    });
  }

  /**
   * 11. playRoyalCrown():
   * Grand royal trumpet flourish with golden shimmer.
   * - Grand royal trumpet flourish: heraldic brass fanfare arpeggio ending on triumphant major triad.
   * - Golden shimmer: sparkling high-frequency crown-jewel chimes cascading over the fanfare chord.
   */
  public async playRoyalCrown(): Promise<void> {
    const ctx = await this.ensureContext();
    if (!ctx || this._isMuted || !this.masterGain) return;

    const now = ctx.currentTime;

    // --- Component A: Regal Trumpet Fanfare Motif ---
    // G4 -> C5 -> E5 -> G5 -> Triumphant High C6
    const fanfareNotes = [
      { f: 392.0, t: 0.0, d: 0.09 },
      { f: 523.25, t: 0.08, d: 0.09 },
      { f: 659.25, t: 0.16, d: 0.09 },
      { f: 783.99, t: 0.25, d: 0.11 },
      { f: 1046.5, t: 0.38, d: 0.62 }, // Grand sustained high C6
    ];

    fanfareNotes.forEach(({ f, t, d }) => {
      const noteStart = now + t;
      const sawOsc = ctx.createOscillator();
      const triOsc = ctx.createOscillator();
      const brassGain = ctx.createGain();
      const brassFilter = ctx.createBiquadFilter();

      sawOsc.type = 'sawtooth';
      triOsc.type = 'triangle';
      sawOsc.frequency.setValueAtTime(f, noteStart);
      triOsc.frequency.setValueAtTime(f, noteStart);

      // Resonant brass filter opens up on attack for noble trumpet bite
      brassFilter.type = 'lowpass';
      brassFilter.frequency.setValueAtTime(1000, noteStart);
      brassFilter.frequency.linearRampToValueAtTime(3200, noteStart + 0.02);
      brassFilter.frequency.exponentialRampToValueAtTime(1600, noteStart + d);
      brassFilter.Q.setValueAtTime(2.2, noteStart);

      brassGain.gain.setValueAtTime(0.001, noteStart);
      brassGain.gain.linearRampToValueAtTime(0.24, noteStart + 0.008);
      brassGain.gain.setValueAtTime(0.22, noteStart + d - 0.04);
      brassGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + d);

      sawOsc.connect(brassGain);
      triOsc.connect(brassGain);
      brassGain.connect(brassFilter);
      brassFilter.connect(this.masterGain!);

      sawOsc.start(noteStart);
      triOsc.start(noteStart);
      sawOsc.stop(noteStart + d + 0.02);
      triOsc.stop(noteStart + d + 0.02);
    });

    // Grand Triad Harmonization under the final High C6 note (at t = 0.38s)
    const chordTime = now + 0.38;
    const triadHarmony = [523.25, 659.25, 783.99]; // C5, E5, G5 underneath C6
    triadHarmony.forEach((freq) => {
      const harmOsc = ctx.createOscillator();
      const harmGain = ctx.createGain();
      const harmFilter = ctx.createBiquadFilter();

      harmOsc.type = 'triangle';
      harmOsc.frequency.setValueAtTime(freq, chordTime);

      harmFilter.type = 'lowpass';
      harmFilter.frequency.setValueAtTime(2200, chordTime);
      harmFilter.frequency.exponentialRampToValueAtTime(1200, chordTime + 0.6);

      harmGain.gain.setValueAtTime(0.001, chordTime);
      harmGain.gain.linearRampToValueAtTime(0.12, chordTime + 0.015);
      harmGain.gain.setValueAtTime(0.1, chordTime + 0.35);
      harmGain.gain.exponentialRampToValueAtTime(0.0001, chordTime + 0.62);

      harmOsc.connect(harmGain);
      harmGain.connect(harmFilter);
      harmFilter.connect(this.masterGain!);

      harmOsc.start(chordTime);
      harmOsc.stop(chordTime + 0.65);
    });

    // --- Component B: Golden Crown-Jewel Shimmer ---
    // High crystalline sparkles cascading like diamonds glistening in the crown
    const goldenSparkles = [1567.98, 2093.0, 2637.02, 3135.96, 4186.01];
    goldenSparkles.forEach((freq, idx) => {
      const sparkleTime = chordTime + 0.05 + idx * 0.045;
      const sOsc = ctx.createOscillator();
      const sGain = ctx.createGain();

      sOsc.type = 'sine';
      sOsc.frequency.setValueAtTime(freq, sparkleTime);

      sGain.gain.setValueAtTime(0.001, sparkleTime);
      sGain.gain.linearRampToValueAtTime(0.14, sparkleTime + 0.004);
      sGain.gain.exponentialRampToValueAtTime(0.0001, sparkleTime + 0.38);

      sOsc.connect(sGain);
      sGain.connect(this.masterGain!);

      sOsc.start(sparkleTime);
      sOsc.stop(sparkleTime + 0.4);
    });
  }
}

// Export singleton instance for direct non-React calls
export const soundSynthesizer = SoundSynthesizer.getInstance();

/**
 * useSound(): Clean React hook for components and hooks to call audio
 */
export function useSound() {
  const [isMuted, setIsMutedState] = useState<boolean>(soundSynthesizer.isMuted);

  const toggleMute = useCallback(() => {
    const next = soundSynthesizer.toggleMute();
    setIsMutedState(next);
    return next;
  }, []);

  const setMuted = useCallback((mutedVal: boolean) => {
    soundSynthesizer.setMuted(mutedVal);
    setIsMutedState(mutedVal);
  }, []);

  const playTap = useCallback(() => {
    soundSynthesizer.playTap();
  }, []);

  const playMatch = useCallback((combo: number = 1) => {
    soundSynthesizer.playMatch(combo);
  }, []);

  const playSpecialBlast = useCallback(() => {
    soundSynthesizer.playSpecialBlast();
  }, []);

  const playRescueBoost = useCallback(() => {
    soundSynthesizer.playRescueBoost();
  }, []);

  const playVictory = useCallback(() => {
    soundSynthesizer.playVictory();
  }, []);

  const playTickle = useCallback(() => {
    soundSynthesizer.playTickle();
  }, []);

  const playMunch = useCallback(() => {
    soundSynthesizer.playMunch();
  }, []);

  const playExplosionPunch = useCallback((intensity: number = 1.0) => {
    soundSynthesizer.playExplosionPunch(intensity);
  }, []);

  const playBeeCopter = useCallback(() => {
    soundSynthesizer.playBeeCopter();
  }, []);

  const playStarWand = useCallback(() => {
    soundSynthesizer.playStarWand();
  }, []);

  const playRoyalCrown = useCallback(() => {
    soundSynthesizer.playRoyalCrown();
  }, []);

  const setVolume = useCallback((volume: number) => {
    soundSynthesizer.setVolume(volume);
  }, []);

  return {
    playTap,
    playMatch,
    playSpecialBlast,
    playRescueBoost,
    playVictory,
    playTickle,
    playMunch,
    playExplosionPunch,
    playBeeCopter,
    playStarWand,
    playRoyalCrown,
    isMuted,
    toggleMute,
    setMuted,
    setVolume,
  };
}
