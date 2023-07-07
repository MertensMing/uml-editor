import { createStore, StoreApi } from "zustand";
import remove from "lodash/remove";
import throttle from "lodash/throttle";
import cloneDeep from "lodash/cloneDeep";
import { createServiceIdentifier } from "../libs/di/utils/createServiceIdentifier";
import { Deployment } from "../../core/entities/Deployment";

type State<T> = {
  queue: T[];
  undoIndex: number;
  current?: T;
};

type Actions<T> = {
  initialize(queue: State<T>["queue"]): void;
  save(version: T): void;
  undo(): void;
  redo(): void;
};

export type UndoStore<T> = State<T> & Actions<T>;

export const deploymentUndoStoreIdentifier = createServiceIdentifier<
  StoreApi<UndoStore<Deployment>>
>("deploymentUndoStoreIdentifier");

export function createUndoStore<T>(): StoreApi<UndoStore<T>> {
  return createStore((set, get) => {
    const save = throttle((version: T) => {
      const cloned = cloneDeep(version);
      if (get().queue.length >= 100) {
        get().queue.pop();
      }
      if (get().undoIndex !== 0) {
        remove(get().queue, (_, index) => {
          return index < get().undoIndex;
        });
        set({
          undoIndex: 0,
          queue: [cloned, ...get().queue],
        });
      } else {
        set({
          queue: [cloned, ...get().queue],
        });
      }
    }, 5000);

    return {
      queue: [],
      undoIndex: 0,
      current: undefined,
      save,
      initialize(queue) {
        set({
          queue: cloneDeep(queue),
        });
      },
      undo() {
        const newUndoIndex = get().undoIndex + 1;
        if (newUndoIndex <= get().queue.length - 1) {
          set({
            undoIndex: newUndoIndex,
            current: get().queue[newUndoIndex],
          });
        }
      },
      redo() {
        const newUndoIndex = get().undoIndex - 1;
        if (newUndoIndex >= 0) {
          set({
            undoIndex: newUndoIndex,
            current: get().queue[newUndoIndex],
          });
        }
      },
    };
  });
}
