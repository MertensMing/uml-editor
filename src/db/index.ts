import Dexie from "dexie";

class PlantUMLEditorDatabase extends Dexie {
  deployments!: Dexie.Table<
    { id: string; diagram: string; name: string },
    string
  >;
  activities!: Dexie.Table<
    { id: string; diagram: string; name: string },
    string
  >;

  constructor() {
    super("PlantUMLEditorDatabase");
    this.version(2).stores({
      deployments: "++id, diagram, name",
      activities: "++id, diagram, name",
    });
  }
}

export const db = new PlantUMLEditorDatabase();
