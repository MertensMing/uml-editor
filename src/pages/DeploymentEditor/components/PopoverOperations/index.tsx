import {
  ArrowRightOutlined,
  DeleteOutlined,
  DragOutlined,
} from "@ant-design/icons";
import classNames from "classnames";
import { useCallback, useEffect, useRef } from "react";
import { useStore } from "zustand";
import shallow from "zustand/shallow";
import { useService } from "../../../../shared/libs/di/react/useService";
import { pick } from "../../../../shared/utils/pick";
import { deploymentStoreIdentifier } from "../../store/deploymentStore";
import Background from "./components/Background";
import { useSubscription } from "observable-hooks";
import { DiagramClick$Identifier } from "../../event/DiagramClick";
import { useObjectDetailController } from "../../controller/useObjectDetailController";

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

export function PopoverOperations() {
  const deploymentStore = useService(deploymentStoreIdentifier);
  const {
    handleMoveObject,
    handleDelete,
    handleAddRelation,
    handleSelectObjectBgColor,
  } = useObjectDetailController();
  const ref = useRef(null);
  const diagramClick$ = useService(DiagramClick$Identifier);
  const { currentObjectId, deployment } = useStore(
    deploymentStore,
    (state) => pick(state, ["svgUrl", "currentObjectId", "deployment"]),
    shallow
  );
  const isRoot = currentObjectId === deployment?.root?.id;

  const onClick = useCallback(function onClick(e) {
    const id = getObjectId(e);
    if (!id) {
      ref.current.style.display = "none";
    }
  }, []);

  useEffect(() => {
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("click", onClick);
    };
  }, []);

  useSubscription(diagramClick$, {
    next(e) {
      const target = e.target as any;
      const objectId = target?.attributes?.objectId?.value;
      const rect = target.getBoundingClientRect();
      const left = rect.left;
      const top = rect.top;
      const width = rect.width;
      if (objectId) {
        ref.current.style.display = "flex";
        ref.current.style.left = `${left + width + 10}px`;
        ref.current.style.top = `${top - 20}px`;
      } else if (
        target.nodeName === "text" &&
        `${target.parentNode.id}`.startsWith("elem_object")
      ) {
        ref.current.style.display = "flex";
        ref.current.style.left = `${left + width + 10}px`;
        ref.current.style.top = `${top - 20}px`;
      }
    },
  });

  return (
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
          handleDelete(currentObjectId);
        }}
      />
      <DragOutlined
        className={classNames("cursor-move hover:opacity-70 mt-3")}
        draggable
        onDragEnd={(e) => {
          const objectId = getObjectId(e);
          if (objectId) {
            handleMoveObject(currentObjectId, objectId);
            ref.current.style.display = "none";
          }
        }}
      />
      <ArrowRightOutlined
        className="cursor-grab mt-3 hover:opacity-70"
        draggable
        onDragEnd={(e) => {
          const objectId = getObjectId(e);
          if (objectId) {
            handleAddRelation(currentObjectId, objectId);
            ref.current.style.display = "none";
          }
        }}
      />
      <div className="mt-3 cursor-pointer">
        <Background
          onBgColorChange={(color) =>
            handleSelectObjectBgColor(currentObjectId, color)
          }
        />
      </div>
    </div>
  );
}
