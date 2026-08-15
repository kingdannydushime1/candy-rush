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
    this.musicEl = null;
    this.musicTrack = null;
    this.musicBaseRate = 1;
    this.musicWanted = false;
    const saved = game.storage.get('settings', null);
    if (saved) Object.assign(this.settings, saved);
    window.addEventListener('pointerdown', () => this.unlock(), { once: true });
    window.addEventListener('keydown', () => this.unlock(), { once: true });
  }

  /* ----- background music (CC0 loops, one per world) ----- */

  playMusic(path) {
    this.musicWanted = !!path;
    this.musicTrack = path || null;
    if (!path || !this.settings.sound || this.platformMuted) {
      this._stopMusicEl();
      return;
    }
    if (this.musicEl && this.musicEl.dataset.track === path) {
      // already on this track : just make sure it plays
      this._resumeMusicEl();
      return;
    }
    // fully tear down the previous element BEFORE creating the new one,
    // so a late canplaythrough from the old track can never play on top
    // of the new one (this used to make menu + world music overlap)
    this._stopMusicEl();
    try {
      const audio = new Audio();
      audio.src = path;
      audio.dataset.track = path;
      audio.loop = true;
      audio.volume = 0.2;
      audio.preload = 'auto';
      audio.playbackRate = this.musicBaseRate;
      this.musicEl = audio;
      const start = () => {
        if (this.musicEl !== audio || !this.musicWanted) return;
        audio.play().catch(() => { /* autoplay blocked until gesture */ });
        audio.removeEventListener('canplaythrough', start);
      };
      audio.addEventListener('canplaythrough', start);
    } catch (e) { /* noop */ }
  }

  stopMusic() {
    this.musicWanted = false;
    this.musicTrack = null;
    this._stopMusicEl();
  }

  setMusicRate(rate) {
    this.musicBaseRate = rate;
    if (this.musicEl) this.musicEl.playbackRate = rate;
  }

  /* Pause but keep the element (used by the sound toggle / platform) */
  _pauseMusicEl() {
    if (this.musicEl) {
      try { this.musicEl.pause(); } catch (e) { /* noop */ }
    }
  }

  /* Full teardown : pause, drop the source and abort any pending load */
  _stopMusicEl() {
    if (!this.musicEl) return;
    try {
      this.musicEl.pause();
      this.musicEl.removeAttribute('src');
      this.musicEl.load();
    } catch (e) { /* noop */ }
    this.musicEl = null;
  }

  _resumeMusicEl() {
    if (this.musicEl && this.musicWanted && this.settings.sound && !this.platformMuted) {
      try { this.musicEl.play().catch(() => {}); } catch (e) { /* noop */ }
    }
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
    // first user gesture : start the background music if one is queued
    this._resumeMusicEl();
  }

  /* Called by the platform when audio is disabled/enabled */
  setPlatformEnabled(enabled) {
    this.platformMuted = !enabled;
    if (this.ctx && this.master) {
      this.master.gain.linearRampToValueAtTime(enabled ? 0.8 : 0.0001, this.ctx.currentTime + 0.05);
    }
    if (enabled) this._resumeMusicEl();
    else this._pauseMusicEl();
  }

  /* Called when the user toggles sound in the UI */
  toggleSound() {
    this.settings.sound = !this.settings.sound;
    this.game.storage.set('settings', this.settings);
    if (this.settings.sound) {
      if (this.musicWanted) this._resumeMusicEl();
    } else {
      this._pauseMusicEl();
    }
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
