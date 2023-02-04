import Dexie from "dexie";

class PlantUMLEditorDatabase extends Dexie {
  deployments!: Dexie.Table<
    { id: string; diagram: string; name: string },
    string
  >;

  constructor() {
    super("PlantUMLEditorDatabase");
    this.version(1).stores({
      deployments: "++id, diagram, name",
    });
  }
}

export const db = new PlantUMLEditorDatabase();
