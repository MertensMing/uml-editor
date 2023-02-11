import { StoreApi, useStore } from "zustand";
import shallow from "zustand/shallow";
import {
  ContainerObjectType,
  findObject,
} from "../../../../core/entities/Deployment";
import { ListStore } from "../../../../shared/store/listStore";
import { UndoStore } from "../../../../shared/store/undo";
import { pick } from "../../../../shared/utils/pick";
import { useEditDeploymentController } from "../../controller/useEditDeploymentController";
import { DeploymentStore } from "../../store/deploymentStore";
import { ColorPicker } from "../ColorPicker";

function Comments(props: {
  deploymentStore: StoreApi<DeploymentStore>;
  undoStore: StoreApi<UndoStore<any>>;
  listStore: StoreApi<ListStore>;
}) {
  const { deploymentStore, undoStore, listStore } = props;
  const { handleSelectObjectBgColor } = useEditDeploymentController([
    deploymentStore,
    undoStore,
    listStore,
  ]);
  const { currentObjectId } = useStore(
    deploymentStore,
    (state) => pick(state, ["currentObjectId"]),
    shallow
  );
  const currentObject = useStore(
    deploymentStore,
    (state) =>
      !state.deployment?.root
        ? undefined
        : findObject(state.deployment?.root, state.currentObjectId),
    shallow
  );
  const isRoot = currentObject?.type === ContainerObjectType.diagram;

  return (
    <>
      {!isRoot && (
        <div>
          <ColorPicker
            color={currentObject?.bgColor || "#e5e7eb"}
            onChange={(color) =>
              handleSelectObjectBgColor(currentObjectId, color)
            }
          />
        </div>
      )}
    </>
  );
}

export default Comments;
