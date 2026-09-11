import assert from "node:assert/strict";
import { test } from "node:test";
import {
  PLANTS, cellAt, laneHasTarget, occupied, targetRows, walkerKeyForWave,
  waveSpawnGap, waveWalkerCount,
} from "../src/rules.js";

test("wave size and spawn gap match the referenced arcade loop", () => {
  assert.equal(waveWalkerCount(1), 3);
  assert.equal(waveWalkerCount(5), 5);
  assert.equal(waveWalkerCount(30), 15);
  assert.equal(waveSpawnGap(1), 2900);
  assert.equal(waveSpawnGap(25), 1000);
});

test("later waves can roll heavier walkers", () => {
  assert.equal(walkerKeyForWave(1, 0.99), "slug");
  assert.equal(walkerKeyForWave(2, 0.4), "snail");
  assert.equal(walkerKeyForWave(4, 0.6), "beetle");
  assert.equal(walkerKeyForWave(6, 0.7), "mite");
  assert.equal(walkerKeyForWave(8, 0.9), "grub");
});

test("every sprout card explains how to use it", () => {
  for (const plant of Object.values(PLANTS)) {
    assert.equal(typeof plant.how, "string");
    assert.ok(plant.how.length > 20);
  }
});

test("plants occupy a cell and only shoot at bugs ahead", () => {
  const plants = [{ alive: true, row: 2, col: 3 }];
  assert.equal(occupied(plants, 2, 3), true);
  assert.equal(occupied(plants, 2, 4), false);
  assert.deepEqual(targetRows({ row: 0 }, { triple: true }), [0, 1]);
  const walkers = [{ alive: true, row: 1, x: 400 }];
  assert.equal(laneHasTarget(walkers, [1], 2, 80), true);
  assert.equal(laneHasTarget(walkers, [1], 6, 80), false);
  assert.deepEqual(cellAt(40, 120), { row: 1, col: 0 });
  assert.equal(cellAt(-4, 10), null);
});
