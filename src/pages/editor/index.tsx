/* eslint-disable react-hooks/exhaustive-deps */
import { ReactSVG } from "react-svg";
import { useStore } from "zustand";
import { useEffect, useLayoutEffect, useRef } from "react";
import { createActivityStore } from "./store/activity";
import { useEditActivityLogic } from "./logic/useEditActivityLogic";
import { TaskType } from "../../entities/Activity";

export function Editor() {
  const activityStore = useRef(createActivityStore()).current;
  const activity = useStore(activityStore, (state) => state.activity);
  const url = useStore(activityStore, (state) => state.url);
  const currentTask = useStore(activityStore, (state) => state.currentTask);
  const {
    handleMount,
    handleAddTask,
    handleDeleteTask,
    handleSelectTask,
    handleTaskNameChange,
    handleAddCondition,
    handleDeleteCondition,
    handleTitleChange,
    handleActivityChange,
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
              <button onClick={() => handleAddCondition(currentTask.id)}>
                + 新增条件
              </button>
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
