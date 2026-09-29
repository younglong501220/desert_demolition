/**
 * Synthesized Web Audio Sound System for Desert Demolition
 * Authentic 16-bit / cartoon slapstick audio effects & ragtime chiptune background score.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxEnabled: boolean = true;
  private bgmEnabled: boolean = true;
  private sfxVolume: number = 0.7;
  private bgmVolume: number = 0.35;
  private isBgmPlaying: boolean = false;
  private bgmTimer: number | null = null;
  private bgmStep: number = 0;

  constructor() {
    // Restore sound preferences
    try {
      const storedSfx = localStorage.getItem('desert_sfx');
      const storedBgm = localStorage.getItem('desert_bgm');
      if (storedSfx !== null) this.sfxEnabled = storedSfx === 'true';
      if (storedBgm !== null) this.bgmEnabled = storedBgm === 'true';
    } catch {
      // LocalStorage fallback
    }
  }

  private initCtx(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public enableAudio(): void {
    this.initCtx();
    if (this.bgmEnabled && !this.isBgmPlaying) {
      this.startBgm();
    }
  }

  public setSfxEnabled(enabled: boolean): void {
    this.sfxEnabled = enabled;
    try { localStorage.setItem('desert_sfx', String(enabled)); } catch {}
  }

  public setBgmEnabled(enabled: boolean): void {
    this.bgmEnabled = enabled;
    try { localStorage.setItem('desert_bgm', String(enabled)); } catch {}
    if (enabled) {
      this.startBgm();
    } else {
      this.stopBgm();
    }
  }

  public isSfxOn(): boolean { return this.sfxEnabled; }
  public isBgmOn(): boolean { return this.bgmEnabled; }

  /**
   * Iconic Road Runner Beep-Beep sound
   */
  public playBeep(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime;

    const beepTone = (timeOffset: number, freq1: number, freq2: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq1, now + timeOffset);
      osc.frequency.exponentialRampToValueAtTime(freq2, now + timeOffset + 0.05);

      gain.gain.setValueAtTime(0, now + timeOffset);
      gain.gain.linearRampToValueAtTime(0.3 * this.sfxVolume, now + timeOffset + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + 0.1);
    };

    // First "BEEP"
    beepTone(0, 920, 1150);
    // Second higher "BEEP!"
    beepTone(0.12, 1050, 1380);
  }

  /**
   * Cartoon Spring Boing
   */
  public playSpring(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.28);
    // wobble pitch like cartoon spring
    osc.frequency.setValueAtTime(700, now + 0.32);
    osc.frequency.linearRampToValueAtTime(520, now + 0.45);

    gain.gain.setValueAtTime(0.3 * this.sfxVolume, now);
    gain.gain.linearRampToValueAtTime(0.2 * this.sfxVolume, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  /**
   * Jump whoosh
   */
  public playJump(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(650, now + 0.18);

    gain.gain.setValueAtTime(0.25 * this.sfxVolume, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.19);
  }

  /**
   * ACME Rocket Whoosh & Burn
   */
  public playRocketBurst(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(520, now + 0.25);
    osc.frequency.linearRampToValueAtTime(260, now + 0.4);

    gain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  /**
   * Cartoon Falling Slide Whistle
   */
  public playFallWhistle(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(980, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.95);

    gain.gain.setValueAtTime(0.28 * this.sfxVolume, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.95);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.96);
  }

  /**
   * Cartoon Sign click ("HELP!")
   */
  public playSignClick(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(550, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);

    gain.gain.setValueAtTime(0.25 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * Cartoon Explosion / Dynamite Boom
   */
  public playExplosion(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime;

    // Sub thump
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.35);

    gain.gain.setValueAtTime(0.45 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.36);

    // White noise blast
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.12));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3 * this.sfxVolume, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
  }

  /**
   * Metallic Anvil Clang or Wall Crash
   */
  public playCrash(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(420, now);
    osc1.frequency.exponentialRampToValueAtTime(90, now + 0.3);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(680, now);
    osc2.frequency.exponentialRampToValueAtTime(120, now + 0.25);

    gain.gain.setValueAtTime(0.35 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  }

  /**
   * ACME supply crate pickup chime
   */
  public playPickup(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.18 * this.sfxVolume, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.12);
    });
  }

  /**
   * Victory fanfare "That's All Folks!" Looney Tunes chord
   */
  public playFanfare(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime;

    const chords = [
      { time: 0, notes: [440, 554, 659] },       // A major
      { time: 0.18, notes: [493, 622, 740] },    // B major
      { time: 0.36, notes: [554, 698, 830] },    // C# major
      { time: 0.60, notes: [659, 830, 987, 1318] } // E major blast
    ];

    chords.forEach(chord => {
      chord.notes.forEach(note => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note, now + chord.time);

        gain.gain.setValueAtTime(0.15 * this.sfxVolume, now + chord.time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + chord.time + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + chord.time);
        osc.stop(now + chord.time + 0.36);
      });
    });
  }

  /**
   * 16-bit Looney Tunes Desert Ragtime BGM Sequencer
   */
  public startBgm(): void {
    if (!this.bgmEnabled || this.isBgmPlaying) return;
    const ctx = this.initCtx();
    this.isBgmPlaying = true;
    this.bgmStep = 0;

    // Upbeat classic cartoon chase melody notes in Hz
    // G major ragtime groove with bass bounce
    const melody: { note: number; len: number }[] = [
      { note: 392.00, len: 0.12 }, // G4
      { note: 440.00, len: 0.12 }, // A4
      { note: 493.88, len: 0.12 }, // B4
      { note: 523.25, len: 0.12 }, // C5
      { note: 587.33, len: 0.24 }, // D5
      { note: 523.25, len: 0.12 }, // C5
      { note: 493.88, len: 0.24 }, // B4
      { note: 392.00, len: 0.24 }, // G4
      { note: 440.00, len: 0.12 }, // A4
      { note: 493.88, len: 0.12 }, // B4
      { note: 440.00, len: 0.12 }, // A4
      { note: 369.99, len: 0.12 }, // F#4
      { note: 392.00, len: 0.35 }, // G4
      { note: 0, len: 0.12 },      // rest
      { note: 587.33, len: 0.12 }, // D5
      { note: 659.25, len: 0.12 }, // E5
      { note: 698.46, len: 0.12 }, // F5
      { note: 783.99, len: 0.24 }, // G5
      { note: 659.25, len: 0.12 }, // E5
      { note: 587.33, len: 0.24 }, // D5
      { note: 493.88, len: 0.24 }, // B4
      { note: 440.00, len: 0.18 }, // A4
      { note: 493.88, len: 0.18 }, // B4
      { note: 392.00, len: 0.36 }  // G4
    ];

    const playNextNote = () => {
      if (!this.isBgmPlaying || !this.bgmEnabled) return;
      const current = melody[this.bgmStep % melody.length];
      this.bgmStep++;

      if (current.note > 0) {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // 16-bit square/triangle chiptune timbre
        osc.type = (this.bgmStep % 2 === 0) ? 'triangle' : 'square';
        osc.frequency.setValueAtTime(current.note, now);

        gain.gain.setValueAtTime(0.08 * this.bgmVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + current.len * 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + current.len);

        // Accompanying cartoon bass slap on downbeats
        if (this.bgmStep % 4 === 1) {
          const bassOsc = ctx.createOscillator();
          const bassGain = ctx.createGain();
          bassOsc.type = 'triangle';
          bassOsc.frequency.setValueAtTime(98.00, now); // G2 bass
          bassGain.gain.setValueAtTime(0.12 * this.bgmVolume, now);
          bassGain.gain.exponentialRampToValueAtTime(0.005, now + 0.15);
          bassOsc.connect(bassGain);
          bassGain.connect(ctx.destination);
          bassOsc.start(now);
          bassOsc.stop(now + 0.16);
        }
      }

      this.bgmTimer = window.setTimeout(playNextNote, current.len * 1000);
    };

    playNextNote();
  }

  public stopBgm(): void {
    this.isBgmPlaying = false;
    if (this.bgmTimer !== null) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const sound = new SoundEngine();
