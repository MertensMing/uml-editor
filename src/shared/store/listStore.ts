import { createStore, StoreApi } from "zustand";
import { db } from "../../db";
import { DiagramType } from "../constants";

type State = {
  list: {
    id: string;
    name: string;
    diagram: string;
  }[];
  type: DiagramType;
};

type Actions = {
  fetchList(): Promise<void>;
  setCurrentType(type: DiagramType): void;
};

export type ListStore = State & Actions;

export const listStore = createListStore();

export function createListStore(): StoreApi<ListStore> {
  return createStore((set, get) => {
    return {
      list: [],
      type: DiagramType.activity,
      setCurrentType(type) {
        set({ type });
      },
      async fetchList() {
        const res = await db[
          {
            [DiagramType.activity]: "activities",
            [DiagramType.deployment]: "deployments",
          }[get().type]
        ].toArray();
        const r = await db.activities.toArray();
        set({
          list: res.map((item) => ({
            id: item.id,
            name: item.name,
            diagram: item.diagram,
          })),
        });
      },
    };
  });
}
