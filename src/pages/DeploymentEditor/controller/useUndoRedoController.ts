import { useRef } from "react";
import cloneDeep from "lodash/cloneDeep";
import debounce from "lodash/debounce";
import { deploymentUndoStoreIdentifier } from "../../../shared/store/undo";
import { createController } from "../../../shared/utils/createController";
import { PlantUMLEditorDatabaseIdentifier } from "../../../db";
import { listStoreIdentifier } from "../../../shared/store/listStore";
import { deploymentStoreIdentifier } from "../store/deploymentStore";
import { useService } from "../../../shared/libs/di/react/useService";

type Handlers = {
  handleRedo(): void;
  handleUndo(): void;
};

export const useUndoRedoController = createController<[], Handlers>(() => {
  const deploymentStore = useService(deploymentStoreIdentifier);
  const listStore = useService(listStoreIdentifier);
  const undoStore = useService(deploymentUndoStoreIdentifier);
  const db = useService(PlantUMLEditorDatabaseIdentifier);

  const saveChanged = useRef(
    debounce((needSaveUndo?: boolean) => {
      needSaveUndo = needSaveUndo ?? true;
      const state = deploymentStore.getState();
      const deployment = state.deployment;
      if (needSaveUndo) {
        undoStore.getState().save(deployment);
      }
      db.deployments.update(deployment.id, {
        diagram: JSON.stringify(deployment),
        name: deployment.root.name,
      });
      listStore.getState().fetchList();
    }, 1000)
  ).current;

  return {
    handleRedo() {
      undoStore.getState().redo();
      deploymentStore
        .getState()
        .setDiagram(cloneDeep(undoStore.getState().current));
      saveChanged(false);
    },
    handleUndo() {
      undoStore.getState().undo();
      deploymentStore
        .getState()
        .setDiagram(cloneDeep(undoStore.getState().current));
      saveChanged(false);
    },
  };
});