/* ============================================================
   LOCALIZATION — required by Playgama : the source language
   must come from bridge.platform.language (or the browser).
   ============================================================ */

const LANG = (() => {
  const SUPPORTED = ['en', 'fr', 'es', 'pt', 'de'];

  const STRINGS = {
    en: {
      'menu.play': 'PLAY',
      'menu.shop': 'SHOP',
      'menu.best': 'BEST',
      'menu.tapStart': 'TAP TO START',
      'sound.on': '🔊',
      'sound.off': '🔇',
      'gameplay.hint': 'TAP TO SWITCH COLOR!',
      'gameplay.perfect': 'PERFECT!',
      'gameplay.shield': 'SHIELD!',
      'loading.text': 'LOADING',
      'gameplay.combo': 'COMBO',
      'gameplay.pause': 'PAUSE',
      'gameplay.resume': 'RESUME',
      'gameplay.restart': 'RESTART',
      'gameplay.quit': 'QUIT',
      'gameover.title': 'GAME OVER',
      'gameover.newBest': 'NEW BEST!',
      'gameover.retry': 'RETRY',
      'gameover.revive': 'REVIVE',
      'gameover.menu': 'MENU',
      'gameover.score': 'SCORE',
      'gameover.best': 'BEST',
      'gameover.coins': 'COINS',
      'shop.title': 'SWEET SHOP',
      'shop.coins': 'COINS',
      'shop.buy': 'BUY',
      'shop.owned': 'OWNED',
      'shop.back': 'BACK',
      'shop.notEnough': 'NOT ENOUGH COINS!',
      'shop.heartPlus': 'Heart +1',
      'shop.doublePoints': 'Double Points',
      'shop.magnet': 'Candy Magnet',
      'shop.shield': 'Sugar Shield'
    },
    fr: {
      'menu.play': 'JOUER',
      'menu.shop': 'BOUTIQUE',
      'menu.best': 'RECORD',
      'menu.tapStart': 'TAPE POUR JOUER',
      'sound.on': '🔊',
      'sound.off': '🔇',
      'gameplay.hint': 'TAPE POUR CHANGER DE COULEUR !',
      'gameplay.perfect': 'PARFAIT !',
      'gameplay.shield': 'BOUCLIER !',
      'loading.text': 'CHARGEMENT',
      'gameplay.combo': 'COMBO',
      'gameplay.pause': 'PAUSE',
      'gameplay.resume': 'REPRENDRE',
      'gameplay.restart': 'RECOMMENCER',
      'gameplay.quit': 'QUITTER',
      'gameover.title': 'PARTIE TERMINÉE',
      'gameover.newBest': 'NOUVEAU RECORD !',
      'gameover.retry': 'REJOUER',
      'gameover.revive': 'CONTINUER',
      'gameover.menu': 'MENU',
      'gameover.score': 'SCORE',
      'gameover.best': 'RECORD',
      'gameover.coins': 'BONBONS',
      'shop.title': 'BOUTIQUE DE BONBONS',
      'shop.coins': 'BONBONS',
      'shop.buy': 'ACHETER',
      'shop.owned': 'POSSÉDÉ',
      'shop.back': 'RETOUR',
      'shop.notEnough': 'PAS ASSEZ DE BONBONS !',
      'shop.heartPlus': 'Cœur +1',
      'shop.doublePoints': 'Points Doubles',
      'shop.magnet': 'Aimant à Bonbons',
      'shop.shield': 'Bouclier Sucré'
    },
    es: {
      'menu.play': 'JUGAR',
      'menu.shop': 'TIENDA',
      'menu.best': 'RÉCORD',
      'menu.tapStart': 'TOCA PARA JUGAR',
      'gameplay.hint': '¡TOCA PARA CAMBIAR DE COLOR!',
      'gameplay.perfect': '¡PERFECTO!',
      'gameplay.shield': '¡ESCUDO!',
      'loading.text': 'CARGANDO',
      'gameplay.combo': 'COMBO',
      'gameplay.pause': 'PAUSA',
      'gameplay.resume': 'CONTINUAR',
      'gameplay.restart': 'REINICIAR',
      'gameplay.quit': 'SALIR',
      'gameover.title': 'FIN DEL JUEGO',
      'gameover.newBest': '¡NUEVO RÉCORD!',
      'gameover.retry': 'REINTENTAR',
      'gameover.revive': 'REVIVIR',
      'gameover.menu': 'MENÚ',
      'gameover.score': 'PUNTOS',
      'gameover.best': 'RÉCORD',
      'gameover.coins': 'DULCES',
      'shop.title': 'TIENDA DE DULCES',
      'shop.coins': 'DULCES',
      'shop.buy': 'COMPRAR',
      'shop.owned': 'COMPRADO',
      'shop.back': 'VOLVER',
      'shop.notEnough': '¡NO HAY SUFICIENTES DULCES!',
      'shop.heartPlus': 'Corazón +1',
      'shop.doublePoints': 'Puntos Dobles',
      'shop.magnet': 'Imán de Dulces',
      'shop.shield': 'Escudo de Azúcar'
    },
    pt: {
      'menu.play': 'JOGAR',
      'menu.shop': 'LOJA',
      'menu.best': 'RECORDE',
      'menu.tapStart': 'TOQUE PARA JOGAR',
      'gameplay.hint': 'TOQUE PARA MUDAR DE COR!',
      'gameplay.perfect': 'PERFEITO!',
      'gameplay.shield': 'ESCUDO!',
      'loading.text': 'CARREGANDO',
      'gameplay.combo': 'COMBO',
      'gameplay.pause': 'PAUSA',
      'gameplay.resume': 'CONTINUAR',
      'gameplay.restart': 'REINICIAR',
      'gameplay.quit': 'SAIR',
      'gameover.title': 'FIM DE JOGO',
      'gameover.newBest': 'NOVO RECORDE!',
      'gameover.retry': 'TENTAR DE NOVO',
      'gameover.revive': 'REVIVER',
      'gameover.menu': 'MENU',
      'gameover.score': 'PONTOS',
      'gameover.best': 'RECORDE',
      'gameover.coins': 'DOCES',
      'shop.title': 'LOJA DE DOCES',
      'shop.coins': 'DOCES',
      'shop.buy': 'COMPRAR',
      'shop.owned': 'COMPRADO',
      'shop.back': 'VOLTAR',
      'shop.notEnough': 'DOCES INSUFICIENTES!',
      'shop.heartPlus': 'Coração +1',
      'shop.doublePoints': 'Pontos Dobrados',
      'shop.magnet': 'Ímã de Doces',
      'shop.shield': 'Escudo de Açúcar'
    },
    de: {
      'menu.play': 'SPIELEN',
      'menu.shop': 'SHOP',
      'menu.best': 'REKORD',
      'menu.tapStart': 'TIPPEN ZUM STARTEN',
      'gameplay.hint': 'TIPPEN ZUM FARBWECHSEL!',
      'gameplay.perfect': 'PERFEKT!',
      'gameplay.shield': 'SCHILD!',
      'loading.text': 'LÄDT',
      'gameplay.combo': 'COMBO',
      'gameplay.pause': 'PAUSE',
      'gameplay.resume': 'WEITER',
      'gameplay.restart': 'NEUSTART',
      'gameplay.quit': 'BEENDEN',
      'gameover.title': 'SPIEL VORBEI',
      'gameover.newBest': 'NEUER REKORD!',
      'gameover.retry': 'NOCHMAL',
      'gameover.revive': 'WEITERSPIELEN',
      'gameover.menu': 'MENÜ',
      'gameover.score': 'PUNKTE',
      'gameover.best': 'REKORD',
      'gameover.coins': 'SÜSSIGKEITEN',
      'shop.title': 'SÜSSIGKEITEN-SHOP',
      'shop.coins': 'SÜSSIGKEITEN',
      'shop.buy': 'KAUFEN',
      'shop.owned': 'GEKAUFT',
      'shop.back': 'ZURÜCK',
      'shop.notEnough': 'NICHT GENUG SÜSSIGKEITEN!',
      'shop.heartPlus': 'Herz +1',
      'shop.doublePoints': 'Doppelte Punkte',
      'shop.magnet': 'Süßigkeiten-Magnet',
      'shop.shield': 'Zucker-Schild'
    }
  };

  function detect() {
    let lang = 'en';
    try {
      const raw = Bridge.platform.language;
      if (SUPPORTED.indexOf(raw) !== -1) lang = raw;
    } catch (e) { /* noop */ }
    return lang;
  }

  let current = detect();

  return {
    get current() { return current; },
    t(key) {
      const table = STRINGS[current] || STRINGS.en;
      return table[key] || STRINGS.en[key] || key;
    }
  };
})();
