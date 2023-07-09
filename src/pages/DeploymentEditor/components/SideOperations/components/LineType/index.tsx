import { useStore } from "zustand";
import shallow from "zustand/shallow";
import { LineType as ILineType } from "../../../../../../core/entities/Deployment";
import { useService } from "../../../../../../shared/libs/di/react/useService";
import { pick } from "../../../../../../shared/utils/pick";
import { useObjectDetailController } from "../../../../controller/useObjectDetailController";
import { deploymentStoreIdentifier } from "../../../../store/deploymentStore";

export const LineType = function () {
  const { handleLineTypeChange } = useObjectDetailController();
  const deploymentStore = useService(deploymentStoreIdentifier);
  const { deployment } = useStore(
    deploymentStore,
    (state) => pick(state, ["currentObjectId", "deployment"]),
    shallow
  );
  return (
    <div>
      <h3 className="pb-2 text-sm font-bold">连线样式</h3>
      <div className="flex items-center">
        <div className="form-control">
          <label className="input-group input-group-sm">
            <span>类型</span>
            <select
              value={deployment?.linetype}
              className="select select-bordered select-sm"
              onChange={(e) => {
                handleLineTypeChange(e.target.value as ILineType);
              }}
            >
              <option value={"default" as ILineType}>Default</option>
              <option value={"ortho" as ILineType}>Ortho</option>
              <option value={"polyline" as ILineType}>Polyline</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
};
