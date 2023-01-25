/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import { ReactSVG } from "react-svg";
import { useStore } from "zustand";
import shallow from "zustand/shallow";
import { EditorLayout } from "../../shared/components/EditorLayout";
import { FormItem } from "../../shared/components/FormItem";
import { pick } from "../../shared/utils/pick";
import { AddContainer } from "./components/AddContainer";
import { AddObject } from "./components/AddObject";
import { useEditDeploymentLogic } from "./logic/useEditDeploymentLogic";
import { createDeploymentStore } from "./store/deploymentStore";
import { useDrag } from "./hooks/useDrag";
import { findObject } from "../../core/entities/Deployment";

export function DeploymentEditor() {
  const deploymentStore = useRef(createDeploymentStore()).current;
  const {
    handleInit,
    handleDiagramChange,
    handleAddContainer,
    handleAddObject,
    handleObjectSelect,
    handleDrop,
  } = useEditDeploymentLogic([deploymentStore]);
  const { currentObjectId, svgUrl, deployment } = useStore(
    deploymentStore,
    (state) => pick(state, ["currentObjectId", "deployment", "svgUrl"]),
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
  const dragElementRef = useRef<HTMLDivElement>();
  const { refProps } = useDrag(dragElementRef, handleDrop);

  useEffect(() => {
    handleInit();
  }, []);

  useEffect(() => {
    handleDiagramChange();
  }, [deployment]);

  return (
    <EditorLayout
      currentDiagram="deployment"
      uml=""
      pngUrl=""
      svgUrl={svgUrl}
      diagram={
        <div>
          <div {...refProps} ref={dragElementRef} />
          <div
            className="deployment"
            id="deployment-diagram"
            onClick={(e: any) => {
              const objectId = e.target?.attributes?.objectId?.value;
              if (objectId) {
                handleObjectSelect(objectId);
              }
            }}
          >
            {svgUrl && <ReactSVG src={svgUrl} />}
          </div>
        </div>
      }
      operation={
        <div>
          <FormItem label="当前对象" content={currentObject?.name} />
          <FormItem
            label="添加容器"
            content={
              <AddContainer
                onClick={(type) => handleAddContainer(currentObjectId, type)}
              />
            }
          />
          <FormItem
            label="添加图形"
            content={
              <AddObject
                onClick={(type) => handleAddObject(currentObjectId, type)}
              />
            }
          />
          <FormItem
            label="添加图形"
            content={
              <AddObject
                onClick={(type) => handleAddObject(currentObjectId, type)}
              />
            }
          />
        </div>
      }
    />
  );
}
