import { StoreApi, useStore } from "zustand";
import shallow from "zustand/shallow";
import { pick } from "../utils/pick";

export function useAction<
  T,
  Key extends keyof {
    [R in keyof T as T[R] extends Function ? R : never]: T[R];
  }
>(store: StoreApi<T>, keys: Key[]) {
  return useStore(store, (state) => pick(state, keys), shallow);
}
