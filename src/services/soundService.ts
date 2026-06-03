// ============================================================
// DevQuest — Sound Service (Web Audio API Synthesizer)
// ============================================================
// Generates all game sounds procedurally via the Web Audio API.
// No external audio files — all sounds are synthesized at runtime.
// AudioContext is created lazily on first user gesture to respect
// browser autoplay policies.
// ============================================================

let audioCtx: AudioContext | null = null;
let _enabled = true;
let alarmIntervalId: ReturnType<typeof setInterval> | null = null;

// ─────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────

function getCtx(): AudioContext | null {
  if (!_enabled) return null;

  if (!audioCtx) {
    try {
      audioCtx = new AudioContext();
    } catch {
      return null;
    }
  }

  // Resume if suspended (happens on mobile after page loses focus)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }

  return audioCtx;
}

/**
 * Plays a single tone at a given frequency.
 * Automatically fades out to avoid clicking artifacts.
 */
function playTone(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainValue = 0.28,
): void {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gainNode.gain.setValueAtTime(gainValue, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.01);
}

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

/** Called by GameStateContext when soundEnabled setting changes */
export function setSoundEnabled(val: boolean): void {
  _enabled = val;
  if (!val) stopAlarm();
}

/**
 * Correct answer sound.
 * Ascending arpeggio: C5 → E5 → G5 → C6 (sine wave, ~0.4s)
 */
export function playCorrect(): void {
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  // C5, E5, G5, C6
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    playTone(ctx, freq, now + i * 0.085, 0.18, 'sine', 0.25);
  });
}

/**
 * Wrong answer sound.
 * Descending frequency sweep: 320Hz → 80Hz (sawtooth, 0.3s)
 */
export function playWrong(): void {
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.32);

  gainNode.gain.setValueAtTime(0.3, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

  osc.start(now);
  osc.stop(now + 0.36);
}

/**
 * Level up fanfare.
 * Ascending 8-bit sequence with a triumphant final chord.
 */
export function playLevelUp(): void {
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  // [frequency, startOffset, duration]
  const sequence: [number, number, number][] = [
    [523.25, 0,    0.12], // C5
    [587.33, 0.1,  0.10], // D5
    [659.25, 0.2,  0.10], // E5
    [698.46, 0.3,  0.10], // F5
    [783.99, 0.4,  0.10], // G5
    [880.0,  0.5,  0.10], // A5
    [1046.5, 0.58, 0.35], // C6 (held)
    [783.99, 0.58, 0.35], // G5 (harmony)
  ];

  sequence.forEach(([freq, offset, dur]) => {
    playTone(ctx, freq, now + offset, dur, 'square', 0.18);
  });
}

/**
 * Coin purchase sound.
 * B5 → E6 twice in quick succession.
 */
export function playCoins(): void {
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Two "ting" sounds
  const hits = [0, 0.11];
  hits.forEach((offset) => {
    playTone(ctx, 987.77, now + offset,        0.06, 'sine', 0.3);  // B5
    playTone(ctx, 1318.51, now + offset + 0.06, 0.1,  'sine', 0.25); // E6
  });
}

/**
 * Single alarm beep — two short pulses.
 */
function playBeep(): void {
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  playTone(ctx, 880, now,        0.08, 'square', 0.35); // A5
  playTone(ctx, 880, now + 0.15, 0.08, 'square', 0.35); // A5 again
}

/**
 * Starts a repeating alarm sound (for Dopamine Timer expiry).
 * Call stopAlarm() to cancel.
 */
export function playAlarm(): void {
  if (!_enabled) return;
  playBeep();
  if (alarmIntervalId === null) {
    alarmIntervalId = setInterval(() => {
      playBeep();
    }, 900);
  }
}

/**
 * Stops the alarm loop started by playAlarm().
 */
export function stopAlarm(): void {
  if (alarmIntervalId !== null) {
    clearInterval(alarmIntervalId);
    alarmIntervalId = null;
  }
}

/**
 * Life recovered — gentle ascending two-tone.
 */
export function playLifeGain(): void {
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  playTone(ctx, 523.25, now,      0.1, 'sine', 0.22); // C5
  playTone(ctx, 783.99, now + 0.1, 0.2, 'sine', 0.2);  // G5
}
