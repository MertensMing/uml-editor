import { useStore } from "zustand";
import shallow from "zustand/shallow";
import {
  ContainerObjectType,
  findObject,
} from "../../../../core/entities/Deployment";
import { useService } from "../../../../shared/libs/di/react/useService";
import { pick } from "../../../../shared/utils/pick";
import { useEditDeploymentController } from "../../controller/useEditDeploymentController";
import { deploymentStoreIdentifier } from "../../store/deploymentStore";
import { ColorPicker } from "../ColorPicker";

function Comments() {
  const deploymentStore = useService(deploymentStoreIdentifier);
  const { handleSelectObjectBgColor } = useEditDeploymentController([]);
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
