import { StoreApi, useStore } from "zustand";
import shallow from "zustand/shallow";
import {
  ContainerObjectType,
  findObject,
  ObjectType,
} from "../../../../core/entities/Deployment";
import { ListStore } from "../../../../shared/store/listStore";
import { UndoStore } from "../../../../shared/store/undo";
import { pick } from "../../../../shared/utils/pick";
import { useEditDeploymentController } from "../../controller/useEditDeploymentController";
import { DeploymentStore } from "../../store/deploymentStore";

function Comments(props: {
  deploymentStore: StoreApi<DeploymentStore>;
  undoStore: StoreApi<UndoStore<any>>;
  listStore: StoreApi<ListStore>;
}) {
  const { deploymentStore, undoStore, listStore } = props;
  const { handleObjectChange } = useEditDeploymentController([
    deploymentStore,
    undoStore,
    listStore,
  ]);

  const { currentObjectId } = useStore(
    deploymentStore,
    (state) =>
      pick(state, [
        "currentObjectId",
        "deployment",
        "svgUrl",
        "allowDragRelation",
        "uml",
        "pngUrl",
      ]),
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
          <h3 className="pb-2 text-sm font-bold flex items-center">
            注释{" "}
            <select
              value={currentObject?.comment?.direction || "right"}
              className="select select-bordered select-xs ml-3"
              onChange={(e) => {
                handleObjectChange(currentObjectId, "comment", {
                  direction: e.target.value,
                  content: currentObject?.comment?.content,
                });
              }}
            >
              <option value={"top"}>上</option>
              <option value={"right"}>右</option>
              <option value={"bottom"}>下</option>
              <option value={"left"}>左</option>
            </select>
          </h3>
          <textarea
            className="textarea textarea-bordered leading-4 scrollbar-thin scrollbar-thumb-slate-300"
            value={currentObject?.comment?.content || ""}
            onChange={(e) => {
              handleObjectChange(currentObjectId, "comment", {
                direction: currentObject?.comment?.direction || "right",
                content: e.target.value,
              });
            }}
            rows={10}
          />
        </div>
      )}
    </>
  );
}

export default Comments;
