class MenuScreen extends BaseScreen {
  constructor(game) {
    super(game, 'menu');
  }

  build() {
    const config = this.game.config;
    const best = this.game.storage.get('best', 0);

    this.el = document.createElement('div');
    this.el.className = 'screen menu-screen';
    this.el.innerHTML = `
      <div class="menu-content">
        <div class="menu-deco menu-deco-left"><img src="assets/candies/lollypop.png" alt="" draggable="false"></div>
        <div class="menu-deco menu-deco-right"><img src="assets/candies/cupcake.png" alt="" draggable="false"></div>
        <h1 class="game-title">${config.title}</h1>
        <div class="menu-best">
          <img src="assets/ui/s1.png" alt="" draggable="false">
          <span>${LANG.t('menu.best')} ${best.toLocaleString()}</span>
        </div>
        <div class="menu-buttons">
          ${this.playButton()}
          ${config.features.shop ? this.shopButton() : ''}
        </div>
        <div class="menu-sound">${this.soundButton()}</div>
      </div>
    `;
    this.el.insertBefore(BG.build('menu'), this.el.firstChild);

    this.el.querySelector('.btn-play').addEventListener('click', () => this.startGame());
    const shopButton = this.el.querySelector('.btn-shop');
    if (shopButton) shopButton.addEventListener('click', () => this.openShop());
    this.el.querySelector('.btn-sound').addEventListener('click', (event) => this.toggleSound(event));

    this.onKeyDown((event) => {
      if (event.code === 'Enter' || event.code === 'Space') this.startGame();
    });
  }

  playButton() {
    return `
      <button type="button" class="btn btn-primary btn-play" aria-label="Play">
        <img src="assets/ui/b_4.png" alt="" draggable="false">
        <span class="btn-label">${LANG.t('menu.play')}</span>
      </button>
    `;
  }

  shopButton() {
    return `
      <button type="button" class="btn btn-secondary btn-shop" aria-label="Shop">
        <img src="assets/ui/b_5.png" alt="" draggable="false">
        <span class="btn-label">${LANG.t('menu.shop')}</span>
      </button>
    `;
  }

  soundButton() {
    const on = this.game.audio.settings.sound;
    return `
      <button type="button" class="btn btn-square btn-sound" aria-label="Sound">
        <img src="assets/ui/b_8.png" alt="" draggable="false">
        <span class="btn-icon">${on ? LANG.t('sound.on') : LANG.t('sound.off')}</span>
      </button>
    `;
  }

  startGame() {
    this.game.audio.click();
    this.game.show(this.game.config.playTarget || 'gameplay');
  }

  openShop() {
    this.game.audio.click();
    this.game.show('shop');
  }

  toggleSound(event) {
    event.stopPropagation();
    this.game.audio.click();
    const on = this.game.audio.toggleSound();
    event.currentTarget.querySelector('.btn-icon').textContent = on ? LANG.t('sound.on') : LANG.t('sound.off');
  }
}
