import cloneDeep from "lodash/cloneDeep";
import { deploymentUndoStoreIdentifier } from "../../../shared/store/undo";
import { createController } from "../../../shared/utils/createController";
import { deploymentStoreIdentifier } from "../store/deploymentStore";
import { useService } from "../../../shared/libs/di/react/useService";

type Handlers = {
  handleRedo(): void;
  handleUndo(): void;
};

export const useUndoRedoController = createController<[], Handlers>(() => {
  const deploymentStore = useService(deploymentStoreIdentifier);
  const undoStore = useService(deploymentUndoStoreIdentifier);

  return {
    handleRedo() {
      undoStore.getState().redo();
      deploymentStore
        .getState()
        .setDiagram(cloneDeep(undoStore.getState().current));
    },
    handleUndo() {
      undoStore.getState().undo();
      deploymentStore
        .getState()
        .setDiagram(cloneDeep(undoStore.getState().current));
    },
  };
});
