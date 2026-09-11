import Phaser from "phaser";
import markup from "./ui.html?raw";
import { ownRuntime, SessionGame } from "./runtime";
import { paintLawn, drawPlant, drawWalker, drawShot, drawSun, drawEffects } from "./art";
import { createSessionActor } from "./session";
import {
  ATTACK_MS, COLS, FIRST_WAVE_MS, HEIGHT, MAX_WAVES, PLANTS, ROWS,
  SHOT_SPEED, SKY_SUN, SKY_SUN_EVERY, SKY_SUN_LIFE, SLOW_FACTOR, SLOW_MS,
  START_SUN, TILE, WALKERS, WAVE_MS, WIDTH, cellAt, laneHasTarget,
  occupied, targetRows, walkerKeyForWave, waveSpawnGap, waveWalkerCount,
} from "./rules";

export function mount(container, ready = () => {}, result = () => {}) {
  container.innerHTML = markup;
  const listeners = new AbortController();
  const listen = (element, name, handler) => element.addEventListener(name, handler, { signal: listeners.signal });
  container.addEventListener("pointerdown", event => {
    const button = event.target instanceof Element ? event.target.closest("button:not(:disabled)") : null;
    if (button && event.button === 0) {
      event.preventDefault();
      button.focus({ preventScroll: true });
    }
  }, { capture: true, signal: listeners.signal });

  let disposed = false;
  let sceneRef = null;
  let resultSent = false;
  const reduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const session = createSessionActor();

  const ui = {
    app: container.querySelector(".app"),
    sun: container.querySelector("#sunText"),
    score: container.querySelector("#scoreText"),
    wave: container.querySelector("#waveText"),
    message: container.querySelector("#message"),
    cards: container.querySelector("#cards"),
    pause: container.querySelector("#pauseButton"),
    resume: container.querySelector("#resumeButton"),
    restart: container.querySelector("#restartButton"),
    again: container.querySelector("#againButton"),
    speed: container.querySelector("#speedButton"),
    pauseSheet: container.querySelector("#pauseSheet"),
    endSheet: container.querySelector("#endSheet"),
    endTitle: container.querySelector("#endTitle"),
    endBody: container.querySelector("#endBody"),
    endKicker: container.querySelector("#endKicker"),
  };

  ui.cards.innerHTML = Object.entries(PLANTS).map(([id, plant]) => (
    `<button type="button" class="tool-card" data-plant="${id}" title="${plant.how}">
      <span class="glyph ${id}" aria-hidden="true"></span>
      <span>${plant.name}</span>
      <small>${plant.cost} · ${plant.role}</small>
    </button>`
  )).join("");
  const cards = [...ui.cards.querySelectorAll(".tool-card")];

  class LawnScene extends Phaser.Scene {
    constructor() { super("LawnScene"); }

    create() {
      sceneRef = this;
      this.graphics = this.add.graphics();
      this.flow = session.getSnapshot();
      this.selected = "podling";
      this.resetLawn();
      this.input.on("pointerdown", pointer => this.onTap(pointer.worldX, pointer.worldY));
      ready();
    }

    resetLawn() {
      this.time.removeAllEvents();
      this.round = session.getSnapshot().context.round;
      this.plants = [];
      this.walkers = [];
      this.shots = [];
      this.suns = [];
      this.effects = [];
      this.sun = START_SUN;
      this.score = 0;
      this.wave = 1;
      this.spawning = false;
      this.scheduleSky();
      this.time.delayedCall(FIRST_WAVE_MS, () => this.beginWave(this.round, 1));
      syncUi();
    }

    scheduleSky() {
      this.time.addEvent({
        delay: SKY_SUN_EVERY,
        loop: true,
        callback: () => {
          if (!session.getSnapshot().hasTag("live")) return;
          this.suns.push({
            x: 40 + Math.random() * (WIDTH - 80),
            y: 24,
            vy: reduced ? 0 : 28,
            value: SKY_SUN,
            life: SKY_SUN_LIFE,
          });
        },
      });
    }

    beginWave(round, wave) {
      if (this.round !== round || !session.getSnapshot().hasTag("live")) return;
      this.wave = wave;
      this.spawning = true;
      const count = waveWalkerCount(wave);
      const gap = waveSpawnGap(wave);
      let left = count;
      this.time.addEvent({
        delay: gap,
        repeat: count - 1,
        callback: () => {
          if (this.round !== round || !session.getSnapshot().hasTag("live")) return;
          this.spawnWalker();
          left -= 1;
          if (left <= 0) this.spawning = false;
        },
      });
      this.time.delayedCall(WAVE_MS, () => this.advanceWave(round, wave));
      syncUi();
    }

    advanceWave(round, wave) {
      if (this.round !== round || !session.getSnapshot().hasTag("live")) return;
      if (wave >= MAX_WAVES) {
        session.send({ type: "WIN" });
        return;
      }
      this.beginWave(round, wave + 1);
    }

    spawnWalker() {
      const kind = walkerKeyForWave(this.wave, Math.random());
      const spec = WALKERS[kind];
      this.walkers.push({
        kind, alive: true, row: Math.floor(Math.random() * ROWS),
        x: WIDTH, tile: TILE, health: spec.health, maxHealth: spec.maxHealth ?? spec.health,
        lastAttack: 0, slowedUntil: 0, attacking: false,
      });
    }

    onTap(x, y) {
      if (!session.getSnapshot().hasTag("live")) return;
      const hit = this.suns.find(sun => Math.hypot(sun.x - x, sun.y - y) < 22);
      if (hit) {
        this.sun += hit.value;
        this.score += 10;
        hit.life = 0;
        this.burst(hit.x, hit.y, "puff", 0xffd24a, 320);
        syncUi();
        return;
      }
      const cell = cellAt(x, y);
      if (!cell) return;
      const spec = PLANTS[this.selected];
      if (!spec || this.sun < spec.cost || occupied(this.plants, cell.row, cell.col)) return;
      this.sun -= spec.cost;
      this.plants.push({
        kind: this.selected, alive: true, row: cell.row, col: cell.col, tile: TILE,
        health: spec.health, maxHealth: spec.health, lastShot: 0, lastProduce: this.time.now,
      });
      syncUi();
    }

    update(_time, delta) {
      this.flow = session.getSnapshot();
      if (this.round !== this.flow.context.round) this.resetLawn();
      if (!this.flow.hasTag("live")) {
        this.draw();
        return;
      }
      const speed = this.flow.context.speed;
      const dt = delta * speed;
      this.stepSuns(dt);
      this.stepPlants();
      this.stepShots(dt);
      this.stepWalkers(dt);
      this.draw();
      syncUi();
    }

    stepSuns(dt) {
      for (const sun of this.suns) {
        sun.y = Math.min(HEIGHT - 28, sun.y + (sun.vy || 0) * dt / 1000);
        sun.life -= dt;
      }
      this.suns = this.suns.filter(sun => sun.life > 0);
    }

    stepPlants() {
      const now = this.time.now;
      for (const plant of this.plants) {
        if (!plant.alive) continue;
        const spec = PLANTS[plant.kind];
        if (spec.produces && now - plant.lastProduce >= spec.produceMs / this.flow.context.speed) {
          plant.lastProduce = now;
          this.suns.push({
            x: plant.col * TILE + TILE / 2,
            y: plant.row * TILE + 18,
            vy: 0,
            value: spec.produces,
            life: SKY_SUN_LIFE,
          });
        }
        if (!spec.shoots) continue;
        const rows = targetRows(plant, spec);
        if (!laneHasTarget(this.walkers, rows, plant.col)) continue;
        if (now - plant.lastShot < spec.shootMs / this.flow.context.speed) continue;
        plant.lastShot = now;
        this.fire(plant, spec, rows);
        if (spec.double) this.time.delayedCall(180, () => {
          if (this.round !== this.flow.context.round || !plant.alive) return;
          if (laneHasTarget(this.walkers, rows, plant.col)) this.fire(plant, spec, rows);
        });
      }
      this.plants = this.plants.filter(plant => plant.alive);
    }

    fire(plant, spec, rows) {
      for (const row of rows) {
        this.shots.push({
          x: plant.col * TILE + TILE - 8,
          y: row * TILE + TILE / 2,
          row, damage: spec.damage, slow: !!spec.slow, fire: !!spec.fire,
          pierce: !!spec.pierce, hits: [],
        });
      }
    }

    stepShots(dt) {
      for (const shot of this.shots) {
        shot.x += SHOT_SPEED * this.flow.context.speed * dt / 1000;
        for (const walker of this.walkers) {
          if (!walker.alive || walker.row !== shot.row || shot.hits.includes(walker)) continue;
          if (Math.abs(walker.x - shot.x) > 16) continue;
          walker.health -= shot.damage;
          walker.flashUntil = this.time.now + 160;
          walker.x += 6;
          shot.hits.push(walker);
      this.spark(walker, shot);
      if (shot.slow) walker.slowedUntil = this.time.now + SLOW_MS;
          if (walker.health <= 0) {
            walker.alive = false;
            this.score += WALKERS[walker.kind].points;
            this.burst(walker.x, walker.row * TILE + TILE / 2, "puff", 0xfff6d8, 420);
          }
          if (!shot.pierce) { shot.x = WIDTH + 40; break; }
        }
      }
      this.shots = this.shots.filter(shot => shot.x < WIDTH + 20);
    }

    spark(walker, shot) {
      const y = walker.row * TILE + TILE / 2;
      const color = shot.fire ? 0xff6a2a : shot.slow ? 0x8fd3ff : 0xfff6d8;
      for (let i = 0; i < 5; i += 1) {
        this.effects.push({
          kind: "spark",
          x: walker.x, y,
          vx: 8 + Math.random() * 18, vy: -12 + Math.random() * 24,
          color, until: this.time.now + 280, span: 280,
        });
      }
    }

    burst(x, y, kind, color, span) {
      this.effects.push({ kind, x, y, vx: 0, vy: 0, color, until: this.time.now + span, span });
    }

    stepWalkers(dt) {
      const now = this.time.now;
      for (const walker of this.walkers) {
        if (!walker.alive) continue;
        walker.slowed = now < walker.slowedUntil;
        const spec = WALKERS[walker.kind];
        const pace = spec.speed * (walker.slowed ? SLOW_FACTOR : 1) * this.flow.context.speed;
        const col = Math.floor(walker.x / TILE);
        const blocker = this.plants.find(plant => plant.alive && plant.row === walker.row && plant.col === col);
        walker.attacking = !!blocker;
        if (blocker) {
          if (now - walker.lastAttack >= ATTACK_MS / this.flow.context.speed) {
            walker.lastAttack = now;
            blocker.health -= spec.damage;
            if (blocker.health <= 0) blocker.alive = false;
          }
        } else {
          walker.x -= pace * dt / 1000;
        }
        if (walker.x <= -TILE) session.send({ type: "LOSE" });
      }
      this.walkers = this.walkers.filter(walker => walker.alive);
      this.effects = this.effects.filter(burst => burst.until > now);
    }

    draw() {
      this.graphics.clear();
      paintLawn(this.graphics, { cols: COLS, rows: ROWS, tile: TILE, reduced });
      for (const plant of this.plants) drawPlant(this.graphics, plant, this.time.now, reduced);
      for (const walker of this.walkers) drawWalker(this.graphics, walker, this.time.now, reduced);
      for (const shot of this.shots) drawShot(this.graphics, shot);
      for (const sun of this.suns) drawSun(this.graphics, sun, this.time.now, reduced);
      drawEffects(this.graphics, this.effects, this.time.now);
    }
  }

  function snapshot() { return session.getSnapshot(); }

  function syncUi() {
    if (disposed || !sceneRef) return;
    const snap = snapshot();
    ui.sun.textContent = String(Math.floor(sceneRef.sun));
    ui.score.textContent = String(sceneRef.score);
    ui.wave.textContent = `${sceneRef.wave} / ${MAX_WAVES}`;
    ui.app.dataset.plants = String(sceneRef.plants.length);
    ui.app.dataset.walkers = String(sceneRef.walkers.length);
    ui.app.dataset.paused = snap.hasTag("frozen") ? "1" : "0";
    ui.app.dataset.phase = snap.hasTag("over") ? "ended" : snap.hasTag("frozen") ? "paused" : "play";
    ui.pauseSheet.classList.toggle("hidden", !snap.hasTag("frozen"));
    ui.endSheet.classList.toggle("hidden", !snap.hasTag("over"));
    ui.pause.textContent = snap.hasTag("frozen") ? "Resume" : "Pause";
    ui.speed.textContent = `Speed x${snap.context.speed}`;
    const picked = PLANTS[sceneRef.selected];
    ui.message.textContent = snap.hasTag("live")
      ? `${picked.name}: ${picked.how} Catch falling sun.`
      : ui.message.textContent;
    cards.forEach(card => {
      const spec = PLANTS[card.dataset.plant];
      card.classList.toggle("active", card.dataset.plant === sceneRef.selected);
      card.disabled = !snap.hasTag("live") || sceneRef.sun < spec.cost;
    });
    if (snap.hasTag("over") && !resultSent) {
      resultSent = true;
      const win = snap.context.outcome === "win";
      ui.endKicker.textContent = win ? "Rows held" : "Bugs got through";
      ui.endTitle.textContent = win ? "The garden is safe." : "The left fence fell.";
      ui.endBody.textContent = `Score ${sceneRef.score}. Reached wave ${sceneRef.wave}.`;
      result({ mode: "lane", outcome: snap.context.outcome, score: sceneRef.score, wave: sceneRef.wave });
    }
  }

  function applyFlow() {
    const snap = snapshot();
    if (!sceneRef) return;
    if (snap.hasTag("frozen")) sceneRef.scene.pause();
    else if (sceneRef.sys.isPaused()) sceneRef.scene.resume();
    if (sceneRef.round !== snap.context.round) {
      resultSent = false;
      if (sceneRef.sys.isPaused()) sceneRef.scene.resume();
      sceneRef.resetLawn();
    }
    syncUi();
  }

  const unsub = session.subscribe(applyFlow);

  cards.forEach(card => listen(card, "click", () => {
    if (card.disabled) return;
    sceneRef.selected = card.dataset.plant;
    syncUi();
  }));
  listen(ui.pause, "click", () => session.send({ type: snapshot().hasTag("frozen") ? "RESUME" : "PAUSE" }));
  listen(ui.resume, "click", () => session.send({ type: "RESUME" }));
  listen(ui.restart, "click", () => session.send({ type: "RESTART" }));
  listen(ui.again, "click", () => session.send({ type: "RESTART" }));
  listen(ui.speed, "click", () => session.send({ type: "SPEED", value: snapshot().context.speed === 1 ? 2 : 1 }));

  let disposeRuntime = () => {};
  const canvasHost = container.querySelector("#game");
  canvasHost.tabIndex = 0;
  try {
    new SessionGame({
      autoFocus: false,
      audio: { noAudio: true },
      input: { windowEvents: false, keyboard: false, mouse: { target: canvasHost }, touch: { target: canvasHost } },
      callbacks: { preBoot(game) { disposeRuntime = ownRuntime(game); if (disposed) disposeRuntime(); } },
      type: Phaser.AUTO,
      width: WIDTH,
      height: HEIGHT,
      parent: canvasHost,
      backgroundColor: "#a6d47c",
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: [LawnScene],
    });
  } catch (error) {
    disposed = true;
    listeners.abort();
    unsub.unsubscribe();
    session.stop();
    try { disposeRuntime(true); } catch (cleanupError) { console.error(cleanupError); }
    throw error;
  }

  function pause() {
    if (disposed || !snapshot().hasTag("live")) return;
    session.send({ type: "PAUSE" });
  }
  listen(container, "focusout", event => { if (!container.contains(event.relatedTarget)) pause(); });
  listen(canvasHost, "pointerdown", () => canvasHost.focus({ preventScroll: true }));
  listen(window, "blur", pause);
  listen(document, "visibilitychange", () => { if (document.hidden) pause(); });

  return {
    pause,
    dispose() {
      if (disposed) return;
      disposed = true;
      listeners.abort();
      unsub.unsubscribe();
      session.stop();
      disposeRuntime();
    },
  };
}
