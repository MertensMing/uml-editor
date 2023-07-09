import { useStore } from "zustand";
import shallow from "zustand/shallow";
import {
  ContainerObjectType,
  findObject,
} from "../../../../../../core/entities/Deployment";
import { useService } from "../../../../../../shared/libs/di/react/useService";
import { pick } from "../../../../../../shared/utils/pick";
import { useObjectDetailController } from "../../../../controller/useObjectDetailController";
import { deploymentStoreIdentifier } from "../../../../store/deploymentStore";
import { ColorPicker } from "../../../ColorPicker";

function Background() {
  const deploymentStore = useService(deploymentStoreIdentifier);
  const { handleSelectObjectBgColor } = useObjectDetailController();
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

export default Background;
