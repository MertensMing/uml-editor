/* eslint-disable react-hooks/exhaustive-deps */
import { ReactSVG } from "react-svg";
import { useStore } from "zustand";
import shallow from "zustand/shallow";
import { useEffect, useLayoutEffect, useRef } from "react";
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
  const { currentTask, url, activity } = useStore(
    activityStore,
    ({ currentTask, url, activity }) => ({ currentTask, url, activity }),
    shallow
  );
  const {
    // init
    handleMount,
    // activity
    handleTitleChange,
    handleActivityChange,
    handleToggleSwimlanes,
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
  } = useEditActivityLogic([activityStore]);

  useLayoutEffect(() => {
    handleMount();
  }, []);

  useEffect(() => {
    handleActivityChange();
  }, [activity]);

  return (
    <div className="p-8">
      <h1>PlantUML Editor</h1>
      <div>
        图表名称
        <input
          onChange={(e) => {
            handleTitleChange(e.target.value);
          }}
        />
      </div>
      <div>
        是否开启泳道：
        <input
          type="checkbox"
          onChange={(e) => handleToggleSwimlanes(e.target.checked)}
        />
        {!!activity?.swimlanes?.length && (
          <div>{activity.swimlanes.map((item) => item.name)}</div>
        )}
      </div>
      <div>
        ------------------------------------------------------------------------------------
      </div>
      {currentTask && (
        <div>
          <div>id: {currentTask.id}</div>
          <div>
            name:
            <input
              value={currentTask.name}
              onChange={(e) => {
                handleTaskNameChange(currentTask.id, e.target.value);
              }}
            />
          </div>
          <div>type: {currentTask.type}</div>
          {!!activity?.swimlanes?.length && (
            <div>
              <select
                onChange={(e) => {
                  handleTaskSwimLaneChange(currentTask.id, e.target.value);
                }}
                value={currentTask.swimlane}
              >
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
              死循环：
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
                  <button>x</button>
                </span>
              ))}
              <div>
                <button>+ 新增并行任务</button>
              </div>
            </div>
          ) : null}
          {currentTask.type === TaskType.switch ? (
            <div>
              条件：
              {currentTask.cases.map((item, index) => (
                <span key={item.id}>
                  {item.condition}{" "}
                  {currentTask.cases.length > 2 ? (
                    <button
                      onClick={() =>
                        handleDeleteCondition(currentTask.id, index)
                      }
                    >
                      x
                    </button>
                  ) : null}
                </span>
              ))}
              <div>
                新增条件：
                <button
                  onClick={() =>
                    handleAddCondition(currentTask.id, TaskType.normal)
                  }
                >
                  +普通流程
                </button>
                <button
                  onClick={() =>
                    handleAddCondition(currentTask.id, TaskType.switch)
                  }
                >
                  +条件判断
                </button>
                <button
                  onClick={() =>
                    handleAddCondition(currentTask.id, TaskType.while)
                  }
                >
                  +循环
                </button>
                <button
                  onClick={() =>
                    handleAddCondition(currentTask.id, TaskType.parallel)
                  }
                >
                  +并行任务
                </button>
                <button
                  onClick={() =>
                    handleAddCondition(currentTask.id, TaskType.stop)
                  }
                >
                  +结束
                </button>
              </div>
            </div>
          ) : null}
          <br />
          <div>
            <button onClick={() => handleAddTask(currentTask.id)}>
              + normal
            </button>
            <button
              onClick={() => handleAddTask(currentTask.id, TaskType.switch)}
            >
              + switch
            </button>
            <button
              onClick={() => handleAddTask(currentTask.id, TaskType.parallel)}
            >
              + parallel
            </button>
            <button
              onClick={() => handleAddTask(currentTask.id, TaskType.while)}
            >
              + while
            </button>
            <button
              onClick={() => handleAddTask(currentTask.id, TaskType.stop)}
            >
              + stop
            </button>
          </div>
          <br />
          {currentTask.prev && (
            <button
              onClick={() => {
                handleDeleteTask(currentTask.id);
              }}
            >
              删除
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
          <br />
        </div>
      )}
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
  );
}
