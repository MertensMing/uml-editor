/* eslint-disable react-hooks/exhaustive-deps */
import { ReactSVG } from "react-svg";
import { useStore } from "zustand";
import shallow from "zustand/shallow";
import { useEffect, useLayoutEffect, useRef } from "react";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import AccountCircle from "@mui/icons-material/AccountCircle";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import { useDebounceCallback } from "@react-hook/debounce";
import { createActivityStore } from "./store/activity";
import { useEditActivityLogic } from "./logic/useEditActivityLogic";
import { Activity, TaskType } from "../../entities/Activity";
import { OperationButtonGroup } from "./components/OperationButtonGroup";
import { TYPE_MAP } from "./const";
import { FormItem } from "./components/FormItem";
import { ListOperation } from "./components/ListOperation";

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
    // handleTitleChange,
    handleActivityChange,
    handleRedo,
    handleUndo,
    // task
    handleAddTask,
    handleDeleteTask,
    handleSelectTask,
    handleTaskNameChange,
    // switch
    handleAddCondition,
    handleDeleteCondition,
    handleConditionTextChange,
    // while
    handleWhileConditionChange,
    // parallel
    handleAddParallelTask,
    handleDeleteParallelTask,
  } = useEditActivityLogic([activityStore]);

  const debouncedHandleActivityChange = useDebounceCallback(
    handleActivityChange,
    500
  );

  useLayoutEffect(() => {
    handleMount();
  }, []);

  useEffect(() => {
    debouncedHandleActivityChange();
  }, [activity]);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex p-4 items-center border-b-solid border-gray-700 border-px h-16">
        <div className="font-bold">PlantUML Editor</div>
      </div>
      <div className="flex" style={{ height: `calc(100vh - 64px)` }}>
        <div
          style={{ width: 300 }}
          className="px-4 py-4 h-full flex-shrink-0 border-r-solid border-gray-700 border-px overflow-auto"
        >
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
          {currentTask && (
            <>
              {/* 节点名称 */}
              {currentTask.type !== TaskType.start && (
                <FormItem
                  label="节点名称"
                  content={
                    <Input
                      startAdornment={
                        <InputAdornment position="start">
                          <AccountCircle />
                        </InputAdornment>
                      }
                      value={currentTask.name}
                      onChange={(e) => {
                        handleTaskNameChange(currentTask.id, e.target.value);
                      }}
                    />
                  }
                />
              )}
              {/* 添加节点 */}
              <FormItem
                label="添加节点"
                content={
                  <OperationButtonGroup
                    group={[
                      TaskType.normal,
                      TaskType.switch,
                      TaskType.parallel,
                      TaskType.while,
                      TaskType.stop,
                    ]}
                    onClick={(type) => handleAddTask(currentTask.id, type)}
                  />
                }
              />
              {/* 删除节点 */}
              <FormItem
                label="删除节点"
                content={
                  <ButtonGroup variant="outlined" size="small">
                    <Button
                      onClick={() => {
                        handleDeleteTask(currentTask.id);
                      }}
                      disabled={!currentTask.prev}
                      color="error"
                    >
                      删除
                    </Button>
                    {currentTask.next?.type === TaskType.stop && (
                      <Button
                        onClick={() => {
                          handleDeleteTask(currentTask.next.id);
                        }}
                        color="error"
                      >
                        删除下级结束点
                      </Button>
                    )}
                  </ButtonGroup>
                }
              />
              {/* 节点类型 */}
              <FormItem
                label="节点类型"
                content={
                  <Input
                    startAdornment={
                      <InputAdornment position="start">
                        <AccountCircle />
                      </InputAdornment>
                    }
                    value={TYPE_MAP[currentTask.type]}
                    disabled
                  />
                }
              />
              {currentTask.type === TaskType.while ? (
                <FormItem
                  label="循环条件"
                  content={
                    <div>
                      <Input
                        startAdornment={
                          <InputAdornment position="start">
                            <AccountCircle />
                            <div className=" ml-1 text-xs">循环条件</div>
                          </InputAdornment>
                        }
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
                      <Input
                        startAdornment={
                          <InputAdornment position="start">
                            <AccountCircle />
                            <div className=" ml-1 text-xs">退出条件</div>
                          </InputAdornment>
                        }
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
                    </div>
                  }
                />
              ) : null}
              {currentTask.type === TaskType.parallel ? (
                <div>
                  <FormItem
                    label="并行任务"
                    content={
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
                    }
                  />
                  <FormItem
                    label="添加并行任务"
                    content={
                      <OperationButtonGroup
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
                    }
                  />
                </div>
              ) : null}
              {currentTask.type === TaskType.switch ? (
                <div>
                  <FormItem
                    label="编辑条件"
                    content={
                      <ListOperation
                        allowDelete={currentTask.cases.length > 2}
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
                    }
                  />
                  <FormItem
                    label="添加条件"
                    content={
                      <OperationButtonGroup
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
                    }
                  />
                </div>
              ) : null}
            </>
          )}
        </div>
        <div className="h-full w-full overflow-auto bg-gray-100">
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
    </div>
  );
}
