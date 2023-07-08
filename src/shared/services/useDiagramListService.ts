import { PlantUMLEditorDatabaseIdentifier } from "../../db";
import { useService } from "../libs/di/react/useService";
import { listStoreIdentifier } from "../store/listStore";

export function useDiagramListService() {
  const listStore = useService(listStoreIdentifier);
  const db = useService(PlantUMLEditorDatabaseIdentifier);
  return {
    async fetchList() {
      const res = await db.deployments.toArray();
      listStore.setState({
        list: res.map((item) => ({
          id: item.id,
          name: item.name,
          diagram: item.diagram,
        })),
      });
    },
  };
}
