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
import {
  ContainerObjectType,
  findObject,
} from "../../core/entities/Deployment";
import { Button, Input, InputAdornment, Switch } from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useDebounceCallback } from "@react-hook/debounce";

export function DeploymentEditor() {
  const deploymentStore = useRef(createDeploymentStore()).current;
  const {
    handleInit,
    handleDiagramChange,
    handleAddContainer,
    handleAddObject,
    handleObjectSelect,
    handleDrop,
    handleObjectNameChange,
    handleDelete,
    handleToggleAllowDragRelation,
  } = useEditDeploymentLogic([deploymentStore]);
  const { currentObjectId, svgUrl, deployment, allowDragRelation } = useStore(
    deploymentStore,
    (state) =>
      pick(state, [
        "currentObjectId",
        "deployment",
        "svgUrl",
        "allowDragRelation",
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
  const relations = deployment?.relations?.[currentObjectId] ?? [];

  const dragElementRef = useRef<HTMLDivElement>();
  const { refProps } = useDrag(dragElementRef, handleDrop);
  const boundHandleDiagramChange = useDebounceCallback(
    handleDiagramChange,
    500
  );

  useEffect(() => {
    handleInit();
  }, []);

  useEffect(() => {
    boundHandleDiagramChange();
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
          <FormItem
            label="拖拽连线"
            content={
              <div className="flex items-center">
                <Switch
                  checked={allowDragRelation ?? false}
                  onChange={(e) =>
                    handleToggleAllowDragRelation(e.target.checked)
                  }
                />
                <div
                  className="text-xs"
                  style={{ color: "var(--mui-palette-text-secondary)" }}
                >
                  开启后可以拖动节点管理对象关系
                </div>
              </div>
            }
          />
          <FormItem
            label="名称"
            content={
              <div>
                {currentObject && (
                  <Input
                    startAdornment={
                      <InputAdornment position="start">
                        <AccountCircle />
                      </InputAdornment>
                    }
                    value={currentObject?.name}
                    onChange={(e) =>
                      handleObjectNameChange(currentObjectId, e.target.value)
                    }
                  />
                )}
              </div>
            }
          />
          <FormItem
            label="对象关系"
            content={
              <div>
                {relations.map((item, idx) => {
                  return (
                    <div key={idx}>
                      {item.origin} {item.type} {item.to}
                    </div>
                  );
                })}
              </div>
            }
          />
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
            label="删除操作"
            content={
              <div>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleDelete(currentObjectId)}
                  color="error"
                  disabled={currentObject?.type === ContainerObjectType.diagram}
                >
                  删除
                </Button>
              </div>
            }
          />
        </div>
      }
    />
  );
}
