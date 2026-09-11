import { assign, createActor, createMachine } from "xstate";

const resetRound = assign({
  outcome: () => null,
  speed: () => 1,
  round: ({ context }) => context.round + 1,
});

export const sessionMachine = createMachine({
  id: "sproutSession",
  initial: "playing",
  context: { speed: 1, outcome: null, round: 0 },
  states: {
    playing: {
      tags: ["live"],
      on: {
        PAUSE: "paused",
        WIN: { target: "won", actions: assign({ outcome: () => "win" }) },
        LOSE: { target: "lost", actions: assign({ outcome: () => "lose" }) },
        RESTART: { target: "playing", actions: resetRound },
        SPEED: { actions: assign({ speed: ({ event }) => event.value }) },
      },
    },
    paused: {
      tags: ["frozen"],
      on: {
        RESUME: "playing",
        RESTART: { target: "playing", actions: resetRound },
      },
    },
    won: {
      tags: ["over"],
      on: { RESTART: { target: "playing", actions: resetRound } },
    },
    lost: {
      tags: ["over"],
      on: { RESTART: { target: "playing", actions: resetRound } },
    },
  },
});

export function createSessionActor() {
  return createActor(sessionMachine).start();
}
