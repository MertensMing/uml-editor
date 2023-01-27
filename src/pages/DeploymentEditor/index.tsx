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
import { useDrag } from "../../shared/hooks/useDrag";
import {
  ContainerObjectType,
  Deployment,
  findObject,
} from "../../core/entities/Deployment";
import {
  Button,
  ButtonGroup,
  Input,
  MenuItem,
  Select,
  Switch,
} from "@mui/material";
import { useDebounceCallback } from "@react-hook/debounce";
import { ColorPicker } from "./components/ColorPicker";
import { createUndoStore } from "../../shared/store/undo";

export function DeploymentEditor() {
  const deploymentStore = useRef(createDeploymentStore()).current;
  const undoStore = useRef(createUndoStore<Deployment>()).current;
  const { allowRedo, allowUndo } = useStore(
    undoStore,
    (state) => ({
      allowUndo: state.undoIndex < state.queue.length - 1,
      allowRedo: state.undoIndex !== 0,
    }),
    shallow
  );
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
    handleRelationChange,
    handleUndo,
    handleRedo,
  } = useEditDeploymentLogic([deploymentStore, undoStore]);
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
  const relations = deployment?.relations?.[currentObjectId] ?? [];
  const isRoot = currentObject?.type === ContainerObjectType.diagram;

  const dragElementRef = useRef<HTMLDivElement>();

  const boundHandleDiagramChange = useDebounceCallback(
    handleDiagramChange,
    600
  );

  useDrag("deployment-diagram", handleDrop);

  useEffect(() => {
    handleInit();
  }, []);

  useEffect(() => {
    boundHandleDiagramChange();
  }, [deployment]);

  return (
    <EditorLayout
      currentDiagram="deployment"
      uml={uml}
      pngUrl={pngUrl}
      svgUrl={svgUrl}
      diagram={
        <div>
          <div ref={dragElementRef} />
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
            label="图表操作"
            content={
              <ButtonGroup size="small">
                <Button disabled={!allowUndo} onClick={handleUndo}>
                  撤销
                </Button>
                <Button disabled={!allowRedo} onClick={handleRedo}>
                  恢复
                </Button>
              </ButtonGroup>
            }
          />
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
                <div className="text-gray text-xs">
                  {allowDragRelation
                    ? "拖动节点新增对象关系"
                    : "拖动节点修改对象层级"}
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
                    <span className="mr-3 text-gray text-xs">背景</span>{" "}
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
                onClick={(type) =>
                  handleAddContainer(deployment?.root?.id, type)
                }
              />
            }
          />
          <FormItem
            label="添加图形"
            content={
              <AddObject
                onClick={(type) => handleAddObject(deployment?.root?.id, type)}
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
                      <div className="pb-5 pt-2" key={idx}>
                        <div className="flex justify-between items-center pb-2">
                          <div className="flex">
                            <div className="flex text-sm items-center mr-4">
                              <span className="mr-3 text-gray text-xs">
                                连线
                              </span>{" "}
                              <ColorPicker
                                color={item.linkColor}
                                onChange={(color) => {
                                  handleRelationChange(
                                    currentObjectId,
                                    item.id,
                                    "linkColor",
                                    color
                                  );
                                }}
                              />
                            </div>
                            <div className="flex text-sm items-center">
                              <span className="mr-3 text-gray text-xs">
                                文字
                              </span>{" "}
                              <ColorPicker
                                color={item.descColor}
                                onChange={(color) => {
                                  handleRelationChange(
                                    currentObjectId,
                                    item.id,
                                    "descColor",
                                    color
                                  );
                                }}
                              />
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
                          <span className="mr-3 text-gray text-xs">类型</span>
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
                          <span className="mr-3 text-gray text-xs">方向</span>
                          <div className="-m-2">
                            <Select
                              value={item.linkDirection || "-"}
                              variant="standard"
                              sx={{ m: 1, minWidth: 120 }}
                              onChange={(e) => {
                                handleRelationChange(
                                  currentObjectId,
                                  item.id,
                                  "linkDirection",
                                  (e.target.value === "-"
                                    ? ""
                                    : e.target.value) as any
                                );
                              }}
                            >
                              <MenuItem value={"up"}>上</MenuItem>
                              <MenuItem value={"down"}>下</MenuItem>
                              <MenuItem value={"left"}>左</MenuItem>
                              <MenuItem value={"right"}>右</MenuItem>
                              <MenuItem value={"-"}>自动</MenuItem>
                            </Select>
                          </div>
                        </div>
                        <div className="flex text-sm items-center pb-1">
                          <span className="mr-3 text-gray text-xs">描述</span>{" "}
                          <Input
                            value={item.name}
                            onChange={(e) =>
                              handleRelationChange(
                                currentObjectId,
                                item.id,
                                "name",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="flex text-sm items-center pb-1">
                          <span className="mr-3 text-gray text-xs">目标</span>{" "}
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
