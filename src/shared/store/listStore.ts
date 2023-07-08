import { createStore, StoreApi } from "zustand";
import { DiagramType } from "../constants";
import { createServiceIdentifier } from "../libs/di/utils/createServiceIdentifier";

type State = {
  list: {
    id: string;
    name: string;
    diagram: string;
  }[];
  type: DiagramType;
};

type Actions = {
  setCurrentType(type: DiagramType): void;
};

export type ListStore = State & Actions;

export const listStore = createListStore();

export const listStoreIdentifier = createServiceIdentifier<StoreApi<ListStore>>(
  "listStoreIdentifier"
);

export function createListStore(): StoreApi<ListStore> {
  return createStore((set) => {
    return {
      list: [],
      type: DiagramType.deployment,
      setCurrentType(type) {
        set({ type });
      },
    };
  });
}
