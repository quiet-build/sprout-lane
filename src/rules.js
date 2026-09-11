/** Lane-defense numbers adapted from plantsvszombiesjs (MIT), original names. */

export const ROWS = 5;
export const COLS = 9;
export const TILE = 80;
export const WIDTH = COLS * TILE;
export const HEIGHT = ROWS * TILE;
export const START_SUN = 200;
export const MAX_WAVES = 8;
export const WAVE_MS = 22000;
export const FIRST_WAVE_MS = 4000;
export const SKY_SUN = 50;
export const SKY_SUN_EVERY = 8000;
export const SKY_SUN_LIFE = 10000;
export const SHOT_SPEED = 200;
export const ATTACK_MS = 1000;
export const SLOW_MS = 3000;
export const SLOW_FACTOR = 0.5;

export const PLANTS = {
  sunbloom: {
    name: "Sunbloom", role: "Makes sun", cost: 50, health: 3.6,
    produces: 40, produceMs: 15000, shoots: false, damage: 0, shootMs: 0,
    how: "Drops extra sun on its plot. Tap the coins to spend them.",
  },
  podling: {
    name: "Podling", role: "Shoots", cost: 100, health: 3.6,
    shoots: true, damage: 1, shootMs: 1500,
    how: "Shoots only the bugs walking its own row.",
  },
  twinpod: {
    name: "Twinpod", role: "Two shots", cost: 200, health: 3.6,
    shoots: true, damage: 1, shootMs: 1500, double: true,
    how: "Fires two shots in its row, one after the other.",
  },
  frostpod: {
    name: "Frostpod", role: "Slows", cost: 175, health: 3.6,
    shoots: true, damage: 1, shootMs: 2000, slow: true,
    how: "Hits its row and slows those bugs for a moment.",
  },
  gourd: {
    name: "Gourd", role: "Blocks", cost: 50, health: 24,
    shoots: false, damage: 0, shootMs: 0,
    how: "Stands in the way. It does not shoot.",
  },
  snapleaf: {
    name: "Snapleaf", role: "Heavy shot", cost: 150, health: 4.88,
    shoots: true, damage: 2, shootMs: 2500,
    how: "Slow, heavy shots in its own row.",
  },
  trilane: {
    name: "Trilane", role: "Three rows", cost: 325, health: 3.6,
    shoots: true, damage: 1, shootMs: 1500, triple: true,
    how: "Shoots its row plus the row above and below.",
  },
  emberpod: {
    name: "Emberpod", role: "Hot shot", cost: 250, health: 3.6,
    shoots: true, damage: 2, shootMs: 1500, fire: true,
    how: "Hotter shots in its row. Good against tough bugs.",
  },
  needle: {
    name: "Needle", role: "Pierces", cost: 125, health: 4.8,
    shoots: true, damage: 1, shootMs: 1800, pierce: true,
    how: "Shots pass through more than one bug in the row.",
  },
};

export const WALKERS = {
  slug: { name: "Slug", health: 10, speed: 10, damage: 1, points: 100 },
  snail: { name: "Snail", health: 20, speed: 10, damage: 1, points: 200 },
  beetle: { name: "Beetle", health: 40, speed: 8, damage: 1, points: 400 },
  mite: { name: "Mite", health: 6, speed: 20, damage: 1, points: 150 },
  grub: { name: "Grub", health: 60, speed: 6, damage: 2, points: 600 },
};

const WALKER_KEYS = Object.keys(WALKERS);

export function walkerKeyForWave(wave, rand) {
  if (wave > 7 && rand > 0.8) return WALKER_KEYS[4];
  if (wave > 5 && rand > 0.6) return WALKER_KEYS[3];
  if (wave > 3 && rand > 0.5) return WALKER_KEYS[2];
  if (wave > 1 && rand > 0.3) return WALKER_KEYS[1];
  return WALKER_KEYS[0];
}

export function waveWalkerCount(wave) {
  return Math.min(3 + Math.floor(wave / 2), 15);
}

export function waveSpawnGap(wave) {
  return Math.max(3000 - wave * 100, 1000);
}

export function occupied(plants, row, col) {
  return plants.some(plant => plant.alive && plant.row === row && plant.col === col);
}

export function targetRows(plant, kind) {
  if (!kind.triple) return [plant.row];
  return [plant.row - 1, plant.row, plant.row + 1].filter(row => row >= 0 && row < ROWS);
}

export function laneHasTarget(walkers, rows, plantCol, tile = TILE) {
  const edge = plantCol * tile;
  return walkers.some(walker => walker.alive && rows.includes(walker.row) && walker.x > edge);
}

export function cellAt(x, y, tile = TILE) {
  const col = Math.floor(x / tile);
  const row = Math.floor(y / tile);
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return null;
  return { row, col };
}
