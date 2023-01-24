import { createStore, StoreApi } from "zustand";
import remove from "lodash/remove";
import debounce from "lodash/debounce";

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

export function createUndoStore<T>(): StoreApi<UndoStore<T>> {
  return createStore((set, get) => {
    const save = debounce((version: T) => {
      if (get().queue.length >= 100) {
        get().queue.pop();
      }
      if (get().undoIndex !== 0) {
        remove(get().queue, (_, index) => {
          return index < get().undoIndex;
        });
        set({
          undoIndex: 0,
          queue: [version, ...get().queue],
        });
      } else {
        set({
          queue: [version, ...get().queue],
        });
      }
    }, 800);

    return {
      queue: [],
      undoIndex: 0,
      current: undefined,
      save,
      initialize(queue) {
        set({
          queue,
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
