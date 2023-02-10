import {
  ArrowRightOutlined,
  DeleteOutlined,
  DragOutlined,
} from "@ant-design/icons";
import classNames from "classnames";
import { useEffect, useRef } from "react";
import { ReactSVG } from "react-svg";
import { StoreApi, useStore } from "zustand";
import shallow from "zustand/shallow";
import { ListStore } from "../../../../shared/store/listStore";
import { UndoStore } from "../../../../shared/store/undo";
import { pick } from "../../../../shared/utils/pick";
import { useEditDeploymentController } from "../../controller/useEditDeploymentController";
import { DeploymentStore } from "../../store/deploymentStore";

function getObjectId(e: any) {
  const hoveredElement: any = document.elementFromPoint(e.clientX, e.clientY);
  let objectId = hoveredElement?.attributes?.objectId?.value;
  if (
    !objectId &&
    `${hoveredElement.parentNode.id}`.startsWith("elem_object")
  ) {
    objectId = `${hoveredElement.parentNode.id}`.replace("elem_", "");
  }
  return objectId;
}

function Diagram(props: {
  deploymentStore: StoreApi<DeploymentStore>;
  undoStore: StoreApi<UndoStore<any>>;
  listStore: StoreApi<ListStore>;
}) {
  const { svgUrl, currentObjectId, deployment } = useStore(
    props.deploymentStore,
    (state) => pick(state, ["svgUrl", "currentObjectId", "deployment"]),
    shallow
  );
  const { handleObjectSelect } = useEditDeploymentController([
    props.deploymentStore,
    props.undoStore,
    props.listStore,
  ]);
  const isRoot = currentObjectId === deployment?.root?.id;
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      const id = getObjectId(e);
      if (!id) {
        ref.current.style.display = "none";
      }
    }
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  return (
    <div className="pt-4">
      <div
        ref={ref}
        style={{ position: "fixed", left: 0, top: 0, display: "none" }}
        className={classNames(
          "shadow-slate-400 shadow-xl bg-slate-50 z-10 p-2 rounded border border-solid flex-col flex",
          {
            "opacity-0": isRoot,
          }
        )}
      >
        <DeleteOutlined
          className="cursor-pointer hover:opacity-70"
          onClick={() => {
            props.deploymentStore.getState().deleteObject(currentObjectId);
          }}
        />
        <DragOutlined
          className={classNames("cursor-move hover:opacity-70 mt-2")}
          draggable
          onDragEnd={(e) => {
            const objectId = getObjectId(e);
            if (objectId) {
              props.deploymentStore
                .getState()
                .moveObject(currentObjectId, objectId);
              ref.current.style.display = "none";
            }
          }}
        />
        <ArrowRightOutlined
          className="cursor-default mt-2 hover:opacity-70"
          draggable
          onDragEnd={(e) => {
            const objectId = getObjectId(e);
            if (objectId) {
              props.deploymentStore
                .getState()
                .addRelation(currentObjectId, objectId);
              ref.current.style.display = "none";
            }
          }}
        />
      </div>
      <div
        className="deployment"
        id="deployment-diagram"
        style={{
          touchAction: "none",
        }}
        onClick={(e: any) => {
          const objectId = e.target?.attributes?.objectId?.value;
          const rect = e.target.getBoundingClientRect();
          const left = rect.left;
          const top = rect.top;
          const width = rect.width;

          if (objectId) {
            handleObjectSelect(objectId);
            ref.current.style.display = "flex";
            ref.current.style.left = `${left + width + 10}px`;
            ref.current.style.top = `${top - 20}px`;
          } else if (
            e.target.nodeName === "text" &&
            `${e.target.parentNode.id}`.startsWith("elem_object")
          ) {
            handleObjectSelect(e.target.parentNode.id.replace("elem_", ""));
            ref.current.style.display = "flex";
            ref.current.style.left = `${left + width + 10}px`;
            ref.current.style.top = `${top - 20}px`;
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
