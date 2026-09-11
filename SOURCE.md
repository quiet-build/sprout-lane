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
