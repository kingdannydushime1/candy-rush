/* ============================================================
   CANDY RUSH — GAME CONFIGURATION
   Color Rush mechanic : tap to switch the ball's color and
   pass through matching candy gates. Collect sweets, build
   combos, chase the best score.
   ------------------------------------------------------------
   Everything below is customizable without touching the engine.
   ============================================================ */

const GAME_CONFIG = {
  id: 'candy-rush',
  firstScreen: 'loading',
  playTarget: 'gameplay',

  /* ----- game identity ----- */
  title: 'CANDY RUSH',
  leaderboardId: 'candy_rush_best',

  /* ----- loading screen -----
     Every image the game uses, so the loading bar fills with
     real progress. */
  loading: {
    loadTarget: 'menu',
    assets: [
      // parallax background elements (Kenney, CC0)
      'assets/bg/sun.png',
      'assets/bg/clouds1.png',
      'assets/bg/cloud3.png',
      'assets/bg/cloud9.png',
      // collectible sweets (Kenney Food Kit, CC0)
      'assets/candies/donut-sprinkles.png',
      'assets/candies/lollypop.png',
      'assets/candies/cupcake.png',
      'assets/candies/ice-cream.png',
      'assets/candies/cookie.png',
      'assets/candies/candy-bar.png',
      // particle effects (Kenney Particle Pack, CC0)
      'assets/fx/star.png',
      'assets/fx/spark.png'
    ]
  },

  /* ----- optional features ----- */
  features: {
    shop: true
  },

  /* ----- shop items (owned once, effects apply in gameplay) ----- */
  shop: {
    items: [
      { id: 'heart_plus', nameKey: 'shop.heartPlus', price: 150 },
      { id: 'double_points', nameKey: 'shop.doublePoints', price: 250 },
      { id: 'magnet', nameKey: 'shop.magnet', price: 300 },
      { id: 'shield', nameKey: 'shop.shield', price: 400 }
    ]
  },

  /* ----- gameplay HUD ----- */
  hud: {
    showScore: true,
    showHearts: true,
    hearts: 3
  },

  /* ----- gameplay tuning ----- */
  game: {
    palette: [
      { id: 'pink', body: '#ff9ed8', edge: '#f45baf', glow: 'rgba(255,158,216,0.55)' },
      { id: 'mint', body: '#8fe8c6', edge: '#3ecfa0', glow: 'rgba(143,232,198,0.55)' },
      { id: 'sky', body: '#8fd0ff', edge: '#4ba8f5', glow: 'rgba(143,208,255,0.55)' },
      { id: 'lemon', body: '#ffe58a', edge: '#f5c542', glow: 'rgba(255,229,138,0.55)' }
    ],
    baseSpeed: 240,        // px/s at start
    speedPerGate: 7,       // speed added per passed gate
    maxSpeed: 950,
    gatesPerScreen: 3,     // gates kept ahead of the ball
    perfectWindow: 0.30,   // s — last-tap window for a PERFECT pass
    starScores: [500, 1500, 4000], // 1★ 2★ 3★ thresholds
    maxHearts: 5,
    interstitialsEvery: 2  // show an interstitial every N game overs
  }
};
