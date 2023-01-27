import { createStore, StoreApi } from "zustand";
import {
  Activity,
  Task,
  TaskType,
  findTask,
  createTask,
  StartTask,
  createCase,
  correctTask,
  removeTask,
} from "../../../core/entities/Activity";
import { activityParser } from "../../../core/parser/activity";
import { drawPng, drawSvg } from "../../../shared/utils/uml";

type State = {
  activity?: Activity;
  currentTask?: Task;
  url: string;
  uml: string;
  pngUrl: string;
};

type Actions = {
  // ui
  setCurrentTask(taskId: Task["id"]): void;
  resetCurrentTask(): void;
  updateDiagramUrl(): void;
  // activity
  initializeActivity(): void;
  setActivity(activity: Activity): void;
  // task
  setTaskField(taskId: Task["id"], field: string, value: any): void;
  addTask(taskId: Task["id"], type?: TaskType): void;
  deleteTask(taskId: Task["id"]): void;
  updateConditionText(taskId: Task["id"], index: number, text: string): void;
  addCondition(taskId: Task["id"], type: TaskType): void;
  deleteCondition(taskId: Task["id"], index: number): void;
  setWhileCondition(taskId: Task["id"], yes: string, no: string): void;
  addParallelTask(taskId: Task["id"], type: TaskType): void;
  deleteParallelTask(taskId: Task["id"], index: number): void;
  moveTask(origin: Task["id"], target: Task["id"]): void;
};

export type ActivityStore = State & Actions;

export function createActivityStore(
  activity?: Activity
): StoreApi<ActivityStore> {
  return createStore((set, get) => {
    function updateActivity() {
      correctTask(get().activity.start);
      set({
        activity: {
          ...get().activity,
        },
      });
    }

    return {
      activity,
      url: "",
      uml: "",
      pngUrl: "",
      undoIndex: 0,
      // ui
      setCurrentTask(taskId) {
        const result = findTask(get().activity.start, taskId);
        if (result) {
          set({
            currentTask: result,
          });
        }
      },
      updateDiagramUrl() {
        const uml = activityParser.parseActivity(get().activity);
        set({
          url: drawSvg(uml),
          uml,
          pngUrl: drawPng(uml),
        });
      },
      resetCurrentTask() {
        set({
          currentTask: get().activity.start,
        });
      },
      // activity
      initializeActivity() {
        if (!!get().activity) {
          correctTask(get().activity.start);
          set({
            currentTask: get().activity.start,
          });
          return;
        }
        const activity: Activity = {
          start: createTask(TaskType.start) as StartTask,
        };
        correctTask(activity.start);
        set({
          activity,
          currentTask: activity.start,
        });
      },
      setActivity(activity) {
        set({
          activity,
        });
      },
      // task
      setTaskField(taskId, field, value) {
        const result = findTask(get().activity.start, taskId);
        if (result) {
          result[field] = value;
          updateActivity();
        }
      },
      addTask(taskId, type) {
        const task = findTask(get().activity.start, taskId);
        if (task && task.type !== TaskType.stop) {
          task.next = createTask(type ?? TaskType.normal, task);
          updateActivity();
        }
      },
      deleteTask(taskId) {
        const removed = removeTask(get().activity, taskId);
        if (removed) {
          updateActivity();
          get().resetCurrentTask();
        }
      },
      // switch
      addCondition(taskId, type) {
        const result = findTask(get().activity.start, taskId);
        if (result && result.type === TaskType.switch) {
          result.cases.push(createCase("条件" + result.cases.length, type));
          updateActivity();
        }
      },
      deleteCondition(taskId, index) {
        const result = findTask(get().activity.start, taskId);
        if (result && result.type === TaskType.switch) {
          result.cases.splice(index, 1);
          updateActivity();
        }
      },
      updateConditionText(taskId, index, text) {
        const result = findTask(get().activity.start, taskId);
        if (result && result.type === TaskType.switch) {
          result.cases[index].condition = text;
          updateActivity();
        }
      },
      // while
      setWhileCondition(taskId, yes, no) {
        const result = findTask(get().activity.start, taskId);
        if (result && result.type === TaskType.while) {
          result.condition = {
            yes,
            no,
          };
          updateActivity();
        }
      },
      // parallel
      addParallelTask(taskId, type) {
        const result = findTask(get().activity.start, taskId);
        if (result && result.type === TaskType.parallel) {
          result.parallel.push(createTask(type));
          updateActivity();
        }
      },
      deleteParallelTask(taskId, index) {
        const result = findTask(get().activity.start, taskId);
        if (result && result.type === TaskType.parallel) {
          result.parallel.splice(index, 1);
          updateActivity();
        }
      },
      moveTask(origin, target) {
        const originTask = findTask(get().activity.start, origin);

        if (!originTask) return;

        const targetInOrigin = !!findTask(originTask, target);

        if (targetInOrigin) {
          window.alert("流程不允许相互嵌套");
          return;
        }

        const removed = removeTask(get().activity, origin);
        if (removed) {
          const targetTask = findTask(get().activity.start, target);
          if (targetTask && targetTask.type !== TaskType.stop) {
            removed.next = targetTask.next;
            targetTask.next = removed;
            updateActivity();
          }
        }
      },
    };
  });
}
