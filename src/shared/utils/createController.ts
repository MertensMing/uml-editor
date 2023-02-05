import { StoreApi } from "zustand";

type UseLogic<
  StoreDeps extends {}[],
  Handlers extends Record<string, Function>
> = (stores: {
  [K in keyof StoreDeps]: StoreApi<StoreDeps[K]>;
}) => Handlers;

export function createController<
  S extends {}[],
  H extends Record<string, Function>,
  I = UseLogic<S, H>
>(initializer: I): I {
  return initializer;
}
