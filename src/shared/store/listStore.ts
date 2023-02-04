import { createStore, StoreApi } from "zustand";
import { db } from "../../db";

type State = {
  list: {
    id: string;
    name: string;
  }[];
};

type Actions = {
  fetchList(): Promise<void>;
};

export type ListStore = State & Actions;

export const listStore = createListStore();

export function createListStore(): StoreApi<ListStore> {
  return createStore((set) => {
    return {
      list: [],
      async fetchList() {
        const res = await db.deployments.toArray();
        set({
          list: res.map((item) => ({
            id: item.id,
            name: item.name,
          })),
        });
      },
    };
  });
}
