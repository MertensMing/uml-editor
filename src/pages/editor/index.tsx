/* eslint-disable react-hooks/exhaustive-deps */
import { ReactSVG } from "react-svg";
import { useStore } from "zustand";
import shallow from "zustand/shallow";
import { useEffect, useLayoutEffect, useRef } from "react";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import AccountCircle from "@mui/icons-material/AccountCircle";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { createActivityStore } from "./store/activity";
import { useEditActivityLogic } from "./logic/useEditActivityLogic";
import { Activity, TaskType } from "../../entities/Activity";

const typeMap = {
  [TaskType.start]: "起始",
  [TaskType.normal]: "普通流程",
  [TaskType.parallel]: "并行",
  [TaskType.switch]: "条件",
  [TaskType.while]: "循环",
  [TaskType.stop]: "结束",
};

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
    <div className="flex flex-col h-screen">
      <div className="flex p-4 items-center border-b-solid border-gray-300 border-px h-16">
        <div className="bg-gray-800 text-white px-4 py-2 rounded">UML</div>
        <div className="ml-4">PlantUML Editor</div>
      </div>
      <div className="flex" style={{ height: `calc(100vh - 64px)` }}>
        <div
          style={{ width: 300 }}
          className="px-4 py-4 h-full flex-shrink-0 border-r-solid border-gray-300 border-px overflow-auto"
        >
          <div>
            <InputLabel
              style={{ transform: "translate(0, -1.5px) scale(0.75)" }}
            >
              图表操作
            </InputLabel>
            <div>
              <ButtonGroup variant="outlined" size="small">
                <Button disabled={!allowUndo} onClick={handleUndo}>
                  撤销
                </Button>
                <Button disabled={!allowRedo} onClick={handleRedo}>
                  恢复
                </Button>
              </ButtonGroup>
            </div>
          </div>
          <br />
          <div>
            <FormControl variant="standard">
              <InputLabel>图表名称</InputLabel>
              <Input
                startAdornment={
                  <InputAdornment position="start">
                    <AccountCircle />
                  </InputAdornment>
                }
                value={activity.title}
                onChange={(e) => {
                  handleTitleChange(e.target.value);
                }}
              />
            </FormControl>
          </div>
          {currentTask && (
            <>
              <br />
              <div>
                <FormControl variant="standard">
                  <InputLabel>节点类型</InputLabel>
                  <Input
                    startAdornment={
                      <InputAdornment position="start">
                        <AccountCircle />
                      </InputAdornment>
                    }
                    value={typeMap[currentTask.type]}
                    disabled
                  />
                </FormControl>
              </div>
              <br />
              <div>
                <FormControl variant="standard">
                  <InputLabel>节点名称</InputLabel>
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
                </FormControl>
              </div>
              {!!activity?.swimlanes?.length && (
                <div>
                  <br />
                  <FormControl variant="standard">
                    <InputLabel>选择泳道</InputLabel>
                    <Select
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
                  </FormControl>
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
                  <div>
                    <br />
                    <InputLabel
                      style={{ transform: "translate(0, -1.5px) scale(0.75)" }}
                    >
                      并行任务
                    </InputLabel>
                    <div>
                      {currentTask.parallel.map((item, index) => (
                        <div className="flex items-center" key={item.id}>
                          <Input
                            startAdornment={
                              <InputAdornment position="start">
                                <AccountCircle />
                              </InputAdornment>
                            }
                            value={`任务 ${index + 1}（${item.name}）`}
                            disabled
                          />
                          {currentTask.parallel.length > 2 && (
                            <div
                              onClick={() =>
                                handleDeleteParallelTask(currentTask.id, index)
                              }
                              className="ml-1 cursor-pointer text-xs hover:bg-gray-200 px-2 py-1 rounded"
                            >
                              删除
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div>
                      <br />
                      <InputLabel
                        style={{
                          transform: "translate(0, -1.5px) scale(0.75)",
                        }}
                      >
                        添加并行任务
                      </InputLabel>
                      <div>
                        <ButtonGroup variant="outlined" size="small">
                          <Button
                            onClick={() =>
                              handleAddParallelTask(
                                currentTask.id,
                                TaskType.normal
                              )
                            }
                          >
                            普通
                          </Button>
                          <Button
                            onClick={() =>
                              handleAddParallelTask(
                                currentTask.id,
                                TaskType.parallel
                              )
                            }
                          >
                            并行
                          </Button>
                          <Button
                            onClick={() =>
                              handleAddParallelTask(
                                currentTask.id,
                                TaskType.switch
                              )
                            }
                          >
                            条件
                          </Button>
                          <Button
                            onClick={() =>
                              handleAddParallelTask(
                                currentTask.id,
                                TaskType.while
                              )
                            }
                          >
                            循环
                          </Button>
                        </ButtonGroup>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
              {currentTask.type === TaskType.switch ? (
                <div>
                  <div>
                    <br />
                    <InputLabel
                      style={{ transform: "translate(0, -1.5px) scale(0.75)" }}
                    >
                      编辑条件
                    </InputLabel>
                    {currentTask.cases.map((item, index) => (
                      <div className="flex items-center" key={index}>
                        <Input
                          startAdornment={
                            <InputAdornment position="start">
                              <AccountCircle />
                            </InputAdornment>
                          }
                          value={item.condition}
                          onChange={(e) => {
                            handleTaskNameChange(
                              currentTask.id,
                              e.target.value
                            );
                          }}
                        />
                        {currentTask.cases.length > 2 ? (
                          <div
                            onClick={() =>
                              handleDeleteCondition(currentTask.id, index)
                            }
                            className="ml-1 cursor-pointer text-xs hover:bg-gray-200 px-2 py-1 rounded"
                          >
                            删除
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  <div>
                    <br />
                    <InputLabel
                      style={{ transform: "translate(0, -1.5px) scale(0.75)" }}
                    >
                      添加条件
                    </InputLabel>
                    <div>
                      <ButtonGroup variant="outlined" size="small">
                        <Button
                          onClick={() =>
                            handleAddCondition(currentTask.id, TaskType.normal)
                          }
                        >
                          普通
                        </Button>
                        <Button
                          onClick={() =>
                            handleAddCondition(
                              currentTask.id,
                              TaskType.parallel
                            )
                          }
                        >
                          并行
                        </Button>
                        <Button
                          onClick={() =>
                            handleAddCondition(currentTask.id, TaskType.switch)
                          }
                        >
                          条件
                        </Button>
                        <Button
                          onClick={() =>
                            handleAddCondition(currentTask.id, TaskType.while)
                          }
                        >
                          循环
                        </Button>
                        <Button
                          onClick={() =>
                            handleAddCondition(currentTask.id, TaskType.stop)
                          }
                        >
                          结束
                        </Button>
                      </ButtonGroup>
                    </div>
                  </div>
                </div>
              ) : null}
              <div>
                <br />
                <div>
                  <InputLabel
                    style={{ transform: "translate(0, -1.5px) scale(0.75)" }}
                  >
                    添加节点
                  </InputLabel>
                  <div>
                    <ButtonGroup variant="outlined" size="small">
                      <Button
                        onClick={() =>
                          handleAddTask(currentTask.id, TaskType.normal)
                        }
                      >
                        普通
                      </Button>
                      <Button
                        onClick={() =>
                          handleAddTask(currentTask.id, TaskType.parallel)
                        }
                      >
                        并行
                      </Button>
                      <Button
                        onClick={() =>
                          handleAddTask(currentTask.id, TaskType.switch)
                        }
                      >
                        条件
                      </Button>
                      <Button
                        onClick={() =>
                          handleAddTask(currentTask.id, TaskType.while)
                        }
                      >
                        循环
                      </Button>
                      <Button
                        onClick={() =>
                          handleAddTask(currentTask.id, TaskType.stop)
                        }
                      >
                        结束
                      </Button>
                    </ButtonGroup>
                  </div>
                </div>
              </div>
              <div>
                <br />
                <InputLabel
                  style={{ transform: "translate(0, -1.5px) scale(0.75)" }}
                >
                  删除节点
                </InputLabel>
                <div>
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
                </div>
              </div>
            </>
          )}
        </div>
        <div className="h-full w-full overflow-auto">
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
