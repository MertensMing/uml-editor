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
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import Select from "@mui/material/Select";
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
        <div className="bg-gray-800 text-white px-4 py-2 rounded">UML</div>
        <div className="ml-4">PlantUML Editor</div>
      </div>
      <div className="flex" style={{ height: `calc(100vh - 64px)` }}>
        <div
          style={{ width: 300 }}
          className="px-4 py-4 h-full flex-shrink-0 border-r-solid border-gray-700 border-px overflow-auto"
        >
          <FormItem
            label="图表操作"
            content={
              <ButtonGroup variant="outlined" size="small">
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
              {/* 选择泳道 */}
              {!!activity?.swimlanes?.length && (
                <FormItem
                  label="选择泳道"
                  content={
                    <Select
                      variant="standard"
                      startAdornment={
                        <InputAdornment position="start">
                          <AccountCircle />
                        </InputAdornment>
                      }
                      style={{ width: "199px" }}
                      value={currentTask.swimlane ?? "undefined"}
                      onChange={(e: any) =>
                        handleTaskSwimLaneChange(currentTask.id, e.target.value)
                      }
                    >
                      <MenuItem disabled value={"undefined"}>
                        未选择
                      </MenuItem>
                      {activity?.swimlanes?.map((item, index) => (
                        <MenuItem key={index} value={item.name}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </Select>
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
                  label="无限循环"
                  content={
                    <Checkbox
                      value={currentTask.infiniteLoop}
                      onChange={(e) =>
                        handleToggleInfiniteLoop(
                          currentTask.id,
                          e.target.checked
                        )
                      }
                      size="small"
                    />
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
                      <div>
                        <FormItem
                          label="并行任务"
                          content={
                            <ListOperation
                              allowDelete={currentTask.cases.length > 2}
                              allowEdit
                              values={currentTask.cases.map(
                                (item) => item.condition
                              )}
                              onDelete={(index) =>
                                handleDeleteCondition(currentTask.id, index)
                              }
                            />
                          }
                        />
                      </div>
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
        ``
        <div className="h-full w-full overflow-auto bg-gray-100 p-4">
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
