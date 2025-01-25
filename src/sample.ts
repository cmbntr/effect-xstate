import { Schema } from "effect";
import { setup, type SnapshotFrom } from "xstate";
import { ContextStruct, EventStruct } from "./mod";

export namespace InitializeEvent {
  export const Struct = EventStruct("initialize", {});
  export const INSTANCE = Struct.make({});
}
export namespace FooEvent {
  export const Struct = EventStruct("foo", { value: Schema.Int });
  export const make = Struct.make;
}
export type FooEvent = typeof FooEvent.Struct.Type;

FooEvent.make({ value: 33 });

export namespace ShutdownEvent {
  export const Struct = EventStruct("shutdown", {});
  export const INSTANCE = Struct.make({});
}

export const Event = Schema.Union(InitializeEvent.Struct, FooEvent.Struct, ShutdownEvent.Struct);
export type Event = typeof Event.Type;

namespace Context {
  export const Struct = ContextStruct({});
  export type Context = typeof Struct.Type;
  export const make = Struct.make;
  export const INITIAL: Context = make({});
}

export type Snapshot = SnapshotFrom<typeof svcMachine>;

const svcMachine = setup({
  types: {
    events: {} as Event,
    context: {} as Context.Context,
  },
}).createMachine({
  id: "svc",
  initial: "initial",
  context: Context.INITIAL,
  states: {
    initial: {
      on: {
        initialize: "ready",
      },
    },
    ready: {
      type: "final",
    },
  },
});
