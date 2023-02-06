import { ReactSVG } from "react-svg";
import { useStore } from "zustand";
import shallow from "zustand/shallow";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useDebounceCallback } from "@react-hook/debounce";
import { createActivityStore } from "./store/activity";
import { useEditActivityController } from "./controller/useEditActivityController";
import { Activity, findTask, TaskType } from "../../core/entities/Activity";
import { AddTaskType } from "./components/TaskTypeButtonGroup";
import { TYPE_MAP } from "./const";
import { ListOperation } from "./components/ListOperation";
import { activityStorage } from "../../shared/storage/activity";
import { createUndoStore } from "../../shared/store/undo";
import { EditorLayout } from "../../shared/components/EditorLayout";
import { pick } from "../../shared/utils/pick";
import { useDrag } from "../../shared/hooks/useDrag";
import classNames from "classnames";
import { listStore } from "../../shared/store/listStore";
import { useParams } from "react-router-dom";
import { Dropdown, MenuProps, message, Tooltip } from "antd";
import {
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import copy from "copy-to-clipboard";

export function Editor() {
  const activityStore = useRef(
    createActivityStore(activityStorage.get())
  ).current;
  const { url, activity, pngUrl, uml, currentTask } = useStore(
    activityStore,
    (state) => ({
      ...pick(state, ["activity", "url", "pngUrl", "uml"]),
      currentTask:
        state.activity?.start &&
        findTask(state.activity?.start, state.currentTask?.id),
    }),
    shallow
  );
  const undoStore = useRef(createUndoStore<Activity>()).current;
  const { allowRedo, allowUndo } = useStore(
    undoStore,
    (state) => ({
      allowUndo: state.undoIndex < state.queue.length - 1,
      allowRedo: state.undoIndex !== 0,
    }),
    shallow
  );

  const params = useParams();

  const {
    // init
    handleMount,
    // activity
    handleActivityChange,
    handleRedo,
    handleUndo,
    handleAddActivity,
    handleTitleChange,
    handleDeleteDiagram,
    // task
    handleAddTask,
    handleDeleteTask,
    handleSelectTask,
    handleTaskNameChange,
    handleTaskChange,
    handleMove,
    // switch
    handleAddCondition,
    handleDeleteCondition,
    handleConditionTextChange,
    // while
    handleWhileConditionChange,
    // parallel
    handleAddParallelTask,
    handleDeleteParallelTask,
  } = useEditActivityController([activityStore, undoStore, listStore]);

  const boundHandleActivityChange = useDebounceCallback(
    handleActivityChange,
    500
  );

  useDrag(
    "process-diagram",
    (origin, target) => {
      handleMove(origin, target);
    },
    (objectId) => handleSelectTask(objectId)
  );

  useLayoutEffect(() => {
    handleMount();
  }, [params.id]);

  useEffect(() => {
    boundHandleActivityChange();
  }, [activity]);

  return (
    <EditorLayout
      uml={uml}
      pngUrl={pngUrl}
      svgUrl={url}
      currentDiagram="activity"
      onAdd={(name) => handleAddActivity(name)}
      onDelete={handleDeleteDiagram}
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

          <AddTaskType
            group={[
              TaskType.normal,
              TaskType.switch,
              TaskType.parallel,
              TaskType.while,
              TaskType.stop,
            ]}
            onClick={(type) =>
              currentTask && handleAddTask(currentTask.id, type)
            }
          />

          <Dropdown
            menu={{
              items: [
                {
                  label: (
                    <div
                      onClick={() => {
                        currentTask && handleDeleteTask(currentTask.id);
                      }}
                    >
                      删除当前节点
                    </div>
                  ),
                  key: "1",
                },
                currentTask && currentTask?.next?.type === TaskType.stop
                  ? {
                      label: (
                        <div
                          onClick={() => handleDeleteTask(currentTask.next.id)}
                        >
                          删除下级结束节点
                        </div>
                      ),
                      key: "2",
                    }
                  : null,
              ] as MenuProps["items"],
            }}
            trigger={["hover"]}
          >
            <DeleteOutlined
              className={classNames(
                "cursor-pointer text-gray-500 hover:text-gray-900",
                {
                  "opacity-30": false,
                }
              )}
            />
          </Dropdown>

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
                    <a href={url} target="_blank">
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
      diagram={
        <div
          className={classNames("process")}
          id="process-diagram"
          onClick={(e: any) => {
            if (
              e.target.nodeName === "ellipse" &&
              e.target.parentNode.nodeName === "g" &&
              e.target.parentNode.firstChild === e.target
            ) {
              handleSelectTask(activity.start.id);
            } else if (e.target?.attributes?.taskId?.value) {
              handleSelectTask(e.target?.attributes?.taskId?.value);
            }
          }}
        >
          <div className="p-4">
            <div>{activity && <ReactSVG src={url} />}</div>
          </div>
        </div>
      }
      operation={
        <div>
          {currentTask && (
            <>
              <div>
                <div className="pb-2 font-bold text-sm">图表标题</div>
                <div className="space-x-1">
                  <input
                    type="text"
                    value={activity.title}
                    className="input input-bordered input-sm w-full"
                    onChange={(e) => {
                      handleTitleChange(e.target.value);
                    }}
                  />
                </div>
              </div>

              {/* 类型 */}
              <div className="pt-8">
                <div className="pb-2 font-bold text-sm">节点类型</div>
                <div className="space-x-1">
                  <input
                    type="text"
                    value={TYPE_MAP[currentTask.type]}
                    className="input input-bordered input-sm w-full"
                    disabled
                  />
                </div>
              </div>

              {/* 名称 */}
              {currentTask.type !== TaskType.start && (
                <div className="pt-8">
                  <h3 className="pb-2 font-bold text-sm">名称</h3>
                  <div className="space-x-1">
                    <input
                      type="text"
                      value={currentTask.name}
                      className="input input-bordered input-sm"
                      onChange={(e) => {
                        handleTaskNameChange(currentTask.id, e.target.value);
                      }}
                    />
                  </div>
                </div>
              )}

              {/* 注释 */}
              {currentTask.type === TaskType.normal && (
                <div className="pt-8">
                  <h3 className="pb-2 text-sm font-bold flex items-center">
                    注释{" "}
                    <select
                      value={currentTask?.comment?.direction || "right"}
                      className="select select-bordered select-xs ml-3"
                      onChange={(e) => {
                        handleTaskChange(currentTask?.id, "comment", {
                          direction: e.target.value,
                          content: currentTask?.comment?.content,
                        });
                      }}
                    >
                      <option value={"right"}>右</option>
                      <option value={"left"}>左</option>
                    </select>
                  </h3>
                  <textarea
                    className="textarea textarea-bordered leading-4 scrollbar-thin scrollbar-thumb-slate-300"
                    value={currentTask?.comment?.content || ""}
                    onChange={(e) => {
                      handleTaskChange(currentTask?.id, "comment", {
                        direction: currentTask?.comment?.direction || "right",
                        content: e.target.value,
                      });
                    }}
                    rows={10}
                  />
                </div>
              )}

              {currentTask.type === TaskType.while ? (
                <div className="pt-8">
                  <h3 className="pb-2 font-bold text-sm">循环条件</h3>
                  <div>
                    <div className="form-control pb-2">
                      <label className="input-group input-group-sm">
                        <span>循环条件</span>
                        <input
                          type="text"
                          className="input input-bordered input-sm"
                          onChange={(e) =>
                            handleWhileConditionChange(
                              currentTask.id,
                              e.target.value,
                              currentTask.condition?.no ?? ""
                            )
                          }
                          value={currentTask?.condition?.yes}
                          placeholder="是"
                        />
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="input-group input-group-sm">
                        <span>退出条件</span>
                        <input
                          type="text"
                          className="input input-bordered input-sm"
                          value={currentTask?.condition?.no}
                          onChange={(e) =>
                            handleWhileConditionChange(
                              currentTask.id,
                              currentTask.condition?.yes ?? "",
                              e.target.value
                            )
                          }
                          placeholder="否"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ) : null}

              {currentTask.type === TaskType.parallel ? (
                <div>
                  <div className="pt-8">
                    <h3 className="pb-2 font-bold text-sm">并行任务</h3>
                    <div className="space-x-1">
                      <ListOperation
                        allowDelete={currentTask.parallel.length > 2}
                        allowEdit={false}
                        values={currentTask.parallel.map(
                          (item, index) => `任务 ${index + 1}（${item.name}）`
                        )}
                        onDelete={(index) =>
                          handleDeleteParallelTask(currentTask.id, index)
                        }
                      />
                    </div>
                  </div>
                  <div className="pt-8">
                    <h3 className="pb-2 font-bold text-sm flex items-center">
                      添加并行任务{" "}
                      <div className="ml-1">
                        <AddTaskType
                          group={[
                            TaskType.normal,
                            TaskType.switch,
                            TaskType.parallel,
                            TaskType.while,
                          ]}
                          onClick={(type) =>
                            handleAddParallelTask(currentTask.id, type)
                          }
                        />
                      </div>
                    </h3>
                  </div>
                </div>
              ) : null}

              {currentTask.type === TaskType.switch ? (
                <div>
                  <div className="pt-8">
                    <h3 className="pb-2 font-bold text-sm flex items-center">
                      添加条件{" "}
                      <div className="ml-1">
                        <AddTaskType
                          group={[
                            TaskType.normal,
                            TaskType.switch,
                            TaskType.parallel,
                            TaskType.while,
                            TaskType.stop,
                          ]}
                          onClick={(type) =>
                            handleAddCondition(currentTask.id, type)
                          }
                        />
                      </div>
                    </h3>
                  </div>
                  <div className="pt-8">
                    <h3 className="pb-2 font-bold text-sm">编辑条件</h3>
                    <div className="space-x-1">
                      <ListOperation
                        allowDelete={currentTask.cases.length > 1}
                        allowEdit
                        values={currentTask.cases.map((item) => item.condition)}
                        onDelete={(index) =>
                          handleDeleteCondition(currentTask.id, index)
                        }
                        onChange={(text, index) => {
                          handleConditionTextChange(
                            currentTask.id,
                            index,
                            text
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      }
    />
  );
}
