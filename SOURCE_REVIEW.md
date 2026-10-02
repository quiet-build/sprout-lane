# Source review — Sprout Lane

Player problem: Mini Arcade needed a few-minute lane-plant game, not another path tower defense. Acceptance: collect sun, plant on a 5×9 lawn, same-row shots, waves, pause freeze, restart that cannot leave spawn timers running.

Source: [plantsvszombiesjs](https://github.com/plantsvszombiesjs/plantsvszombiesjs.github.io) at `edd9496907be1e73ce62eecf2316fdeed0b88368` (MIT).

| Upstream | Local |
|---|---|
| 5×9 board, sun 200, plant costs/HP/intervals, walker HP/speed | `src/rules.js` |
| `placePlant`, `shoot`, `moveProjectiles`, `moveZombies`, `produceSun`, falling sun | `src/mount.js` LawnScene |
| `resetGame` missed in-wave `setInterval` | Phaser `time.removeAllEvents()` plus an XState `round` bump on `RESTART` |
| emoji actors, 20 waves × 30s, leaderboard | original canvas art; 8 waves × 22s; no leaderboard |

Code reused: numeric rules only. No HTML, CSS, emoji, or names copied.

Session flow (`playing` / `paused` / `won` / `lost`) is an XState v5 machine in `src/session.js`. Frame movement stays in Phaser. RxJS and Effect.ts were not added.

Verification: Node rule/session/redirect tests passed. Playwright smoke planted a Podling, paused, and restarted sun to 200. Component tests covered embed landmarks, host `pause()`, restart and remount. A local play pass planted Sunbloom/Podling/Gourd, spawned slugs, and collected no phone/Safari/audio check.

## Release-status reconciliation — 2026-10-02

The earlier implementation-stage TODO was “host catalog entry, CI Pages project,
and a physical-device pass.” The first two are closed by current evidence:

- Local `main` matches the 2026-10-02 remote `main` snapshot at
  `f7f0253359294d675910f1db499315a8993a2dd2` in `quiet-build/sprout-lane`.
- The current catalog snapshot includes `/game/sprout-lane`,
  `https://sprout-lane.pages.dev/component.js` and `pma-sprout-lane`.
  Its live checks returned 200 for the portal route and component, with
  JavaScript/CORS headers on the component (host build `e5792f7`).
- `.github/workflows/deploy.yml` already provisions/checks Pages project
  `sprout-lane`, then calls the pinned arcade-component workflow after that job.
  It configures rule/session/redirect gates before build and component/WebKit
  plus standalone browser checks after build. Releases remain CI-only.
- This local audit passed six rule/session tests and two redirect tests. The
  live snapshots verify delivery; the local checks do not establish browser acceptance.

Remaining: physical-device/Safari gameplay and audible-output acceptance, plus
normal-entry wave completion, pause/restart and remount checks. HTTP/component
availability does not establish those player interactions. The verification
paragraph above records the earlier local implementation pass.
