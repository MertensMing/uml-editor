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
  LineType,
  RelationType,
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
    handleLineTypeChange,
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
        <div
          style={{
            paddingTop: "16px",
          }}
        >
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
                {currentObject && (
                  <input
                    type="text"
                    className="input input-bordered w-full input-sm"
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
            <div className="pt-8">
              <h3 className="pb-2 text-sm font-bold flex items-center">
                背景色
              </h3>
              <button className="btn btn-outline btn-sm">
                <ColorPicker
                  color={currentObject?.bgColor || "#e5e7eb"}
                  onChange={(color) =>
                    handleSelectObjectBgColor(currentObjectId, color)
                  }
                />
              </button>
            </div>
          )}
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
          {relations?.length > 0 && (
            <div className="pt-8">
              <h3 className="pb-2 text-sm font-bold">对象关系</h3>
              <div className="-mb-5">
                {relations.map((item, idx) => {
                  const to = findObject(deployment.root, item.to);
                  return (
                    <div className="pb-5 pt-2" key={idx}>
                      <div>
                        <div className="flex space-x-1 pb-2">
                          <button className="btn btn-xs btn-ghost">
                            <span className="mr-4">连线</span>
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
                          <button className="btn btn-xs btn-ghost">
                            <span className="mr-4">文字</span>
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
                            <span>目标</span>
                            <span className="bg-slate-50">{to?.name}</span>
                          </label>
                        </div>
                        <div className="form-control pb-2">
                          <label className="input-group input-group-xs">
                            <span>描述</span>
                            <input
                              type="text"
                              className="input input-bordered input-xs w-36"
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
                          <label className="input-group input-group-xs">
                            <span>类型</span>
                            <select
                              value={item.type}
                              className="select select-bordered select-xs"
                              onChange={(e) => {
                                handleRelationChange(
                                  currentObjectId,
                                  item.id,
                                  "type",
                                  e.target.value as RelationType
                                );
                              }}
                            >
                              <option value={RelationType.dependency}>
                                依赖
                              </option>
                              <option value={RelationType.association}>
                                关联
                              </option>
                              <option value={RelationType.composition}>
                                组合
                              </option>
                              <option value={RelationType.aggregation}>
                                聚合
                              </option>
                              <option value={RelationType.realize}>实现</option>
                              <option value={RelationType.generalization}>
                                继承
                              </option>
                            </select>
                          </label>
                        </div>
                        <div className="flex pb-2">
                          <div className="form-control">
                            <label className="input-group input-group-xs">
                              <span>方向</span>
                              <select
                                value={item.linkDirection}
                                className="select select-bordered select-xs"
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
                            className="btn btn-ghost btn-error btn-xs ml-1"
                          >
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
        </div>
      }
      toolbar={
        <>
          <button
            className="btn btn-xs btn-ghost"
            disabled={!allowUndo}
            onClick={handleUndo}
          >
            <svg
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className=" w-4 h-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
              ></path>
            </svg>
          </button>
          <button
            className="btn btn-xs btn-ghost"
            disabled={!allowRedo}
            onClick={handleRedo}
          >
            <svg
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className=" w-4 h-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"
              ></path>
            </svg>
          </button>
          <button
            className="btn btn-xs btn-ghost"
            onClick={() => handleDelete(currentObjectId)}
          >
            <svg
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className=" w-4 h-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              ></path>
            </svg>
          </button>
        </>
      }
    />
  );
}
