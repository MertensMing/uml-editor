import { StoreApi, useStore } from "zustand";
import shallow from "zustand/shallow";
import { findObject, ObjectType } from "../../../../core/entities/Deployment";
import { ListStore } from "../../../../shared/store/listStore";
import { UndoStore } from "../../../../shared/store/undo";
import { pick } from "../../../../shared/utils/pick";
import { useEditDeploymentController } from "../../controller/useEditDeploymentController";
import { DeploymentStore } from "../../store/deploymentStore";

function JsonContent(props: {
  deploymentStore: StoreApi<DeploymentStore>;
  undoStore: StoreApi<UndoStore<any>>;
  listStore: StoreApi<ListStore>;
}) {
  const { deploymentStore, undoStore, listStore } = props;
  const { handleContentChange } = useEditDeploymentController([
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

  return (
    <>
      {currentObject &&
        !currentObject.isContainer &&
        currentObject.type === ObjectType.json && (
          <div className="pt-8">
            <h3 className="pb-2 text-sm font-bold">内容</h3>
            <textarea
              className="textarea textarea-bordered leading-4 scrollbar-thin scrollbar-thumb-slate-300"
              value={currentObject.content || ""}
              onChange={(e) => {
                handleContentChange(currentObjectId, e.target.value);
              }}
              rows={10}
            />
          </div>
        )}
    </>
  );
}

export default JsonContent;
