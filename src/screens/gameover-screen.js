class GameOverScreen extends BaseScreen {
  constructor(game) {
    super(game, 'gameover');
  }

  build(options = {}) {
    const score = options.score || 0;
    const best = options.best || 0;
    const stars = options.stars != null ? options.stars : 0;
    const coins = options.coins || 0;
    const isNewBest = !!options.isNewBest;

    this.el = document.createElement('div');
    this.el.className = 'screen gameover-screen';
    this.el.innerHTML = '';
    this.el.appendChild(BG.build('menu'));

    const panel = new Panel({ image: 'assets/ui/f.png' });
    const children = [this.titleEl(isNewBest ? LANG.t('gameover.newBest') : LANG.t('gameover.title'), isNewBest)];
    children.push(this.starsEl(stars));
    children.push(this.scoreEl(score));
    if (coins > 0) children.push(this.coinsEl(coins));
    children.push(this.bestEl(best));
    children.push(this.buttonEl(LANG.t('gameover.retry'), 'primary', () => this.retry()));
    if (Bridge.advertisement.isRewardedSupported()) {
      children.push(this.buttonEl(LANG.t('gameover.revive'), 'secondary', (event, btn) => this.revive(btn)));
    }
    children.push(this.buttonEl(LANG.t('gameover.menu'), 'back', () => this.menu()));
    panel.add(...children);
    this.el.appendChild(panel.el);

    this.onKeyDown((event) => {
      if (event.code === 'Enter' || event.code === 'Space') this.retry();
    });
  }

  titleEl(text, isNewBest) {
    const h = document.createElement('h2');
    h.className = `modal-title ${isNewBest ? 'title-new-best' : ''}`;
    h.textContent = text;
    return h;
  }

  starsEl(count) {
    const row = document.createElement('div');
    row.className = 'modal-stars';
    for (let i = 0; i < 3; i += 1) {
      const img = document.createElement('img');
      img.src = i < count ? 'assets/ui/s1.png' : 'assets/ui/s2.png';
      img.alt = '';
      row.appendChild(img);
    }
    return row;
  }

  scoreEl(score) {
    const row = document.createElement('div');
    row.className = 'modal-score';
    row.innerHTML = `<img src="assets/ui/c.png" alt="" draggable="false"><span>${score.toLocaleString()}</span>`;
    return row;
  }

  coinsEl(coins) {
    const row = document.createElement('div');
    row.className = 'modal-coins';
    row.innerHTML = `<img src="assets/ui/c.png" alt="" draggable="false"><span>+${coins.toLocaleString()}</span>`;
    return row;
  }

  bestEl(best) {
    const div = document.createElement('div');
    div.className = 'modal-best';
    div.textContent = `${LANG.t('gameover.best')} ${best.toLocaleString()}`;
    return div;
  }

  buttonEl(label, variant, onClick) {
    return new Button({ label, variant, onClick });
  }

  retry() {
    this.game.audio.click();
    this.game.show(this.game.config.playTarget || 'gameplay');
  }

  revive(btn) {
    this.game.audio.click();
    if (btn && btn.el) btn.el.disabled = true;
    Bridge.advertisement.showRewarded('revive').then((rewarded) => {
      if (rewarded) {
        this.game.audio.revive();
        this.game.show('gameplay', { revive: true });
      } else if (btn && btn.el) {
        btn.el.disabled = false;
      }
    });
  }

  menu() {
    this.game.audio.click();
    this.game.show('menu');
  }
}
