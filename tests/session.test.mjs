import assert from "node:assert/strict";
import { test } from "node:test";
import { createSessionActor } from "../src/session.js";

test("pause freezes play and resume returns to live", () => {
  const actor = createSessionActor();
  assert.equal(actor.getSnapshot().hasTag("live"), true);
  actor.send({ type: "PAUSE" });
  assert.equal(actor.getSnapshot().hasTag("frozen"), true);
  assert.equal(actor.getSnapshot().can({ type: "WIN" }), false);
  actor.send({ type: "RESUME" });
  assert.equal(actor.getSnapshot().hasTag("live"), true);
  actor.stop();
});

test("restart from mid-wave or after a loss starts a new round", () => {
  const actor = createSessionActor();
  actor.send({ type: "PAUSE" });
  actor.send({ type: "RESTART" });
  assert.equal(actor.getSnapshot().hasTag("live"), true);
  assert.equal(actor.getSnapshot().context.round, 1);
  actor.send({ type: "LOSE" });
  assert.equal(actor.getSnapshot().context.outcome, "lose");
  actor.send({ type: "RESTART" });
  assert.equal(actor.getSnapshot().hasTag("live"), true);
  assert.equal(actor.getSnapshot().context.round, 2);
  assert.equal(actor.getSnapshot().context.outcome, null);
  actor.send({ type: "WIN" });
  assert.equal(actor.getSnapshot().hasTag("over"), true);
  actor.stop();
});
