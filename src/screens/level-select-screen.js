/* ============================================================
   LEVEL SELECT — the 150-level map (10 worlds × 15 levels)
   Shows stars per completed level, locks the next ones, and
   launches gameplay on tap.
   ============================================================ */

class LevelSelectScreen extends BaseScreen {
  constructor(game) {
    super(game, 'levels');
  }

  build() {
    const cfg = this.game.config;
    const progress = this.game.storage.get('progress', { unlocked: 1, stars: {} });
    const unlocked = Math.max(1, progress.unlocked || 1);

    this.el = document.createElement('div');
    this.el.className = 'screen level-select-screen';
    this.el.innerHTML = '';
    this.el.appendChild(BG.build('menu'));

    const head = document.createElement('div');
    head.className = 'levels-head';
    const title = document.createElement('h2');
    title.className = 'modal-title';
    title.textContent = LANG.t('levels.title');
    head.appendChild(title);
    const homeBtn = new Button({ label: LANG.t('levels.home'), variant: 'back', onClick: () => this.game.show('menu') });
    head.appendChild(homeBtn.el);
    this.el.appendChild(head);

    const scroll = document.createElement('div');
    scroll.className = 'levels-scroll';

    cfg.worlds.forEach((world, wIdx) => {
      const section = document.createElement('div');
      section.className = 'world-section';
      const header = document.createElement('div');
      header.className = 'world-header';
      const name = document.createElement('span');
      name.className = 'world-name';
      name.textContent = `${wIdx + 1}. ${world.name}`;
      header.appendChild(name);
      const worldStars = this.worldStars(progress, wIdx);
      const starsEl = document.createElement('span');
      starsEl.className = 'world-stars';
      starsEl.innerHTML = `<img src="assets/ui/s1.png" alt="" draggable="false">×${worldStars}`;
      header.appendChild(starsEl);
      section.appendChild(header);

      const grid = document.createElement('div');
      grid.className = 'levels-grid';
      for (let i = 0; i < cfg.levelsPerWorld; i += 1) {
        const n = wIdx * cfg.levelsPerWorld + i + 1;
        const locked = n > unlocked;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `level-btn ${locked ? 'locked' : ''}`;
        btn.innerHTML = `<span class="level-btn-num">${n}</span>`;
        if (progress.stars && progress.stars[n]) {
          btn.innerHTML += `<span class="level-btn-stars">${'★'.repeat(progress.stars[n])}</span>`;
        }
        if (locked) {
          btn.innerHTML += '<span class="level-btn-lock">🔒</span>';
          btn.disabled = true;
        } else {
          btn.addEventListener('click', () => {
            this.game.audio.click();
            this.game.show('gameplay', { level: n });
          });
        }
        grid.appendChild(btn);
      }
      section.appendChild(grid);
      scroll.appendChild(section);
    });

    this.el.appendChild(scroll);

    this.onKeyDown((event) => {
      if (event.code === 'Escape') this.game.show('menu');
    });
  }

  worldStars(progress, wIdx) {
    const cfg = this.game.config;
    let total = 0;
    for (let i = 0; i < cfg.levelsPerWorld; i += 1) {
      const n = wIdx * cfg.levelsPerWorld + i + 1;
      if (progress.stars && progress.stars[n]) total += progress.stars[n];
    }
    return total;
  }
}
