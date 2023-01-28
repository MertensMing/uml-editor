/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react-hooks/exhaustive-deps */
import { ReactSVG } from "react-svg";
import { useStore } from "zustand";
import shallow from "zustand/shallow";
import { useEffect, useLayoutEffect, useRef } from "react";
import Input from "@mui/material/Input";
import { useDebounceCallback } from "@react-hook/debounce";
import { createActivityStore } from "./store/activity";
import { useEditActivityLogic } from "./logic/useEditActivityLogic";
import { Activity, findTask, TaskType } from "../../core/entities/Activity";
import { TaskTypeButtonGroup } from "./components/TaskTypeButtonGroup";
import { TYPE_MAP } from "./const";
import { FormItem } from "../../shared/components/FormItem";
import { ListOperation } from "./components/ListOperation";
import { activityStorage } from "../../shared/storage/activity";
import { createUndoStore } from "../../shared/store/undo";
import { EditorLayout } from "../../shared/components/EditorLayout";
import { pick } from "../../shared/utils/pick";
import { useDrag } from "../../shared/hooks/useDrag";

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

  const {
    // init
    handleMount,
    // activity
    handleActivityChange,
    handleRedo,
    handleUndo,
    // task
    handleAddTask,
    handleDeleteTask,
    handleSelectTask,
    handleTaskNameChange,
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
  } = useEditActivityLogic([activityStore, undoStore]);

  const boundHandleActivityChange = useDebounceCallback(
    handleActivityChange,
    500
  );

  useDrag("process-diagram", (origin, target) => {
    handleMove(origin, target);
  });

  useLayoutEffect(() => {
    handleMount();
  }, []);

  useEffect(() => {
    boundHandleActivityChange();
  }, [activity]);

  return (
    <EditorLayout
      uml={uml}
      pngUrl={pngUrl}
      svgUrl={url}
      currentDiagram="activity"
      diagram={
        <div
          className="process"
          id="process-diagram"
          style={{
            touchAction: "none",
          }}
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
        <>
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
          {currentTask && (
            <>
              {/* 节点类型 */}
              <div className="pb-8">
                <h3 className="pb-2 font-bold">节点类型</h3>
                <div className="space-x-1">
                  <input
                    type="text"
                    value={TYPE_MAP[currentTask.type]}
                    className="input input-bordered input-sm w-full max-w-xs"
                    disabled
                  />
                </div>
              </div>

              {/* 节点名称 */}
              {currentTask.type !== TaskType.start && (
                <div className="pb-8">
                  <h3 className="pb-2 font-bold">节点名称</h3>
                  <div className="space-x-1">
                    <input
                      type="text"
                      value={currentTask.name}
                      className="input input-bordered input-sm w-full max-w-xs"
                      onChange={(e) => {
                        handleTaskNameChange(currentTask.id, e.target.value);
                      }}
                    />
                  </div>
                </div>
              )}

              {/* 添加节点 */}
              <div className="pb-8">
                <h3 className="pb-2 font-bold">添加节点</h3>
                <div className="space-x-1">
                  <TaskTypeButtonGroup
                    group={[
                      TaskType.normal,
                      TaskType.switch,
                      TaskType.parallel,
                      TaskType.while,
                      TaskType.stop,
                    ]}
                    onClick={(type) => handleAddTask(currentTask.id, type)}
                  />
                </div>
              </div>

              {/* 删除操作 */}
              <div className="pb-8">
                <h3 className="pb-2 font-bold">删除操作</h3>
                <div className="space-x-1">
                  <button
                    onClick={() => {
                      handleDeleteTask(currentTask.id);
                    }}
                    className="btn btn-outline btn-error btn-sm"
                  >
                    删除节点
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
                  {currentTask.next?.type === TaskType.stop && (
                    <button
                      onClick={() => {
                        handleDeleteTask(currentTask.next.id);
                      }}
                      className="btn btn-outline btn-error btn-sm"
                    >
                      删除下级结束点
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
                  )}
                </div>
              </div>

              {currentTask.type === TaskType.while ? (
                <div className="pb-8">
                  <h3 className="pb-2 font-bold">循环条件</h3>
                  <div>
                    <div className="form-control pb-2">
                      <label className="input-group input-group-sm">
                        <span>循环条件</span>
                        <input
                          className="input input-bordered input-sm"
                          value={currentTask?.condition?.yes}
                          onChange={(e) =>
                            handleWhileConditionChange(
                              currentTask.id,
                              e.target.value,
                              currentTask.condition?.no ?? ""
                            )
                          }
                          placeholder="是"
                        />
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="input-group input-group-sm">
                        <span>退出条件</span>
                        <input
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
                  <div className="pb-8">
                    <h3 className="pb-2 font-bold">并行任务</h3>
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

                  <div className="pb-8">
                    <h3 className="pb-2 font-bold">添加并行任务</h3>
                    <div className="space-x-1">
                      <TaskTypeButtonGroup
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
                  </div>
                </div>
              ) : null}

              {currentTask.type === TaskType.switch ? (
                <div>
                  <div className="pb-8">
                    <h3 className="pb-2 font-bold">编辑条件</h3>
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

                  <div className="pb-8">
                    <h3 className="pb-2 font-bold">添加条件</h3>
                    <div className="space-x-1">
                      <TaskTypeButtonGroup
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
                  </div>
                </div>
              ) : null}
            </>
          )}
        </>
      }
    />
  );
}
