import { useEffect, useRef } from "react";
import { useStore } from "zustand";
import shallow from "zustand/shallow";
import { useDebounceCallback } from "@react-hook/debounce";
import { useParams } from "react-router-dom";
import { EditorLayout } from "../../shared/components/EditorLayout";
import { pick } from "../../shared/utils/pick";
import { AddContainer } from "./components/AddContainer";
import { AddObject } from "./components/AddObject";
import { useEditDeploymentController } from "./controller/useEditDeploymentController";
import { createDeploymentStore } from "./store/deploymentStore";
import { useDrag } from "../../shared/hooks/useDrag";
import { createUndoStore } from "../../shared/store/undo";
import { listStore } from "../../shared/store/listStore";
import Diagram from "./components/Diagram";
import Toolbar from "./components/Toolbar";
import Relations from "./components/Relations";
import Background from "./components/Background";
import JsonContent from "./components/JsonContent";
import Comments from "./components/Comments";
import {
  DEFAULT_NAME,
  Deployment,
  findObject,
  LineType,
} from "../../core/entities/Deployment";

export function DeploymentEditor() {
  const deploymentStore = useRef(createDeploymentStore()).current;
  const undoStore = useRef(createUndoStore<Deployment>()).current;

  const {
    handleInit,
    handleDiagramChange,
    handleAddContainer,
    handleAddObject,
    handleObjectNameChange,
    handleToggleAllowDragRelation,
    handleLineTypeChange,
    handleDeleteDiagram,
    handleAddDiagram,
  } = useEditDeploymentController([deploymentStore, undoStore, listStore]);

  const {
    currentObjectId,
    svgUrl,
    deployment,
    allowDragRelation,
    uml,
    pngUrl,
  } = useStore(
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

  const { id } = useParams();

  const boundHandleDiagramChange = useDebounceCallback(
    handleDiagramChange,
    500
  );

  useEffect(() => {
    handleInit();
  }, [id]);

  useEffect(() => {
    boundHandleDiagramChange();
  }, [deployment]);

  return (
    <EditorLayout
      currentDiagram="deployment"
      uml={uml}
      pngUrl={pngUrl}
      svgUrl={svgUrl}
      onDelete={handleDeleteDiagram}
      onAdd={handleAddDiagram}
      diagram={
        <Diagram
          deploymentStore={deploymentStore}
          undoStore={undoStore}
          listStore={listStore}
        />
      }
      operation={
        <div>
          <div>
            <h3 className="pb-2 text-sm font-bold">拖拽连线</h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                className="toggle"
                checked={allowDragRelation ?? false}
                onChange={(e) =>
                  handleToggleAllowDragRelation(e.target.checked)
                }
              />
              <div className="text-gray-400 ml-4 text-sm">
                {allowDragRelation
                  ? "拖动节点新增对象关系"
                  : "拖动节点修改对象层级"}
              </div>
            </div>
          </div>
          <div className="pt-8">
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
          <Comments
            deploymentStore={deploymentStore}
            undoStore={undoStore}
            listStore={listStore}
          />
          <JsonContent
            deploymentStore={deploymentStore}
            undoStore={undoStore}
            listStore={listStore}
          />
          <div className="pt-8">
            <h3 className="pb-2 text-sm font-bold">添加容器</h3>
            <div>
              <AddContainer
                onClick={(type) =>
                  handleAddContainer(deployment?.root?.id, type)
                }
              />
            </div>
          </div>
          <div className="pt-8">
            <h3 className="pb-2 text-sm font-bold">添加图形</h3>
            <div>
              <AddObject
                onClick={(type) => handleAddObject(deployment?.root?.id, type)}
              />
            </div>
          </div>
          <Relations
            deploymentStore={deploymentStore}
            undoStore={undoStore}
            listStore={listStore}
          />
        </div>
      }
      toolbar={
        <Toolbar
          deploymentStore={deploymentStore}
          undoStore={undoStore}
          listStore={listStore}
        />
      }
    />
  );
}
