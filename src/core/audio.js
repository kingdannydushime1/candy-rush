/* ============================================================
   AUDIO ENGINE — all sounds synthesized with WebAudio
   (no files to download = instant loading). Respects the
   platform audio state (Playgama requirement).
   ============================================================ */

class AudioEngine {
  constructor(game) {
    this.game = game;
    this.ctx = null;
    this.master = null;
    this.settings = { sound: true };
    this.platformMuted = false;
    const saved = game.storage.get('settings', null);
    if (saved) Object.assign(this.settings, saved);
    window.addEventListener('pointerdown', () => this.unlock(), { once: true });
    window.addEventListener('keydown', () => this.unlock(), { once: true });
  }

  ensure() {
    if (this.ctx) return true;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.8;
      this.master.connect(this.ctx.destination);
      return true;
    } catch (error) {
      return false;
    }
  }

  unlock() {
    if (!this.ensure()) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  /* Called by the platform when audio is disabled/enabled */
  setPlatformEnabled(enabled) {
    this.platformMuted = !enabled;
    if (this.ctx && this.master) {
      this.master.gain.linearRampToValueAtTime(enabled ? 0.8 : 0.0001, this.ctx.currentTime + 0.05);
    }
  }

  /* Called when the user toggles sound in the UI */
  toggleSound() {
    this.settings.sound = !this.settings.sound;
    this.game.storage.set('settings', this.settings);
    return this.settings.sound;
  }

  tone({ freq = 440, freqEnd = null, duration = 0.08, type = 'sine', gain = 0.3, when = 0 }) {
    if (!this.settings.sound || this.platformMuted) return;
    if (!this.ensure()) return;
    const start = this.ctx.currentTime + when;
    const oscillator = this.ctx.createOscillator();
    const envelope = this.ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, start);
    if (freqEnd) oscillator.frequency.exponentialRampToValueAtTime(freqEnd, start + duration);
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(gain, start + 0.012);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(envelope);
    envelope.connect(this.master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  /* ----- UI ----- */

  click() {
    this.tone({ freq: 660, freqEnd: 880, type: 'triangle', duration: 0.09, gain: 0.22 });
  }

  hover() {
    this.tone({ freq: 460, freqEnd: 540, type: 'sine', duration: 0.05, gain: 0.05 });
  }

  /* ----- gameplay ----- */

  switchColor() {
    this.tone({ freq: 520, freqEnd: 700, type: 'triangle', duration: 0.06, gain: 0.18 });
  }

  pass(combo) {
    const base = 523; // C5
    const step = combo % 12;
    const freq = base * Math.pow(2, step / 12);
    this.tone({ freq, freqEnd: freq * 1.06, type: 'triangle', duration: 0.12, gain: 0.22 });
  }

  perfect() {
    [880, 1174, 1568].forEach((f, i) => {
      this.tone({ freq: f, type: 'sine', duration: 0.14, gain: 0.16, when: i * 0.06 });
    });
  }

  gem() {
    this.tone({ freq: 988, freqEnd: 1319, type: 'sine', duration: 0.1, gain: 0.15 });
  }

  hit() {
    this.tone({ freq: 220, freqEnd: 90, type: 'sawtooth', duration: 0.25, gain: 0.25 });
  }

  comboMilestone(level) {
    [523, 659, 784, 1047].forEach((f, i) => {
      this.tone({ freq: f * (1 + level * 0.03), type: 'triangle', duration: 0.11, gain: 0.15, when: i * 0.05 });
    });
  }

  gameOver() {
    [660, 523, 392, 262].forEach((f, i) => {
      this.tone({ freq: f, type: 'triangle', duration: 0.22, gain: 0.18, when: i * 0.12 });
    });
  }

  revive() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => {
      this.tone({ freq: f, type: 'sine', duration: 0.16, gain: 0.16, when: i * 0.07 });
    });
  }
}
