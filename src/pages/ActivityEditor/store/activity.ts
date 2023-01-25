import { createStore, StoreApi } from "zustand";
import encoder from "plantuml-encoder";
import {
  Activity,
  Task,
  TaskType,
  findTask,
  createTask,
  StartTask,
  createCase,
  correctTask,
} from "../../../core/entities/Activity";
import { activityParser } from "../../../core/parser/activity";

function drawSvg(diagram: string) {
  return "https://pblk.bytedance.com/svg/" + encoder.encode(diagram);
}

function drawPng(diagram: string) {
  return "https://pblk.bytedance.com/png/" + encoder.encode(diagram);
}

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
          set({
            currentTask: get().activity.start,
          });
          return;
        }
        const activity: Activity = {
          start: createTask(TaskType.start) as StartTask,
        };
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
        const task = findTask(get().activity.start, taskId);
        if (!task) return;
        if (task.type === TaskType.start) return;
        const prevTask = findTask(get().activity.start, task.prev);
        if (!prevTask) return;
        if (task.type === TaskType.stop) {
          prevTask.next = undefined;
          updateActivity();
          get().resetCurrentTask();
          return;
        }
        if (task.next) {
          task.next.prev = prevTask.id;
        }
        prevTask.next = task.next;
        updateActivity();
        get().resetCurrentTask();
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
    };
  });
}
