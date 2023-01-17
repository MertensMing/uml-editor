import { StoreApi } from "zustand";

type CreateStore<D extends {}[]> = {
  [K in keyof D]: StoreApi<D[K]>;
};

export function createController<
  StoreDependencies extends {}[],
  Handlers extends Record<string, (...args: any[]) => any>,
  Creator = (stores: CreateStore<StoreDependencies>) => Handlers
>(creator: Creator): Creator {
  return creator;
}
