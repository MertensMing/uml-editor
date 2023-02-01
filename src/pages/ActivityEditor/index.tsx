import { ReactSVG } from "react-svg";
import { useStore } from "zustand";
import shallow from "zustand/shallow";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useDebounceCallback } from "@react-hook/debounce";
import { createActivityStore } from "./store/activity";
import { useEditActivityLogic } from "./logic/useEditActivityLogic";
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

  useDrag(
    "process-diagram",
    (origin, target) => {
      handleMove(origin, target);
    },
    (objectId) => handleSelectTask(objectId)
  );

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
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className=" w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
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
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className=" w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"
              ></path>
            </svg>
          </button>
          <div className="dropdown dropdown-hover">
            <label tabIndex={0}>
              <button
                className="btn btn-xs btn-ghost relative top-0"
                style={{
                  marginTop: "3.5px",
                }}
              >
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className=" w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  ></path>
                </svg>
              </button>
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-36"
            >
              <li>
                <a
                  onClick={() => {
                    currentTask && handleDeleteTask(currentTask.id);
                  }}
                >
                  当前节点
                </a>
              </li>
              {currentTask && currentTask?.next?.type === TaskType.stop && (
                <li onClick={() => handleDeleteTask(currentTask.next.id)}>
                  <a>下级结束节点</a>
                </li>
              )}
            </ul>
          </div>
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
              {/* 类型 */}
              <div>
                <div className="pb-2 font-bold text-sm">类型</div>
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
