/* ============================================================
   GAMEPLAY — CANDY RUSH engine
   ------------------------------------------------------------
   The cute ball runs UP through candy gates that scroll down.
   Tap to cycle the ball color (pink → mint → sky → lemon).
   Match the gate color to pass : mismatch costs a heart.
   Collect sweets, chain combos, trigger PERFECT near-misses.
   ============================================================ */

class GameplayScreen extends BaseScreen {
  constructor(game) {
    super(game, 'gameplay');
    this.images = {};
    this.resetRun();
  }

  /* ----- state ----- */

  resetRun() {
    const cfg = this.game.config.game;
    const owned = this.game.storage.get('owned', {});
    this.maxHearts = Math.min(cfg.maxHearts, (this.game.config.hud.hearts || 3) + (owned.heart_plus ? 1 : 0));
    this.hearts = this.maxHearts;
    this.score = 0;
    this.coinsEarned = 0;
    this.combo = 0;
    this.gatesPassed = 0;
    this.speed = cfg.baseSpeed;
    this.ballColor = 0;
    this.lastTapTime = -999;
    this.tapCount = 0;
    this.invulnUntil = 0;
    this.shieldUsed = false;
    this.hitTimer = 0;
    this.shake = 0;
    this.flash = 0;
    this.timeScale = 1;
    this.squashX = 1;
    this.squashY = 1;
    this.gates = [];
    this.sweets = [];
    this.particles = [];
    this.floaters = [];
    this.lines = [];
    this.clouds = [];
    this.tutorialDone = false;
    this.paused = false;
    this.state = 'idle';
    this.dying = 0;
    this.deathSnapshot = null;
    this.nowSec = 0;
    this.pf = { w: 0, h: 0, x: 0, ballY: 0, r: 0, margin: 26 };
    this.comboVisible = false;
  }

  captureSnapshot() {
    return {
      score: this.score,
      coinsEarned: this.coinsEarned,
      speed: this.speed,
      gatesPassed: this.gatesPassed,
      gates: this.gates.map((g) => ({ ...g })),
      sweets: this.sweets.map((s) => ({ ...s })),
      tutorialDone: this.tutorialDone
    };
  }

  restoreSnapshot() {
    const snap = this.deathSnapshot;
    if (!snap) return;
    const owned = this.game.storage.get('owned', {});
    this.maxHearts = Math.min(this.game.config.game.maxHearts, (this.game.config.hud.hearts || 3) + (owned.heart_plus ? 1 : 0));
    this.hearts = this.maxHearts;
    this.score = snap.score;
    this.coinsEarned = snap.coinsEarned;
    this.speed = Math.max(this.game.config.game.baseSpeed, snap.speed * 0.85);
    this.gatesPassed = snap.gatesPassed;
    this.gates = snap.gates;
    this.sweets = snap.sweets;
    this.tutorialDone = snap.tutorialDone;
    this.combo = 0;
    this.comboVisible = false;
    this.particles = [];
    this.floaters = [];
    this.lines = [];
    this.invulnUntil = this.nowSec + 1.5;
    this.state = 'running';
    this.updateHeartsDisplay();
    this.updateComboPill();
  }

  /* ----- DOM ----- */

  build() {
    const config = this.game.config;

    this.el = document.createElement('div');
    this.el.className = 'screen gameplay-screen';
    this.el.appendChild(BG.build('gameplay'));

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'game-canvas';
    this.ctx = this.canvas.getContext('2d');

    this.hud = document.createElement('div');
    this.hud.className = 'gameplay-hud';
    this.hud.innerHTML = `
      <div class="hud-left">
        <div class="hud-score">
          <img src="assets/ui/c.png" alt="" draggable="false">
          <span class="hud-score-value">0</span>
        </div>
      </div>
      <div class="hud-center">
        <div class="combo-pill hidden"><span>${LANG.t('gameplay.combo')}</span> <b>x1</b></div>
      </div>
      <div class="hud-right">
        <div class="hud-hearts"></div>
        <button type="button" class="btn btn-square btn-pause" aria-label="Pause">
          <img src="assets/ui/b_8.png" alt="" draggable="false">
          <span class="btn-icon">⏸</span>
        </button>
      </div>
    `;

    this.pauseMenu = document.createElement('div');
    this.pauseMenu.className = 'pause-overlay hidden';
    this.pauseMenu.innerHTML = `
      <div class="pause-card">
        <h2 class="modal-title">${LANG.t('gameplay.pause')}</h2>
        <button type="button" class="btn btn-primary btn-resume"><img src="assets/ui/b_4.png" alt="" draggable="false"><span class="btn-label">${LANG.t('gameplay.resume')}</span></button>
        <button type="button" class="btn btn-secondary btn-restart"><img src="assets/ui/b_5.png" alt="" draggable="false"><span class="btn-label">${LANG.t('gameplay.restart')}</span></button>
        <button type="button" class="btn btn-back btn-quit"><img src="assets/ui/b_2.png" alt="" draggable="false"><span class="btn-label">${LANG.t('gameplay.quit')}</span></button>
      </div>
    `;

    this.el.appendChild(this.canvas);
    this.el.appendChild(this.hud);
    this.el.appendChild(this.pauseMenu);

    this.loadImages();

    // interactions
    this.canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.switchColor();
    });
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    this.hud.querySelector('.btn-pause').addEventListener('click', () => {
      this.game.audio.click();
      this.togglePause();
    });
    this.pauseMenu.querySelector('.btn-resume').addEventListener('click', () => {
      this.game.audio.click();
      this.togglePause();
    });
    this.pauseMenu.querySelector('.btn-restart').addEventListener('click', () => {
      this.game.audio.click();
      this.restartRun();
    });
    this.pauseMenu.querySelector('.btn-quit').addEventListener('click', () => {
      this.game.audio.click();
      this.paused = false;
      this.pauseMenu.classList.add('hidden');
      Bridge.platform.sendMessage('level_paused');
      this.game.show('menu');
    });

    this.onKeyDown((event) => {
      if (event.code === 'Escape') {
        this.togglePause();
      } else if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'Enter') {
        this.switchColor();
      }
    });

    this.updateScoreDisplay();
    this.updateHeartsDisplay();
  }

  loadImages() {
    const list = [
      'assets/candies/donut-sprinkles.png',
      'assets/candies/lollypop.png',
      'assets/candies/cupcake.png',
      'assets/candies/ice-cream.png',
      'assets/candies/cookie.png',
      'assets/candies/candy-bar.png',
      'assets/fx/star.png',
      'assets/fx/spark.png',
      'assets/bg/clouds1.png',
      'assets/bg/cloud3.png',
      'assets/bg/cloud9.png'
    ];
    list.forEach((path) => {
      if (this.images[path]) return;
      const img = new Image();
      img.src = path;
      this.images[path] = img;
    });
  }

  img(path) {
    return this.images[path];
  }

  /* ----- lifecycle ----- */

  enter(previous, options = {}) {
    if (options.revive && this.deathSnapshot) {
      this.restoreSnapshot();
    } else {
      this.resetRun();
      this.state = 'ready';
      this.readyTimer = 0.7;
    }
    this.paused = false;
    this.pauseMenu.classList.add('hidden');
    this.resize();
    this.onResize = () => this.resize();
    window.addEventListener('resize', this.onResize);
    this.lastTime = 0;
    this.frameId = requestAnimationFrame(this.loop.bind(this));
    Bridge.platform.sendMessage('level_started');
  }

  exit() {
    window.removeEventListener('resize', this.onResize);
    cancelAnimationFrame(this.frameId);
    this.frameId = null;
  }

  restartRun() {
    this.game.audio.click();
    this.resetRun();
    this.state = 'ready';
    this.readyTimer = 0.7;
    this.paused = false;
    this.pauseMenu.classList.add('hidden');
    this.lastTime = 0;
  }

  togglePause() {
    if (this.state !== 'running' && this.state !== 'ready') return;
    this.paused = !this.paused;
    this.pauseMenu.classList.toggle('hidden', !this.paused);
    this.game.audio.tone({ freq: 500, freqEnd: 700, type: 'triangle', duration: 0.08, gain: 0.15 });
    Bridge.platform.sendMessage(this.paused ? 'level_paused' : 'level_resumed');
  }

  /* Forced pause from the platform (tab switch, ad, system pause) */
  forcePause() {
    if ((this.state === 'running' || this.state === 'ready') && !this.paused) {
      this.paused = true;
      this.pauseMenu.classList.remove('hidden');
      Bridge.platform.sendMessage('level_paused');
    }
  }

  /* ----- layout ----- */

  resize() {
    const rect = this.el.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.dpr = dpr;
    this.cssW = rect.width;
    this.cssH = rect.height;
    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);
    const w = rect.width;
    const h = rect.height;
    let pfW = Math.min(w - 20, 460);
    if (h < w) pfW = Math.min(pfW, Math.max(260, h * 0.86));
    this.pf = {
      w: pfW,
      h,
      x: (w - pfW) / 2,
      ballY: h * 0.62,
      r: Math.max(15, Math.min(30, pfW * 0.075)),
      margin: Math.max(22, pfW * 0.05)
    };
  }

  /* ----- main loop ----- */

  loop(time) {
    const delta = this.lastTime ? Math.min((time - this.lastTime) / 1000, 0.05) : 0;
    this.lastTime = time;
    this.nowSec = time / 1000;
    if (!this.paused) {
      // slow-mo (PERFECT juice) recovers back to 1
      this.timeScale += (1 - this.timeScale) * Math.min(1, 6 * delta);
      this.update(delta * this.timeScale);
    }
    this.render();
    this.frameId = requestAnimationFrame(this.loop.bind(this));
  }

  update(wdt) {
    if (this.state === 'ready') {
      this.readyTimer -= wdt;
      this.updateFx(wdt);
      if (this.readyTimer <= 0) {
        this.state = 'running';
        this.initWorld();
      }
      return;
    }

    if (this.state === 'running') {
      this.speed = Math.min(
        this.game.config.game.maxSpeed,
        this.game.config.game.baseSpeed + this.gatesPassed * this.game.config.game.speedPerGate
      );
      this.spawnGates();
      this.moveWorld(wdt);
      this.processGates();
      this.updateSweets(wdt);
    } else if (this.state === 'dying') {
      this.dying -= wdt;
      if (this.dying <= 0) {
        this.finalize();
        return;
      }
    }

    this.updateFx(wdt);
  }

  /* ----- world ----- */

  initWorld() {
    for (let i = 0; i < this.game.config.game.gatesPerScreen + 1; i += 1) {
      this.spawnGate();
    }
  }

  pickColor() {
    const prev = this.gates.length ? this.gates[this.gates.length - 1].color : -1;
    let color;
    do {
      color = Math.floor(Math.random() * this.game.config.game.palette.length);
    } while (color === prev && Math.random() < 0.8);
    return color;
  }

  spawnGate() {
    const cfg = this.game.config.game;
    const color = this.pickColor();
    const tapsNeeded = (color - this.ballColor + this.game.config.game.palette.length) % this.game.config.game.palette.length;
    const minGap = Math.max(150, tapsNeeded * 0.24 * this.speed);
    const gap = minGap + Math.random() * Math.min(220, 60 + this.speed * 0.12);
    const h = Math.max(12, Math.min(24, this.pf.w * (0.038 + Math.random() * 0.02)));
    // Place the gate relative to the CURRENT position of the last one
    // (gates scroll down, so this keeps a consistent gap).
    const prevY = this.gates.length ? this.gates[this.gates.length - 1].y : 0;
    const newY = prevY - gap;
    this.gates.push({
      y: newY,
      h,
      color,
      processed: false,
      spawnedAt: this.nowSec
    });
    this.spawnSweetsForGap(newY, prevY);
  }

  spawnSweetsForGap(topY, bottomY) {
    if (Math.random() < 0.35) return; // some gaps stay empty
    const count = Math.random() < 0.55 ? 1 : 2;
    for (let i = 0; i < count; i += 1) {
      const size = 26 + Math.random() * 10;
      this.sweets.push({
        x: this.pf.x + this.pf.margin + Math.random() * (this.pf.w - this.pf.margin * 2),
        y: topY + Math.random() * Math.max(40, bottomY - topY),
        kind: Math.floor(Math.random() * 6),
        size,
        r: size * 0.42,
        phase: Math.random() * Math.PI * 2,
        collected: false
      });
    }
  }

  spawnGates() {
    // Re-read the newest gate each iteration: spawning pushes a new
    // higher gate, so the loop must check the freshly pushed one.
    while (this.gates.length === 0 || this.gates[this.gates.length - 1].y > -200) {
      this.spawnGate();
    }
  }

  moveWorld(wdt) {
    const move = this.hitTimer > 0 ? 0 : this.speed * wdt;
    this.hitTimer = Math.max(0, this.hitTimer - wdt);
    for (const gate of this.gates) gate.y += move;
    for (const sweet of this.sweets) sweet.y += move;
  }

  processGates() {
    const bottom = this.pf.ballY + this.pf.r;
    for (const gate of this.gates) {
      if (!gate.processed && gate.y - gate.h / 2 >= bottom) {
        gate.processed = true;
        if (gate.color === this.ballColor) this.onPass(gate);
        else this.onHit(gate);
      }
    }
    this.gates = this.gates.filter((g) => g.y - g.h / 2 < this.pf.h + 60);
  }

  perfectWindow() {
    const cfg = this.game.config.game;
    const shrink = (this.speed - cfg.baseSpeed) * 0.00012;
    return Math.max(0.1, cfg.perfectWindow - shrink);
  }

  onPass(gate) {
    const cfg = this.game.config.game;
    const owned = this.game.storage.get('owned', {});
    const mult = owned.double_points ? 2 : 1;
    this.combo += 1;
    this.gatesPassed += 1;
    const multiplier = Math.min(10, this.combo);
    let pts = 10 * multiplier;
    const perfect = this.lastTapTime >= gate.spawnedAt && (this.nowSec - this.lastTapTime) <= this.perfectWindow();
    if (perfect) {
      pts += 50;
      this.combo += 1;
    }
    pts *= mult;
    this.score += pts;

    const color = cfg.palette[gate.color];
    this.burst(gate.y - gate.h / 2 - this.pf.r * 0.5, color.body, 10);
    this.float(`+${pts}`, this.pf.x + this.pf.w / 2, gate.y - gate.h / 2 - 26, '#ffffff', Math.min(30, 14 + multiplier * 1.4));
    if (perfect) {
      this.float(LANG.t('gameplay.perfect'), this.pf.x + this.pf.w / 2, gate.y - gate.h / 2 - 58, '#ffd23f', 22);
      this.timeScale = 0.45;
      this.game.audio.perfect();
    }
    this.game.audio.pass(this.combo);

    if (this.combo >= 2) {
      this.comboVisible = true;
      this.comboPulse = 1;
      this.updateComboPill();
    }
    if (this.combo > 0 && this.combo % 5 === 0) {
      this.float(`${LANG.t('gameplay.combo')} x${multiplier}`, this.pf.x + this.pf.w / 2, this.pf.ballY - this.pf.r - 90, '#ffd23f', 24);
      this.game.audio.comboMilestone(Math.min(6, Math.floor(this.combo / 5)));
    }

    if (!this.tutorialDone && this.gatesPassed >= 2) this.tutorialDone = true;
    this.updateScoreDisplay();
  }

  onHit(gate) {
    const owned = this.game.storage.get('owned', {});
    if (owned.shield && !this.shieldUsed) {
      this.shieldUsed = true;
      this.invulnUntil = this.nowSec + 1.0;
      this.burst(this.pf.ballY, '#ffffff', 16);
      this.float('🛡', this.pf.x + this.pf.w / 2, this.pf.ballY - this.pf.r - 40, '#ffffff', 22);
      this.game.audio.hit();
      return;
    }
    this.hearts -= 1;
    this.combo = 0;
    this.comboVisible = false;
    this.updateComboPill();
    this.shake = 0.55;
    this.flash = 0.6;
    this.hitTimer = 0.35;
    this.invulnUntil = this.nowSec + 1.3;
    const color = this.game.config.game.palette[this.ballColor];
    this.burst(this.pf.ballY, color.edge, 18);
    this.game.audio.hit();
    this.updateHeartsDisplay();
    if (this.hearts <= 0) this.startDeath();
  }

  updateSweets(wdt) {
    const owned = this.game.storage.get('owned', {});
    const magnet = !!owned.magnet;
    const bx = this.pf.x + this.pf.w / 2;
    const by = this.pf.ballY;
    const reach = 150;
    for (const sweet of this.sweets) {
      if (sweet.collected) continue;
      let dx = sweet.x - bx;
      let dy = sweet.y - by;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (magnet && dist < reach && dist > 0.5) {
        const pull = Math.min(1, 10 * wdt);
        sweet.x -= dx * pull;
        sweet.y -= dy * pull;
        dx = sweet.x - bx;
        dy = sweet.y - by;
      }
      if (Math.sqrt(dx * dx + dy * dy) < this.pf.r + sweet.r) {
        sweet.collected = true;
        this.onCollect(sweet);
      }
    }
    this.sweets = this.sweets.filter((s) => !s.collected && s.y < this.pf.h + 60);
  }

  onCollect(sweet) {
    const owned = this.game.storage.get('owned', {});
    this.coinsEarned += 1;
    const pts = 25 * (owned.double_points ? 2 : 1);
    this.score += pts;
    this.sparkle(sweet.x, sweet.y, '#ffffff');
    this.float(`+${pts}`, sweet.x, sweet.y - 22, '#ff9ed8', 15);
    this.game.audio.gem();
    this.updateScoreDisplay();
  }

  startDeath() {
    if (this.state === 'dying' || this.state === 'idle') return;
    this.state = 'dying';
    this.dying = 0.9;
    this.deathSnapshot = this.captureSnapshot();
    this.shake = 0.8;
    this.flash = 0.9;
    this.burst(this.pf.x + this.pf.w / 2, this.pf.ballY, '#ffffff', 26);
    this.game.audio.gameOver();
    Bridge.platform.sendMessage('level_failed');
  }

  finalize() {
    if (this.state !== 'dying') return;
    this.state = 'idle';
    const cfg = this.game.config.game;
    const stars = cfg.starScores.filter((s) => this.score >= s).length;
    const prevBest = this.game.storage.get('best', 0);
    const best = Math.max(prevBest, this.score);
    const isNewBest = this.score > prevBest && this.score > 0;
    this.game.storage.set('best', best);
    this.game.storage.set('coins', this.game.storage.get('coins', 0) + this.coinsEarned);
    if (isNewBest) Bridge.platform.sendMessage('player_got_achievement');
    if (this.score > 0) Bridge.leaderboards.setScore(this.game.config.leaderboardId, this.score);
    this.maybeShowInterstitial();
    this.game.show('gameover', { score: this.score, best, stars, coins: this.coinsEarned, isNewBest });
  }

  maybeShowInterstitial() {
    const cfg = this.game.config.game;
    if (!Bridge.advertisement.isInterstitialSupported()) return;
    this.game._interstitialCount = (this.game._interstitialCount || 0) + 1;
    if (this.game._interstitialCount >= (cfg.interstitialsEvery || 2)) {
      this.game._interstitialCount = 0;
      setTimeout(() => Bridge.advertisement.showInterstitial('game_over'), 500);
    }
  }

  /* ----- input ----- */

  switchColor() {
    if (this.state !== 'running' || this.paused) return;
    this.ballColor = (this.ballColor + 1) % this.game.config.game.palette.length;
    this.lastTapTime = this.nowSec;
    this.tapCount += 1;
    this.squashX = 1.22;
    this.squashY = 0.78;
    this.game.audio.switchColor();
  }

  /* ----- fx ----- */

  updateFx(wdt) {
    this.squashX += (1 - this.squashX) * Math.min(1, 10 * wdt);
    this.squashY += (1 - this.squashY) * Math.min(1, 10 * wdt);
    this.shake = Math.max(0, this.shake - wdt * 1.7);
    this.flash = Math.max(0, this.flash - wdt * 2.2);
    this.comboPulse = Math.max(0, (this.comboPulse || 0) - wdt * 3);
    for (const p of this.particles) {
      p.life -= wdt;
      p.x += p.vx * wdt;
      p.y += p.vy * wdt;
      p.vy += (p.gravity || 0) * wdt;
      p.rot += (p.vr || 0) * wdt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    if (this.particles.length > 160) this.particles.splice(0, this.particles.length - 160);
    for (const f of this.floaters) {
      f.life -= wdt;
      f.y += f.vy * wdt;
    }
    this.floaters = this.floaters.filter((f) => f.life > 0);
    this.updateClouds(wdt);
    this.updateLines(wdt);
  }

  updateClouds(wdt) {
    if (this.clouds.length === 0) {
      const defs = [
        { img: 'assets/bg/clouds1.png', scale: 0.55, factor: 0.28, alpha: 0.5 },
        { img: 'assets/bg/cloud3.png', scale: 0.8, factor: 0.4, alpha: 0.6 },
        { img: 'assets/bg/cloud9.png', scale: 0.7, factor: 0.5, alpha: 0.6 },
        { img: 'assets/bg/cloud3.png', scale: 0.55, factor: 0.62, alpha: 0.5 },
        { img: 'assets/bg/clouds1.png', scale: 0.35, factor: 0.8, alpha: 0.35 }
      ];
      defs.forEach((d, i) => {
        this.clouds.push({
          img: d.img,
          scale: d.scale,
          factor: d.factor,
          alpha: d.alpha,
          x: Math.random() * this.pf.w,
          y: -Math.random() * this.pf.h
        });
      });
    }
    const speed = this.state === 'running' ? this.speed : this.speed * 0.3;
    for (const c of this.clouds) {
      c.y += speed * c.factor * wdt;
      if (c.y > this.pf.h + 120) {
        c.y = -120;
        c.x = Math.random() * this.pf.w;
      }
    }
  }

  updateLines(wdt) {
    if (this.state === 'running' && this.speed > 600) {
      const chance = Math.min(0.5, (this.speed - 600) / 700);
      if (Math.random() < chance) {
        this.lines.push({
          x: this.pf.x + this.pf.margin + Math.random() * (this.pf.w - this.pf.margin * 2),
          y: -30,
          len: 40 + Math.random() * 60
        });
      }
    }
    for (const l of this.lines) l.y += this.speed * 1.8 * wdt;
    this.lines = this.lines.filter((l) => l.y < this.pf.h + 40);
  }

  burst(x, y, color, count) {
    for (let i = 0; i < count; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const sp = 40 + Math.random() * 160;
      this.particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 40,
        life: 0.4 + Math.random() * 0.4,
        maxLife: 0.8,
        size: 2 + Math.random() * 4,
        color,
        type: 'circle'
      });
    }
  }

  sparkle(x, y, color) {
    for (let i = 0; i < 6; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const sp = 30 + Math.random() * 90;
      this.particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0.3 + Math.random() * 0.3,
        maxLife: 0.6,
        size: 6 + Math.random() * 8,
        color,
        type: 'star',
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 8,
        img: this.img('assets/fx/star.png')
      });
    }
  }

  float(text, x, y, color, size) {
    this.floaters.push({ text, x, y, vy: -46, life: 0.9, maxLife: 0.9, color, size });
  }

  /* ----- HUD ----- */

  updateScoreDisplay() {
    const value = this.hud.querySelector('.hud-score-value');
    if (value) value.textContent = this.score.toLocaleString();
  }

  updateHeartsDisplay() {
    const container = this.hud.querySelector('.hud-hearts');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < this.maxHearts; i += 1) {
      const img = document.createElement('img');
      img.src = i < this.hearts ? 'assets/ui/l1.png' : 'assets/ui/l2.png';
      img.alt = '';
      img.draggable = false;
      if (i >= this.hearts) img.classList.add('heart-lost');
      container.appendChild(img);
    }
  }

  updateComboPill() {
    const pill = this.hud.querySelector('.combo-pill');
    if (!pill) return;
    if (this.comboVisible && this.combo >= 2) {
      const multiplier = Math.min(10, this.combo);
      pill.classList.remove('hidden');
      pill.querySelector('b').textContent = `x${multiplier}`;
    } else {
      pill.classList.add('hidden');
    }
  }

  /* ----- render ----- */

  render() {
    const { ctx, dpr } = this;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.cssW, this.cssH);

    ctx.save();
    const shX = (Math.random() - 0.5) * this.shake * 22;
    const shY = (Math.random() - 0.5) * this.shake * 22;
    ctx.translate(shX, shY);

    this.drawClouds();
    this.drawLines();
    this.drawGates();
    this.drawSweets();
    this.drawParticles();
    this.drawBall();
    this.drawFloaters();
    this.drawTutorial();
    this.drawFlash();

    ctx.restore();
  }

  rr(x, y, w, h, r) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  drawClouds() {
    const ctx = this.ctx;
    for (const c of this.clouds) {
      const img = this.img(c.img);
      if (!img || !img.complete || img.naturalWidth === 0) continue;
      const w = img.naturalWidth * c.scale;
      const h = img.naturalHeight * c.scale;
      ctx.globalAlpha = c.alpha;
      ctx.drawImage(img, c.x, c.y, w, h);
      ctx.globalAlpha = 1;
    }
  }

  drawLines() {
    if (this.lines.length === 0) return;
    const ctx = this.ctx;
    const alpha = Math.min(0.3, (this.speed - 600) / 1200);
    ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
    for (const l of this.lines) {
      ctx.fillRect(l.x, l.y, 3, l.len);
    }
  }

  drawGates() {
    const ctx = this.ctx;
    const cfg = this.game.config.game;
    const x = this.pf.x;
    const w = this.pf.w;
    for (const gate of this.gates) {
      const col = cfg.palette[gate.color];
      const gy = gate.y - gate.h / 2;
      const r = gate.h / 2;
      // body
      ctx.fillStyle = col.body;
      this.rr(x, gy, w, gate.h, r);
      ctx.fill();
      // glossy top
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      this.rr(x, gy, w, gate.h * 0.34, r);
      ctx.fill();
      // darker bottom edge
      ctx.fillStyle = col.edge;
      this.rr(x, gy + gate.h - gate.h * 0.3, w, gate.h * 0.3, r);
      ctx.fill();
      // candy stripe
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fillRect(x + w * 0.08, gy + gate.h * 0.55, w * 0.06, gate.h * 0.18);
      ctx.fillRect(x + w * 0.86, gy + gate.h * 0.55, w * 0.06, gate.h * 0.18);
    }
  }

  drawSweets() {
    const ctx = this.ctx;
    const paths = [
      'assets/candies/cookie.png',
      'assets/candies/ice-cream.png',
      'assets/candies/candy-bar.png',
      'assets/candies/cupcake.png',
      'assets/candies/lollypop.png',
      'assets/candies/donut-sprinkles.png'
    ];
    for (const sweet of this.sweets) {
      const img = this.img(paths[sweet.kind]);
      if (!img || !img.complete || img.naturalWidth === 0) continue;
      const bob = Math.sin(this.nowSec * 3 + sweet.phase) * 2.5;
      const size = sweet.size;
      ctx.save();
      ctx.translate(sweet.x, sweet.y + bob);
      ctx.rotate(Math.sin(this.nowSec * 1.6 + sweet.phase) * 0.15);
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      ctx.restore();
    }
  }

  drawParticles() {
    const ctx = this.ctx;
    for (const p of this.particles) {
      const t = p.life / p.maxLife;
      if (p.type === 'star' && p.img) {
        ctx.globalAlpha = t;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.drawImage(p.img, -p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
        ctx.globalAlpha = 1;
      } else {
        ctx.globalAlpha = t;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * t, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }

  drawBall() {
    const ctx = this.ctx;
    const cfg = this.game.config.game;
    const col = cfg.palette[this.ballColor];
    const r = this.pf.r;
    const bx = this.pf.x + this.pf.w / 2;
    const by = this.pf.ballY;
    const owned = this.game.storage.get('owned', {});

    ctx.save();
    ctx.translate(bx, by);
    ctx.scale(this.squashX, this.squashY);

    ctx.shadowColor = col.glow;
    ctx.shadowBlur = 16;
    const grad = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
    grad.addColorStop(0, col.body);
    grad.addColorStop(0.75, col.body);
    grad.addColorStop(1, col.edge);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // shine
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.32, -r * 0.42, r * 0.28, r * 0.15, -0.55, 0, Math.PI * 2);
    ctx.fill();

    // kawaii face (blinks while invulnerable)
    const blink = this.invulnUntil > this.nowSec && Math.sin(this.nowSec * 26) > 0.55;
    if (!blink) {
      ctx.fillStyle = '#4a2b3e';
      ctx.beginPath();
      ctx.arc(-r * 0.3, -r * 0.05, r * 0.11, 0, Math.PI * 2);
      ctx.arc(r * 0.3, -r * 0.05, r * 0.11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#4a2b3e';
      ctx.lineWidth = Math.max(2, r * 0.09);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, r * 0.02, r * 0.24, 0.2, Math.PI - 0.2);
      ctx.stroke();
      // blush
      ctx.fillStyle = 'rgba(255,120,170,0.5)';
      ctx.beginPath();
      ctx.ellipse(-r * 0.46, r * 0.18, r * 0.16, r * 0.09, 0, 0, Math.PI * 2);
      ctx.ellipse(r * 0.46, r * 0.18, r * 0.16, r * 0.09, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // shield ring (shop upgrade, one use per run)
    if (owned.shield && !this.shieldUsed) {
      ctx.strokeStyle = `rgba(255,255,255,${0.5 + 0.4 * Math.sin(this.nowSec * 6)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, r + 7, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawFloaters() {
    const ctx = this.ctx;
    for (const f of this.floaters) {
      const t = f.life / f.maxLife;
      ctx.globalAlpha = Math.min(1, t * 1.6);
      ctx.font = `${f.size}px "Kenney Mini Square","Segoe UI",Arial,sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(74,43,62,0.9)';
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
      ctx.globalAlpha = 1;
    }
  }

  drawTutorial() {
    if (this.tutorialDone || this.state !== 'running') return;
    const ctx = this.ctx;
    const cx = this.pf.x + this.pf.w / 2;
    const cy = this.pf.ballY - this.pf.r - 46 + Math.sin(this.nowSec * 4) * 4;
    const text = LANG.t('gameplay.hint');
    ctx.font = `18px "Kenney Mini Square","Segoe UI",Arial,sans-serif`;
    const tw = ctx.measureText(text).width;
    const w = Math.min(this.pf.w - 40, tw + 36);
    const h = 40;
    const x = cx - w / 2;
    const y = cy - h / 2;

    ctx.fillStyle = 'rgba(255,255,255,0.94)';
    this.rr(x, y, w, h, h / 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(74,43,62,0.25)';
    ctx.lineWidth = 2;
    this.rr(x, y, w, h, h / 2);
    ctx.stroke();

    ctx.fillStyle = '#4a2b3e';
    ctx.font = `18px "Kenney Mini Square","Segoe UI",Arial,sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, cx, cy);

    // color order dots
    const palette = this.game.config.game.palette;
    const dotR = 7;
    const total = palette.length * (dotR * 2 + 6) - 6;
    let dx = cx - total / 2 + dotR;
    for (let i = 0; i < palette.length; i += 1) {
      ctx.fillStyle = palette[i].body;
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(dx, cy + h / 2 + dotR + 6, dotR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      dx += dotR * 2 + 6;
    }
  }

  drawFlash() {
    if (this.flash <= 0) return;
    const ctx = this.ctx;
    ctx.fillStyle = `rgba(255,90,120,${(this.flash * 0.3).toFixed(3)})`;
    ctx.fillRect(0, 0, this.cssW, this.cssH);
  }
}
