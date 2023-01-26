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
  ObjectType,
} from "../../core/entities/Deployment";
import { Button, Input, MenuItem, Select, Switch } from "@mui/material";
import { useDebounceCallback } from "@react-hook/debounce";
import { ColorPicker } from "./components/ColorPicker";

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
    handleDeleteRelation,
    handleSelectObjectBgColor,
    // handleSelectObjectTextColor,
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
  const isRoot = currentObject?.type === ContainerObjectType.diagram;

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
                    value={currentObject?.name}
                    onChange={(e) =>
                      handleObjectNameChange(currentObjectId, e.target.value)
                    }
                  />
                )}
              </div>
            }
          />
          {!isRoot && (
            <FormItem
              label="颜色"
              content={
                <div className="flex">
                  <div className="flex text-sm items-center mr-8">
                    <span className="mr-3">背景</span>{" "}
                    <ColorPicker
                      color={currentObject?.bgColor}
                      onChange={(color) =>
                        handleSelectObjectBgColor(currentObjectId, color)
                      }
                    />
                  </div>
                  {/* <div className="flex text-sm items-center">
                    <span className="mr-3">文字</span>{" "}
                    <ColorPicker
                      color={currentObject?.textColor}
                      onChange={(color) =>
                        handleSelectObjectTextColor(currentObjectId, color)
                      }
                    />
                  </div> */}
                </div>
              }
            />
          )}
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
          {relations?.length > 0 && (
            <FormItem
              label="对象关系"
              content={
                <div className="-mb-5">
                  {relations.map((item, idx) => {
                    const to = findObject(deployment.root, item.to);
                    return (
                      <div className="pb-5" key={idx}>
                        <div className="flex justify-between items-center pb-1">
                          <div className="flex">
                            <div className="flex text-sm items-center mr-8">
                              <span className="mr-3">连线</span>{" "}
                              <ColorPicker color={item.linkColor} />
                            </div>
                            <div className="flex text-sm items-center">
                              <span className="mr-3">文字</span>{" "}
                              <ColorPicker color={item.descColor} />
                            </div>
                          </div>
                          <div
                            onClick={() =>
                              handleDeleteRelation(item.origin, item.to)
                            }
                            className="cursor-pointer text-red-500 hover:text-red-700 text-xs"
                          >
                            删除
                          </div>
                        </div>
                        <div className="flex text-sm items-center pb-1">
                          <span className="mr-3">类型</span>
                          <div className="-m-2">
                            <Select
                              value={item.type}
                              variant="standard"
                              sx={{ m: 1, minWidth: 120 }}
                            >
                              <MenuItem value={"dependency"}>依赖</MenuItem>
                            </Select>
                          </div>
                        </div>
                        <div className="flex text-sm items-center pb-1">
                          <span className="mr-3">描述</span>{" "}
                          <Input value={item.name} />
                        </div>
                        <div className="flex text-sm items-center pb-1">
                          <span className="mr-3">目标</span>{" "}
                          <Input disabled value={to?.name} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              }
            />
          )}
          <FormItem
            label="删除操作"
            content={
              <div>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleDelete(currentObjectId)}
                  color="error"
                  disabled={isRoot}
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
