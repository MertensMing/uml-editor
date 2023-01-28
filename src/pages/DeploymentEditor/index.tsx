/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import { ReactSVG } from "react-svg";
import { useStore } from "zustand";
import shallow from "zustand/shallow";
import { EditorLayout } from "../../shared/components/EditorLayout";
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
            {svgUrl && (
              <div>
                <ReactSVG src={svgUrl} />
              </div>
            )}
          </div>
        </div>
      }
      operation={
        <div>
          <div className="pb-8">
            <h3 className="pb-2 font-bold">图表操作</h3>
            <div className="space-x-1">
              <button
                className="btn btn-sm btn-outline"
                disabled={!allowUndo}
                onClick={handleUndo}
              >
                撤销
              </button>
              <button
                className="btn btn-sm btn-outline"
                disabled={!allowRedo}
                onClick={handleRedo}
              >
                恢复
              </button>
            </div>
          </div>
          <div className="pb-8">
            <h3 className="pb-2 font-bold">拖拽连线</h3>
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
          <div className="pb-8">
            <h3 className="pb-2 font-bold">名称</h3>
            <div>
              <div>
                {currentObject && (
                  <input
                    type="text"
                    className="input input-bordered w-full max-w-xs"
                    value={currentObject?.name}
                    onChange={(e) =>
                      handleObjectNameChange(currentObjectId, e.target.value)
                    }
                  />
                )}
              </div>
            </div>
          </div>
          {!isRoot && (
            <div className="pb-8">
              <h3 className="pb-2 font-bold">颜色</h3>
              <div>
                <div className="flex">
                  <div className="flex text-sm items-center mr-8">
                    <button className="btn btn-sm btn-outline">
                      <span className="mr-4">背景色</span>
                      <ColorPicker
                        color={currentObject?.bgColor || "#e5e7eb"}
                        onChange={(color) =>
                          handleSelectObjectBgColor(currentObjectId, color)
                        }
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="pb-8">
            <h3 className="pb-2 font-bold">添加容器</h3>
            <div>
              <AddContainer
                onClick={(type) =>
                  handleAddContainer(deployment?.root?.id, type)
                }
              />
            </div>
          </div>
          <div className="pb-8">
            <h3 className="pb-2 font-bold">添加图形</h3>
            <div>
              <AddObject
                onClick={(type) => handleAddObject(deployment?.root?.id, type)}
              />
            </div>
          </div>
          {relations?.length > 0 && (
            <div className="pb-8">
              <h3 className="pb-2 font-bold">对象关系</h3>
              <div className="-mb-5">
                {relations.map((item, idx) => {
                  const to = findObject(deployment.root, item.to);
                  return (
                    <div className="pb-5 pt-2" key={idx}>
                      <div>
                        <div className="form-control pb-2">
                          <label className="input-group input-group-sm">
                            <span>目标</span>
                            <input
                              type="text"
                              className="input input-bordered input-sm"
                              disabled
                              value={to?.name}
                            />
                          </label>
                        </div>
                        <div className="flex space-x-1 pb-2">
                          <button className="btn btn-sm btn-outline">
                            <span className="mr-4">连线颜色</span>
                            <ColorPicker
                              color={item.linkColor || "#000000"}
                              onChange={(color) => {
                                handleRelationChange(
                                  currentObjectId,
                                  item.id,
                                  "linkColor",
                                  color
                                );
                              }}
                            />
                          </button>
                          <button className="btn btn-sm btn-outline">
                            <span className="mr-4">文字颜色</span>
                            <ColorPicker
                              color={item.descColor || "#000000"}
                              onChange={(color) => {
                                handleRelationChange(
                                  currentObjectId,
                                  item.id,
                                  "descColor",
                                  color
                                );
                              }}
                            />
                          </button>
                        </div>
                        <div className="form-control pb-2">
                          <label className="input-group input-group-sm">
                            <span>描述</span>
                            <input
                              type="text"
                              className="input input-bordered input-sm"
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
                          </label>
                        </div>
                        <div className="form-control pb-2">
                          <label className="input-group input-group-sm">
                            <span>类型</span>
                            <select
                              value={item.type}
                              className="select select-bordered select-sm"
                            >
                              <option value={"dependency"}>依赖</option>
                            </select>
                          </label>
                        </div>
                        <div className="flex pb-2">
                          <div className="form-control">
                            <label className="input-group input-group-sm">
                              <span>方向</span>
                              <select
                                value={item.type}
                                className="select select-bordered select-sm"
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
                                <option value={"up"}>上</option>
                                <option value={"down"}>下</option>
                                <option value={"left"}>左</option>
                                <option value={"right"}>右</option>
                                <option value={"-"}>自动</option>
                              </select>
                            </label>
                          </div>
                          <button
                            onClick={() =>
                              handleDeleteRelation(item.origin, item.to)
                            }
                            className="btn btn-outline btn-error btn-sm ml-1"
                          >
                            删除
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="pb-8">
            <h3 className="pb-2 font-bold">删除操作</h3>
            <div>
              <button
                onClick={() => handleDelete(currentObjectId)}
                className="btn btn-outline btn-error btn-sm"
              >
                移除对象
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      }
    />
  );
}
