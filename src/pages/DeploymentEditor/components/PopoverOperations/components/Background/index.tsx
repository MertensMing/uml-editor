import { useStore } from "zustand";
import shallow from "zustand/shallow";
import {
  ContainerObjectType,
  findObject,
} from "../../../../../../core/entities/Deployment";
import { useService } from "../../../../../../shared/libs/di/react/useService";
import { deploymentStoreIdentifier } from "../../../../store/deploymentStore";
import { ColorPicker } from "../../../ColorPicker";

function Background(props: { onBgColorChange: (color: string) => void }) {
  const deploymentStore = useService(deploymentStoreIdentifier);

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
            onChange={(color) => props.onBgColorChange(color)}
          />
        </div>
      )}
    </>
  );
}

export default Background;
