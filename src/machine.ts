import { type AnyEventObject, setup } from "xstate";

const nameOfMachine = setup({
  types: {
    events: {} as AnyEventObject,
    context: {} as object,
  },
  actors: {},
  delays: {},
}).createMachine({
  id: "nameOf",
  initial: "initialState",
  states: {
    initialState: {},
  },
});
