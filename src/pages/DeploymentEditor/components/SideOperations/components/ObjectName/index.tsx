import { useStore } from "zustand";
import shallow from "zustand/shallow";
import {
  DEFAULT_NAME,
  findObject,
} from "../../../../../../core/entities/Deployment";
import { useService } from "../../../../../../shared/libs/di/react/useService";
import { pick } from "../../../../../../shared/utils/pick";
import { useObjectDetailController } from "../../../../controller/useObjectDetailController";
import { deploymentStoreIdentifier } from "../../../../store/deploymentStore";

export const ObjectName = function () {
  const { handleObjectNameChange } = useObjectDetailController();

  const deploymentStore = useService(deploymentStoreIdentifier);
  const { currentObjectId } = useStore(
    deploymentStore,
    (state) => pick(state, ["currentObjectId", "deployment"]),
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

  return (
    <div className="pt-8">
      <h3 className="pb-2 text-sm font-bold">名称</h3>
      <div>
        <div>
          <input
            type="text"
            className="input input-bordered input-sm"
            value={currentObject?.name || DEFAULT_NAME}
            onChange={(e) =>
              handleObjectNameChange(currentObjectId, e.target.value)
            }
          />
        </div>
      </div>
    </div>
  );
};
