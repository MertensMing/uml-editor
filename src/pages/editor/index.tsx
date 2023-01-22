/* eslint-disable react-hooks/exhaustive-deps */
import { ReactSVG } from "react-svg";
import { useStore } from "zustand";
import shallow from "zustand/shallow";
import { useEffect, useLayoutEffect, useRef } from "react";
import cx from "classnames";
import RotateLeftOutlinedIcon from "@mui/icons-material/RotateLeftOutlined";
import RotateRightOutlinedIcon from "@mui/icons-material/RotateRightOutlined";
import { createActivityStore } from "./store/activity";
import { useEditActivityLogic } from "./logic/useEditActivityLogic";
import { Activity, TaskType } from "../../entities/Activity";

export function Editor() {
  const activityStore = useRef(
    createActivityStore(
      (JSON.parse(window.localStorage.getItem("my_activity")) as Activity) ??
        undefined
    )
  ).current;
  const { currentTask, url, activity, allowRedo, allowUndo } = useStore(
    activityStore,
    ({ currentTask, url, activity, undoIndex, operationQueue }) => ({
      currentTask,
      url,
      activity,
      allowUndo: undoIndex < operationQueue.length - 1,
      allowRedo: undoIndex !== 0,
    }),
    shallow
  );
  const {
    // init
    handleMount,
    // activity
    handleTitleChange,
    handleActivityChange,
    handleRedo,
    handleUndo,
    // task
    handleAddTask,
    handleDeleteTask,
    handleSelectTask,
    handleTaskNameChange,
    handleTaskSwimLaneChange,
    // switch
    handleAddCondition,
    handleDeleteCondition,
    // while
    handleToggleInfiniteLoop,
    // parallel
    handleAddParallelTask,
    handleDeleteParallelTask,
  } = useEditActivityLogic([activityStore]);

  useLayoutEffect(() => {
    handleMount();
  }, []);

  useEffect(() => {
    handleActivityChange();
  }, [activity]);

  return (
    <div className="flex flex-col">
      <div className="flex p-4 items-center">
        <div className="bg-gray-700 text-white px-4 py-2 rounded">UML</div>
        <div className="ml-4">PlantUML Editor</div>
      </div>
      <div className="text-gray-700 flex items-center px-4">
        <div onClick={() => allowUndo && handleUndo()} className="flex">
          <RotateLeftOutlinedIcon
            className={cx({
              "text-gray-500": !allowUndo,
              "hover:text-gray-900 cursor-pointer": allowUndo,
            })}
          />
        </div>
        <div onClick={() => allowRedo && handleRedo()} className="flex">
          <RotateRightOutlinedIcon
            className={cx({
              "text-gray-500": !allowRedo,
              "hover:text-gray-900 cursor-pointer": allowRedo,
            })}
          />
        </div>
      </div>
      <div className="flex">
        <div className="px-4 py-2">
          <div>
            <div>图表名称</div>
            <input
              value={activity.title}
              onChange={(e) => {
                handleTitleChange(e.target.value);
              }}
            />
          </div>
          {currentTask && (
            <div>
              <div>
                <div>节点名称</div>
                <input
                  value={currentTask.name}
                  onChange={(e) => {
                    handleTaskNameChange(currentTask.id, e.target.value);
                  }}
                />
              </div>
              <div>
                <div>新增节点</div>
                <button onClick={() => handleAddTask(currentTask.id)}>
                  + 普通流程
                </button>
                <button
                  onClick={() => handleAddTask(currentTask.id, TaskType.switch)}
                >
                  + 条件判断
                </button>
                <button
                  onClick={() =>
                    handleAddTask(currentTask.id, TaskType.parallel)
                  }
                >
                  + 并行
                </button>
                <button
                  onClick={() => handleAddTask(currentTask.id, TaskType.while)}
                >
                  + 循环
                </button>
                <button
                  onClick={() => handleAddTask(currentTask.id, TaskType.stop)}
                >
                  + 结束
                </button>
              </div>
              {!!activity?.swimlanes?.length && (
                <div>
                  <div>节点泳道</div>
                  <select
                    onChange={(e) => {
                      handleTaskSwimLaneChange(currentTask.id, e.target.value);
                    }}
                    value={currentTask.swimlane ?? ""}
                  >
                    <option key={"number"} value={""}>
                      未选择
                    </option>
                    {activity?.swimlanes?.map((item, index) => (
                      <option key={index} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {currentTask.type === TaskType.while ? (
                <div>
                  <div>死循环</div>
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      handleToggleInfiniteLoop(currentTask.id, e.target.checked)
                    }
                  />
                </div>
              ) : null}
              {currentTask.type === TaskType.parallel ? (
                <div>
                  并行任务：
                  {currentTask.parallel.map((item, index) => (
                    <span key={item.id}>
                      {`并行任务 ${index + 1}（${item.name}）`}
                      {currentTask.parallel.length > 2 && (
                        <button
                          onClick={() =>
                            handleDeleteParallelTask(currentTask.id, index)
                          }
                        >
                          x
                        </button>
                      )}
                    </span>
                  ))}
                  <div>
                    <div>
                      + 新增并行任务：
                      <div>
                        <button
                          onClick={() =>
                            handleAddParallelTask(
                              currentTask.id,
                              TaskType.normal
                            )
                          }
                        >
                          + 普通流程
                        </button>
                        <button
                          onClick={() =>
                            handleAddParallelTask(
                              currentTask.id,
                              TaskType.switch
                            )
                          }
                        >
                          + 条件判断
                        </button>
                        <button
                          onClick={() =>
                            handleAddParallelTask(
                              currentTask.id,
                              TaskType.while
                            )
                          }
                        >
                          + 循环
                        </button>
                        <button
                          onClick={() =>
                            handleAddParallelTask(
                              currentTask.id,
                              TaskType.parallel
                            )
                          }
                        >
                          + 并行
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
              {currentTask.type === TaskType.switch ? (
                <div>
                  <div>条件</div>
                  {currentTask.cases.map((item, index) => (
                    <div key={item.id}>
                      {item.condition}{" "}
                      {currentTask.cases.length > 2 ? (
                        <button
                          className="cursor-pointer"
                          onClick={() =>
                            handleDeleteCondition(currentTask.id, index)
                          }
                        >
                          x
                        </button>
                      ) : null}
                    </div>
                  ))}
                  <div>
                    <div>新增条件</div>
                    <button
                      onClick={() =>
                        handleAddCondition(currentTask.id, TaskType.normal)
                      }
                    >
                      + 普通流程
                    </button>
                    <button
                      onClick={() =>
                        handleAddCondition(currentTask.id, TaskType.switch)
                      }
                    >
                      + 条件判断
                    </button>
                    <button
                      onClick={() =>
                        handleAddCondition(currentTask.id, TaskType.while)
                      }
                    >
                      + 循环
                    </button>
                    <button
                      onClick={() =>
                        handleAddCondition(currentTask.id, TaskType.parallel)
                      }
                    >
                      + 并行
                    </button>
                    <button
                      onClick={() =>
                        handleAddCondition(currentTask.id, TaskType.stop)
                      }
                    >
                      + 结束
                    </button>
                  </div>
                </div>
              ) : null}
              <div>
                <div>操作</div>
                <div>
                  {currentTask.prev && (
                    <button
                      onClick={() => {
                        handleDeleteTask(currentTask.id);
                      }}
                    >
                      删除节点
                    </button>
                  )}
                  {currentTask.next?.type === TaskType.stop && (
                    <button
                      onClick={() => {
                        handleDeleteTask(currentTask.next.id);
                      }}
                    >
                      删除终止节点
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <div
          className="process"
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
          <div className="p-4">{activity && <ReactSVG src={url} />}</div>
        </div>
      </div>
    </div>
  );
}
