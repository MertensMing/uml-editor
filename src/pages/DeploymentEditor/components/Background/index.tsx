import { StoreApi, useStore } from "zustand";
import shallow from "zustand/shallow";
import {
  ContainerObjectType,
  findObject,
  RelationType,
} from "../../../../core/entities/Deployment";
import { ListStore } from "../../../../shared/store/listStore";
import { UndoStore } from "../../../../shared/store/undo";
import { pick } from "../../../../shared/utils/pick";
import { useEditDeploymentController } from "../../controller/useEditDeploymentController";
import { DeploymentStore } from "../../store/deploymentStore";
import { ColorPicker } from "../ColorPicker";

function Background(props: {
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
        <div className="pt-8">
          <h3 className="pb-2 text-sm font-bold flex items-center">背景色</h3>
          <button className="btn btn-outline btn-sm">
            <ColorPicker
              color={currentObject?.bgColor || "#e5e7eb"}
              onChange={(color) =>
                handleSelectObjectBgColor(currentObjectId, color)
              }
            />
          </button>
        </div>
      )}
    </>
  );
}

export default Background;
