class ShopScreen extends BaseScreen {
  constructor(game) {
    super(game, 'shop');
  }

  build() {
    const items = this.game.config.shop.items;

    this.el = document.createElement('div');
    this.el.className = 'screen shop-screen';
    this.el.appendChild(BG.build('menu'));

    const panel = new Panel({ image: 'assets/ui/f.png' });
    panel.add(
      this.titleEl(LANG.t('shop.title')),
      this.coinsEl(),
      this.itemsEl(items),
      this.backButton()
    );
    this.el.appendChild(panel.el);

    this.toast = document.createElement('div');
    this.toast.className = 'shop-toast';
    this.el.appendChild(this.toast);

    this.onKeyDown((event) => {
      if (event.code === 'Escape') this.game.show('menu');
    });
  }

  titleEl(text) {
    const h = document.createElement('h2');
    h.className = 'modal-title';
    h.textContent = text;
    return h;
  }

  coinsEl() {
    const row = document.createElement('div');
    row.className = 'shop-coins';
    row.innerHTML = `<img src="assets/ui/c.png" alt="" draggable="false"><span>${this.getCoins()}</span>`;
    return row;
  }

  itemsEl(items) {
    const list = document.createElement('div');
    list.className = 'shop-list';
    items.forEach((item) => {
      const owned = this.isOwned(item.id);
      const row = document.createElement('div');
      row.className = `shop-item ${owned ? 'owned' : ''}`;
      row.innerHTML = `
        <span class="shop-item-name">${LANG.t(item.nameKey)}</span>
        <span class="shop-item-price"><img src="assets/ui/c.png" alt="" draggable="false">${item.price.toLocaleString()}</span>
      `;
      const buyButton = new Button({
        label: owned ? LANG.t('shop.owned') : LANG.t('shop.buy'),
        variant: 'secondary',
        onClick: (event, btn) => this.buy(item, btn)
      });
      if (owned) {
        buyButton.el.classList.add('btn-owned');
        buyButton.el.disabled = true;
      }
      row.appendChild(buyButton.el);
      list.appendChild(row);
    });
    return list;
  }

  backButton() {
    return new Button({
      label: LANG.t('shop.back'),
      variant: 'back',
      onClick: () => this.game.show('menu')
    });
  }

  getCoins() {
    return this.game.storage.get('coins', 0);
  }

  isOwned(id) {
    const owned = this.game.storage.get('owned', {});
    return !!owned[id];
  }

  buy(item, button) {
    const coins = this.getCoins();
    if (this.isOwned(item.id)) return;
    if (coins >= item.price) {
      this.game.storage.set('coins', coins - item.price);
      const owned = this.game.storage.get('owned', {});
      owned[item.id] = true;
      this.game.storage.set('owned', owned);
      this.game.audio.click();
      button.el.classList.add('btn-owned');
      button.el.disabled = true;
      button.el.querySelector('.btn-label').textContent = LANG.t('shop.owned');
      this.refreshCoins();
      this.showToast(`${item.name} ✔`);
    } else {
      this.game.audio.hit();
      this.showToast(LANG.t('shop.notEnough'));
    }
  }

  showToast(text) {
    if (!this.toast) return;
    this.toast.textContent = text;
    this.toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this.toast.classList.remove('show'), 1400);
  }

  refreshCoins() {
    const value = this.el.querySelector('.shop-coins span');
    if (value) value.textContent = this.getCoins().toLocaleString();
  }
}
