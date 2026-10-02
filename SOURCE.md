# Source Companion

Sprout Lane is a Vite + Phaser lane-defense browser game.

## Runtime Files

- `src/rules.js` holds the 5×9 lawn, plant/walker stats, wave size, and lane-target checks adapted from plantsvszombiesjs.
- `src/session.js` is the XState v5 match machine: playing, paused, won, lost. `RESTART` increments `round` so leftover timers can no-op. Speed is context, not a Phaser scene flag.
- `src/art.js` draws original sprouts, bugs, hit flashes, sparks and sun pops. No third-party sprites. Each plant card has a `how` line shown in the dock.
- `src/mount.js` owns one Phaser lawn, sun tokens, shots, waves and UI wiring. `mount(container, ready?, result?)` returns `pause()` and idempotent `dispose()`. Sky sun and wave callbacks are Phaser time events; `resetLawn()` removes all of them. Pause uses the session machine and `scene.pause()`.
- `src/component.js` registers `pma-sprout-lane`. Events: `pma-ready`, `pma-error`, `pma-round-ended` with `gameId: 'sprout-lane'`.
- `src/runtime.js` is the same Phaser 3.90 lifetime boundary used by Kids Defense Arcade.

## Tests And Tooling

- `tests/rules.test.mjs` and `tests/session.test.mjs` are Node tests for rules and the match machine.
- `tests/smoke.spec.js` plants, pauses and restarts in standalone Vite.
- `tests/component.spec.js` covers embed landmarks, host `pause()`, restart and remount.
- Playwright ports: standalone 5178, preview 5311, harness 5312.

## Component deployment

Deploy uses the pinned arcade component workflow. Publication remains CI-only.

## R2 deployment

The pinned `quiet-build/.github` arcade workflow publishes only this game to the shared `mini-arcade-assets` R2 bucket. Existing source, component, standalone and applicable PWA/bundle gates run before publication. The complete relative-base distribution is stored under a content-addressed version; CDN bytes, CORS, cache headers and real Chromium module/CSP readiness must pass before switching the game’s `https://assets.playminiarcade.com/channels/sprout-lane.js` entry. Failed verification leaves the previous entry unchanged. No Cloudflare Pages deployment or cumulative asset merge remains. Existing GitHub Pages publication, where configured, remains separate. Production writes are CI-only; update both full support SHA pins together.
