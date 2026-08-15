# 🍭 Candy Rush

**Candy Rush** is a hyper-casual candy game — a *Color Rush* mechanic wrapped in a cute candy world, now with **150 levels across 10 themed worlds**.

Pick the exact color with **4 round color buttons** (**pink → mint → sky → lemon**), move the ball **left / right** to collect sweets, pass the candy gates that match your color, chain combos and trigger the **FEVER mode**. Complete objectives, earn **1-3 stars**, unlock new worlds, and collect coins to buy upgrades and cosmetic video-unlocks.

Built in **100% vanilla JavaScript** (no framework, no build step) on a custom engine — instant loading, works on every screen size (portrait & landscape).

---

## 🕹️ How to play

- **◀ / ▶** (bottom bar, or `←`/`→` keys): move the ball left / right to **collect sweets** (donuts, ice-creams, cookies…)
- **4 round color buttons** (or `1`–`4` keys): one tap = the exact color, no more cycling
- Pass gates of the **same color** : mismatch costs a heart
- Switch color **at the last moment** for a PERFECT bonus
- Chain combos → **FEVER mode** at ×5 (double points, glow, music speeds up)
- Complete each level's objective (**SCORE / CANDIES / SURVIVE**) to win stars and unlock the next one
- **150 levels · 10 worlds** (Sugar Meadow → Ice Cream Factory → Chocolate Forest → Bubblegum Sky → Lollipop Land → Candy Castle → Gummy Ocean → Marshmallow Mountains → Caramel Desert → Golden Gala), each with its own pastel theme and **CC0 background music**
- **World map** : the 10 worlds sit on a winding journey path (pastel nodes, stars, lock state). Tap a world to open its 15 levels — the **15th level is the golden BOSS node** (👑)
- On game over: **REVIVE** (watch an ad — or a free instant revive on the web demo — to come back exactly where you died) or **RETRY**
- On victory: **NEXT** level or **BONUS** (watch an ad to double your earned coins)
- Claim the **daily reward** from the menu every day

## 🛍️ Shop

**Coin items** (graphic icons): **Heart +1**, **Double Points**, **Candy Magnet**, **Sugar Shield**.

**Video unlocks** (watch an ad to unlock & auto-equip):
- **Ball skins**: Rainbow, Gold
- **Trails**: Sparkle, Confetti, Star
- **Faces**: 😆 Happy, 😎 Cool, 🥰 Love
- **Gate styles**: Striped, Dots, Sparkle

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
| Interstitials (required) | On game over and **every 3 levels completed** (`game_over`, `level_complete`) |
| Rewarded (only these two) | **REVIVE** (`revive`) + **BONUS** (`bonus`) — reward granted only on `rewarded` state |
| Leaderboards | Best score submitted via `bridge.leaderboards.setScore` |

### Submission checklist

1. `playgama-bridge-config.json` sits next to `index.html` (already done).
2. Zip the **project folder** (index.html + assets/ + src/ + game-config.js + playgama-bridge-config.json).
3. Upload on [playgama.com](https://playgama.com) → **Submit a game**.
4. Configure placements / leaderboard IDs if you add platform-specific overrides.

## 🎵 Music (CC0, downloaded from the web)

Each world plays its own **CC0 loop** (from OpenGameArt, no attribution required):

| World | Track |
|---|---|
| Menu | Happy Adventure Loop (xDeviruchi) |
| 1 Sugar Meadow | 8-bit Music Pack — Track 1 |
| 2 Ice Cream Factory | 8-bit Music Pack — Track 2 |
| 3 Chocolate Forest | 8-bit Music Pack — Track 3 |
| 4 Bubblegum Sky | 8-bit Music Pack — Track 4 |
| 5 Lollipop Land | 8-bit Music Pack — Track 5 |
| 6 Candy Castle | 8-bit Music Pack — Track 6 |
| 7 Gummy Ocean | Level Battle Theme |
| 8 Marshmallow Mountains | Happy Level Loop (EJM) |
| 9 Caramel Desert | Magical Game Loop (nene) |
| 10 Golden Gala | Starlight City (AdhesiveWombat) |

All converted to lightweight `.ogg` for the web. Full license notes in `assets/LICENSES.md`.

## 🎨 Assets (100% free, all from the web)

| Pack | Source | License |
|---|---|---|
| UI pack (buttons, coins, hearts, stars, panel) | [Kenney UI Pack](https://kenney.nl/assets/ui-pack) | CC0 |
| Candy collectibles (donut, lollipop, cupcake, ice-cream, cookie, candy-bar) | [Kenney Food Kit](https://kenney.nl/assets/food-kit) | CC0 |
| Background elements (sun, clouds) | [Kenney Background Elements](https://kenney.nl/assets/background-elements) | CC0 |
| Particle FX (stars, sparks) | [Kenney Particle Pack](https://kenney.nl/assets/particle-pack) | CC0 |
| Display font | [Kenney Fonts — Mini Square](https://kenney.nl/assets/kenney-fonts) | CC0 |
| Sounds | Synthesized with WebAudio (zero download) | — |
| Music | OpenGameArt CC0 loops (see table above) | CC0 |

All assets are **Creative Commons Zero (CC0)** — free for commercial use, no attribution required
(credit "Kenney" or www.kenney.nl is appreciated, not required).

## 📁 Structure

```
index.html                    → shell + Bridge SDK script
game-config.js                → ALL tuning (10 worlds, 150 levels, palette, shop…)
playgama-bridge-config.json   → Bridge config (ads placements, leaderboards)
src/main.js                   → boot: Bridge init → load saves → start
src/core/                     → bridge wrapper, storage, audio (+music), input, lang, engine
src/screens/                  → loading, menu, level-select, gameplay, victory, gameover, shop
src/ui/                       → UI kit + candy background builder
assets/                       → css, fonts, bg, candies, fx, ui, music (all CC0)
```
