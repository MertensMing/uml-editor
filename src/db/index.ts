import Dexie from "dexie";
import { createServiceIdentifier } from "../shared/libs/di/utils/createServiceIdentifier";

class PlantUMLEditorDatabase extends Dexie {
  deployments!: Dexie.Table<
    { id: string; diagram: string; name: string },
    string
  >;

  constructor() {
    super("PlantUMLEditorDatabase");
    this.version(2).stores({
      deployments: "++id, diagram, name",
    });
  }
}

export const db = new PlantUMLEditorDatabase();

export const PlantUMLEditorDatabaseIdentifier =
  createServiceIdentifier<PlantUMLEditorDatabase>("PlantUMLEditorDatabase");
