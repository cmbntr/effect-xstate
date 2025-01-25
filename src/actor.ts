import { Effect, Layer, ManagedRuntime, Option } from "effect";
import type { LazyArg } from "effect/Function";
import {
  type ActorRef,
  type EventObject,
  fromPromise,
  type NonReducibleUnknown,
  type Snapshot,
} from "xstate";

// -----------------------------------------------------------------------------

export function wrapActor<TEvent extends EventObject, TOutput = unknown>(
  evaluate: LazyArg<ActorRef<Snapshot<TOutput>, TEvent, any>>,
) {
  const actorRef = evaluate();
  const send = (evt: TEvent) => Effect.sync(() => actorRef.send(evt));
  return {
    send,
    run: Effect.async<Option.Option<TOutput>, unknown>((resume) => {
      actorRef.subscribe({
        complete() {
          const s = actorRef.getSnapshot();
          resume(Effect.succeed(Option.fromNullable(s.output)));
          actorRef.stop();
        },
        error(err) {
          resume(Effect.fail(err));
          actorRef.stop();
        },
      });
      actorRef.start();
      return Effect.sync(() => actorRef.stop());
    }),
  } as const;
}

// -----------------------------------------------------------------------------

const actorRuntime = ManagedRuntime.make(Layer.empty);

export function shutdownActorRuntime(): Promise<void> {
  return actorRuntime.dispose();
}

export type ActorContext = typeof actorRuntime extends ManagedRuntime.ManagedRuntime<infer R, never>
  ? R
  : never;

// -----------------------------------------------------------------------------

export function effectActorWithRuntime<A, E, R, I = NonReducibleUnknown>(
  runtime: ManagedRuntime.ManagedRuntime<R, never>,
  effect: Effect.Effect<A, E, R> | ((input: I) => Effect.Effect<A, E, R>),
) {
  return fromPromise<A, I>(({ signal, input }) =>
    runtime.runPromise(typeof effect === "function" ? effect(input) : effect, { signal })
  );
}

export function effectActor<A, E, I = NonReducibleUnknown>(
  effect: Effect.Effect<A, E, ActorContext> | ((input: I) => Effect.Effect<A, E, ActorContext>),
) {
  return effectActorWithRuntime(actorRuntime, effect);
}

export function effectActorWithInput<I, A, E>(
  effect: (input: I) => Effect.Effect<A, E, ActorContext>,
) {
  return effectActorWithRuntime(actorRuntime, effect);
}

// -----------------------------------------------------------------------------

// export function wrapActor3<TActorRef extends AnyActorRef>(evaluate: LazyArg<TActorRef>) {
//   const actorRef = evaluate();
//   const send = (evt: EventFrom<TActorRef>) => Effect.sync(() => actorRef.send(evt));
//   return [
//     send,
//     Effect.async<OutputFrom<TActorRef>, unknown>((resume, signal) => {
//       actorRef.subscribe({
//         complete() {
//           const s = actorRef.getPersistedSnapshot();
//           resume(Effect.succeed(s.output as any));
//           actorRef.stop();
//         },
//         error(err) {
//           resume(Effect.fail(err));
//           actorRef.stop();
//         },
//       });
//       signal.addEventListener("abort", () => {
//         actorRef.stop();
//       });
//       actorRef.start();
//     }),
//   ] as const;
// }

// export function wrapMachine<TStateMachine extends AnyStateMachine>(
//   evaluate: LazyArg<Actor<TStateMachine>>,
// ) {
//   const actor = evaluate();
//   const send = (evt: EventFrom<TStateMachine>) => Effect.sync(() => actor.send(evt));
//   return [
//     send,
//     Effect.async<OutputFrom<TStateMachine>, unknown>((resume, signal) => {
//       actor.subscribe({
//         complete() {
//           console.log("COMPLETE");
//           const ps = actor.getPersistedSnapshot();
//           resume(Effect.succeed(ps.output as any));
//           actor.stop();
//         },
//         error(err) {
//           resume(Effect.fail(err));
//           actor.stop();
//         },
//       });
//       signal.addEventListener("abort", () => {
//         actor.stop();
//       });
//       actor.start();
//     }),
//   ] as const;
// }
