import { useEffect, useRef } from "react";
import { ReactSVG } from "react-svg";
import { useStore } from "zustand";
import shallow from "zustand/shallow";
import {
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import classNames from "classnames";
import copy from "copy-to-clipboard";
import { Dropdown, message, Tooltip } from "antd";
import type { MenuProps } from "antd";
import { useDebounceCallback } from "@react-hook/debounce";
import { useParams } from "react-router-dom";
import { EditorLayout } from "../../shared/components/EditorLayout";
import { pick } from "../../shared/utils/pick";
import { AddContainer } from "./components/AddContainer";
import { AddObject } from "./components/AddObject";
import { useEditDeploymentController } from "./controller/useEditDeploymentController";
import { createDeploymentStore } from "./store/deploymentStore";
import { useDrag } from "../../shared/hooks/useDrag";
import {
  ContainerObjectType,
  DEFAULT_NAME,
  Deployment,
  findObject,
  LineType,
  ObjectType,
  RelationType,
} from "../../core/entities/Deployment";
import { ColorPicker } from "./components/ColorPicker";
import { createUndoStore } from "../../shared/store/undo";
import { listStore } from "../../shared/store/listStore";

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
    handleContentChange,
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
  const relations = deployment?.relations?.[currentObjectId] ?? [];
  const isRoot = currentObject?.type === ContainerObjectType.diagram;

  const dragElementRef = useRef<HTMLDivElement>();

  const { id } = useParams();

  const boundHandleDiagramChange = useDebounceCallback(
    handleDiagramChange,
    500
  );

  useDrag("deployment-diagram", handleDrop);

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
              } else if (
                e.target.nodeName === "text" &&
                `${e.target.parentNode.id}`.startsWith("elem_object")
              ) {
                handleObjectSelect(e.target.parentNode.id.replace("elem_", ""));
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
          {currentObject &&
            !currentObject.isContainer &&
            currentObject.type === ObjectType.json && (
              <div className="pt-8">
                <h3 className="pb-2 text-sm font-bold">内容</h3>
                <textarea
                  className="textarea textarea-bordered leading-4 scrollbar-thin scrollbar-thumb-slate-300"
                  value={currentObject.content || ""}
                  onChange={(e) => {
                    handleContentChange(currentObjectId, e.target.value);
                  }}
                  rows={10}
                />
              </div>
            )}
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
          <Tooltip title="撤销">
            <LeftOutlined
              className={classNames(
                "cursor-pointer text-gray-500 hover:text-gray-900",
                {
                  "opacity-30": !allowUndo,
                }
              )}
              disabled={!allowUndo}
              onClick={allowUndo && handleUndo}
            />
          </Tooltip>

          <Tooltip title="恢复">
            <RightOutlined
              className={classNames(
                "cursor-pointer text-gray-500 hover:text-gray-900",
                {
                  "opacity-30": !allowRedo,
                }
              )}
              onClick={allowRedo && handleRedo}
            />
          </Tooltip>

          <Tooltip title="删除对象">
            <DeleteOutlined
              onClick={() => !isRoot && handleDelete(currentObjectId)}
              className={classNames(
                "cursor-pointer text-gray-500 hover:text-gray-900",
                {
                  "opacity-30": isRoot,
                }
              )}
            />
          </Tooltip>

          <Tooltip title="复制 PlantUML">
            <CopyOutlined
              className={classNames(
                "cursor-pointer text-gray-500 hover:text-gray-900",
                {}
              )}
              onClick={() => {
                copy(uml);
                message.success("复制成功");
              }}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                {
                  label: (
                    <a href={pngUrl} target="_blank">
                      PNG
                    </a>
                  ),
                  key: "1",
                },
                {
                  label: (
                    <a href={svgUrl} target="_blank">
                      SVG
                    </a>
                  ),
                  key: "2",
                },
              ] as MenuProps["items"],
            }}
            trigger={["hover"]}
          >
            <DownloadOutlined
              className={classNames(
                "cursor-pointer text-gray-500 hover:text-gray-900",
                {}
              )}
            />
          </Dropdown>
        </>
      }
    />
  );
}
