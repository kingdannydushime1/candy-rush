# 🍭 Candy Rush

**Candy Rush** is a hyper-casual color game — a *Color Rush* mechanic wrapped in a cute candy world.

Move the ball **left / right** to collect sweets and pick the exact color with **4 round color buttons** (**pink → mint → sky → lemon**), pass through the candy gates that match your color, chain combos, trigger **PERFECT** near-misses. 3 hearts, endless difficulty ramp, best score chasing, and a sweet shop to spend your candies on.

Built in **100% vanilla JavaScript** (no framework, no build step) on a custom engine — instant loading, works on every screen size (portrait & landscape).

---

## 🕹️ How to play

- **◀ / ▶** (bottom bar, or `←`/`→` keys): move the ball left / right to **collect sweets** (donuts, ice-creams, cookies…)
- **4 round color buttons** (or `1`–`4` keys): one tap = the exact color, no more cycling
- Pass gates of the **same color** : mismatch costs a heart
- Switch color **at the last moment** for a PERFECT bonus
- Chain combos for a ×10 multiplier and chase the best score
- On game over: **REVIVE** (watch an ad to come back exactly where you died) or **RETRY**
- Shop upgrades (with graphic icons): **Heart +1**, **Double Points**, **Candy Magnet**, **Sugar Shield**

## 🚀 Run locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

Or open `index.html` directly (the Playgama Bridge falls back to a safe mock outside platforms).

## 🎮 Playgama / Bridge SDK

Fully integrated with the **Playgama Bridge SDK v2** (`https://bridge.playgama.com/v2/stable/playgama-bridge.js`):

| Requirement | Implementation |
|---|---|
| Initialization | `bridge.initialize()` awaited in `src/main.js` |
| Storage (required) | All saves go through `bridge.storage` (`src/core/storage.js`) — never localStorage |
| Localization (required) | `bridge.platform.language` drives 5 languages (EN/FR/ES/PT/DE) via `src/core/lang.js` |
| `game_ready` (required) | Sent when the loading screen finishes |
| Pause / audio events (required) | `PAUSE_STATE_CHANGED` + `AUDIO_STATE_CHANGED` handled in `src/main.js` |
| Interstitials (required) | On game over, every 2 runs (`game_over` placement) |
| Rewarded | **REVIVE** button (`revive` placement) — reward granted only on `rewarded` state |
| Leaderboards | Best score submitted via `bridge.leaderboards.setScore` |

### Submission checklist

1. `playgama-bridge-config.json` sits next to `index.html` (already done).
2. Zip the **project folder** (index.html + assets/ + src/ + game-config.js + playgama-bridge-config.json).
3. Upload on [playgama.com](https://playgama.com) → **Submit a game**.
4. Configure placements / leaderboard IDs if you add platform-specific overrides.

## 🎨 Assets (100% free, all from the web)

| Pack | Source | License |
|---|---|---|
| UI pack (buttons, coins, hearts, stars, panel) | [Kenney UI Pack](https://kenney.nl/assets/ui-pack) | CC0 |
| Candy collectibles (donut, lollipop, cupcake, ice-cream, cookie, candy-bar) | [Kenney Food Kit](https://kenney.nl/assets/food-kit) | CC0 |
| Background elements (sun, clouds) | [Kenney Background Elements](https://kenney.nl/assets/background-elements) | CC0 |
| Particle FX (stars, sparks) | [Kenney Particle Pack](https://kenney.nl/assets/particle-pack) | CC0 |
| Display font | [Kenney Fonts — Mini Square](https://kenney.nl/assets/kenney-fonts) | CC0 |
| Sounds | Synthesized with WebAudio (zero download) | — |

All assets are **Creative Commons Zero (CC0)** — free for commercial use, no attribution required
(credit "Kenney" or www.kenney.nl is appreciated, not required).

## 📁 Structure

```
index.html                    → shell + Bridge SDK script
game-config.js                → ALL tuning (palette, speed, shop, stars…)
playgama-bridge-config.json   → Bridge config (ads placements, leaderboards)
src/main.js                   → boot: Bridge init → load saves → start
src/core/                     → bridge wrapper, storage, audio, input, lang, engine
src/screens/                  → loading, menu, gameplay, gameover, shop
src/ui/                       → UI kit + candy background builder
assets/                       → css, fonts, bg, candies, fx, ui (Kenney CC0)
```
