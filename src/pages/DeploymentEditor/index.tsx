import { useEffect, useRef } from "react";
import { useStore } from "zustand";
import shallow from "zustand/shallow";
import { useDebounceCallback } from "@react-hook/debounce";
import { useParams } from "react-router-dom";
import { EditorLayout } from "../../shared/components/EditorLayout";
import { pick } from "../../shared/utils/pick";
import { useEditDeploymentController } from "./controller/useEditDeploymentController";
import {
  createDeploymentStore,
  deploymentStoreIdentifier,
} from "./store/deploymentStore";
import { createUndoStore } from "../../shared/store/undo";
import { listStore } from "../../shared/store/listStore";
import Diagram from "./components/Diagram";
import Toolbar from "./components/Toolbar";
import Relations from "./components/Relations";
import JsonContent from "./components/JsonContent";
import Comments from "./components/Comments";
import {
  DEFAULT_NAME,
  Deployment,
  findObject,
  LineType,
} from "../../core/entities/Deployment";
import { connect } from "../../shared/libs/di/react/connect";
import { Container } from "inversify";
import { useService } from "../../shared/libs/di/react/useService";

export const DeploymentEditor = connect(
  function DeploymentEditor() {
    const deploymentStore = useService(deploymentStoreIdentifier);
    console.log(deploymentStore);
    const undoStore = useRef(createUndoStore<Deployment>()).current;

    const {
      handleInit,
      handleDiagramChange,
      handleObjectNameChange,
      handleLineTypeChange,
      handleDeleteDiagram,
      handleAddDiagram,
    } = useEditDeploymentController([deploymentStore, undoStore, listStore]);

    const { currentObjectId, svgUrl, deployment, uml, pngUrl } = useStore(
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
            <JsonContent
              deploymentStore={deploymentStore}
              undoStore={undoStore}
              listStore={listStore}
            />
            <Comments
              deploymentStore={deploymentStore}
              undoStore={undoStore}
              listStore={listStore}
            />
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
  },
  () => {
    const container = new Container();
    container
      .bind(deploymentStoreIdentifier)
      .toDynamicValue(() => createDeploymentStore());
    return container;
  }
);
