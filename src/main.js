/* ============================================================
   CANDY RUSH — boot
   ------------------------------------------------------------
   1. Initialize Playgama Bridge (required)
   2. Load saved progress through Bridge storage (required)
   3. Apply platform audio state + pause events (required)
   4. Register the screens and start
   ============================================================ */

(async function boot() {
  await Bridge.init();

  const game = new Game(GAME_CONFIG);

  // Load saved progress (coins, best score, shop, settings, levels, cosmetics)
  await game.storage.load(['coins', 'best', 'owned', 'settings', 'progress', 'equipped', 'daily']);

  // Platform audio state (check initial value + subscribe)
  game.audio.setPlatformEnabled(Bridge.platform.isAudioEnabled);
  Bridge.platform.onAudioState((enabled) => {
    game.audio.setPlatformEnabled(enabled);
  });

  // Platform pause (tab switch, ads, system pause)
  Bridge.platform.onPause((paused) => {
    if (paused && game.screens.current && game.screens.current.name === 'gameplay') {
      game.screens.current.forcePause();
    }
  });

  game
    .register(new LoadingScreen(game))
    .register(new MenuScreen(game))
    .register(new LevelSelectScreen(game))
    .register(new GameplayScreen(game))
    .register(new VictoryScreen(game))
    .register(new GameOverScreen(game))
    .register(new ShopScreen(game));

  game.start();
})();
