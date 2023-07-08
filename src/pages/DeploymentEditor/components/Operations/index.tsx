import { useEffect } from "react";
import { useStore } from "zustand";
import shallow from "zustand/shallow";
import { useParams } from "react-router-dom";
import JsonContent from "../JsonContent";
import Relations from "../Relations";
import {
  DEFAULT_NAME,
  findObject,
  LineType,
} from "../../../../core/entities/Deployment";
import { useDiagramController } from "../../controller/useDiagramController";
import { useService } from "../../../../shared/libs/di/react/useService";
import { deploymentStoreIdentifier } from "../../store/deploymentStore";
import { pick } from "../../../../shared/utils/pick";
import { Comments } from "../Comments";
import { useObjectDetailController } from "../../controller/useObjectDetailController";

export const Opreations = function () {
  const { handleObjectNameChange, handleLineTypeChange } =
    useObjectDetailController();
  const { handleDiagramInit, handleDiagramChange } = useDiagramController([]);

  const deploymentStore = useService(deploymentStoreIdentifier);
  const { currentObjectId, deployment } = useStore(
    deploymentStore,
    (state) =>
      pick(state, ["currentObjectId", "deployment", "svgUrl", "uml", "pngUrl"]),
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

  const { id } = useParams();

  useEffect(() => {
    handleDiagramInit();
  }, [id]);

  useEffect(() => {
    handleDiagramChange();
  }, [deployment]);

  return (
    <div>
      <div className="">
        <h3 className="pb-2 text-sm font-bold">连线样式</h3>
        <div className="flex items-center">
          <div className="form-control">
            <label className="input-group input-group-sm">
              <span>类型</span>
              <select
                value={deployment?.linetype}
                className="select select-bordered select-sm"
                onChange={(e) => {
                  handleLineTypeChange(e.target.value as LineType);
                }}
              >
                <option value={"default" as LineType}>Default</option>
                <option value={"ortho" as LineType}>Ortho</option>
                <option value={"polyline" as LineType}>Polyline</option>
              </select>
            </label>
          </div>
        </div>
      </div>
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
      <JsonContent />
      <Comments />
      <Relations />
    </div>
  );
};
