import { ReactSVG } from "react-svg";
import { StoreApi, useStore } from "zustand";
import shallow from "zustand/shallow";
import { ListStore } from "../../../../shared/store/listStore";
import { UndoStore } from "../../../../shared/store/undo";
import { pick } from "../../../../shared/utils/pick";
import { useEditDeploymentController } from "../../controller/useEditDeploymentController";
import { DeploymentStore } from "../../store/deploymentStore";

function Diagram(props: {
  deploymentStore: StoreApi<DeploymentStore>;
  undoStore: StoreApi<UndoStore<any>>;
  listStore: StoreApi<ListStore>;
}) {
  const { svgUrl } = useStore(
    props.deploymentStore,
    (state) => pick(state, ["svgUrl"]),
    shallow
  );
  const { handleObjectSelect } = useEditDeploymentController([
    props.deploymentStore,
    props.undoStore,
    props.listStore,
  ]);
  return (
    <div
      style={{
        paddingTop: "16px",
      }}
    >
      <div
        className="deployment"
        id="deployment-diagram"
        style={{
          touchAction: "none",
        }}
        onClick={(e: any) => {
          const objectId = e.target?.attributes?.objectId?.value;
          if (objectId) {
            handleObjectSelect(objectId);
          } else if (
            e.target.nodeName === "text" &&
            `${e.target.parentNode.id}`.startsWith("elem_object")
          ) {
            handleObjectSelect(e.target.parentNode.id.replace("elem_", ""));
          }
        }}
      >
        {svgUrl && (
          <div>
            <ReactSVG src={svgUrl} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Diagram;
