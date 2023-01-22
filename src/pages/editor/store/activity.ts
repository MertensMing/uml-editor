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
} from "../../../entities/Activity";
import { activityParser } from "../../../parser/activity";

function draw(diagram: string) {
  return "https://pblk.bytedance.com/svg/" + encoder.encode(diagram);
}

type State = {
  activity?: Activity;
  currentTask?: Task;
  url: string;
};

type Actions = {
  // ui
  setCurrentTask(taskId: string): void;
  setDiagramUrl(): void;
  // activity
  initializeActivity(): void;
  setActivityTitle(title: string): void;
  activeSwimlanes(bool: boolean): void;
  // task
  setTaskField(taskId: string, field: string, value: any): void;
  addTask(taskId: string, type?: TaskType): void;
  deleteTask(taskId: string): void;
  addCondition(taskId: string): void;
  deleteCondition(taskId: string, index: number): void;
  setInfiniteLoop(taskId: string, bool: boolean): void;
};

export type ActivityStore = State & Actions;

export function createActivityStore(
  activity?: Activity
): StoreApi<ActivityStore> {
  return createStore((set, get) => {
    return {
      activity,
      url: "",
      setDiagramUrl() {
        const uml = activityParser.parseActivity(get().activity);
        const url = draw(uml);
        set({
          url,
        });
      },
      initializeActivity() {
        if (!!get().activity) {
          set({
            currentTask: get().activity.start,
          });
          return;
        }
        const activity: Activity = {
          start: createTask(TaskType.start) as StartTask,
          swimlanes: [],
        };
        set({
          activity,
          currentTask: activity.start,
        });
      },
      activeSwimlanes(bool) {
        const activity = get().activity;
        if (bool) {
          activity.swimlanes = [
            {
              name: "泳道A",
            },
            {
              name: "泳道B",
            },
          ];
        } else {
          activity.swimlanes = [];
        }
        set({
          activity: {
            ...get().activity,
          },
        });
      },
      setActivityTitle(title) {
        const activity = get().activity;
        activity.title = title;
        set({
          activity: {
            ...get().activity,
          },
        });
      },
      setCurrentTask(taskId) {
        const result = findTask(get().activity.start, taskId);
        if (result) {
          console.log("result", result);
          set({
            currentTask: result,
          });
        }
      },
      setTaskField(taskId, field, value) {
        const result = findTask(get().activity.start, taskId);
        if (result) {
          result[field] = value;
          set({
            activity: {
              ...get().activity,
            },
          });
        }
      },
      addTask(taskId, type) {
        const task = findTask(get().activity.start, taskId);
        if (task && task.type !== TaskType.stop) {
          task.next = createTask(type ?? TaskType.normal, task);
          set({
            activity: {
              ...get().activity,
            },
          });
        }
      },
      deleteTask(taskId) {
        const task = findTask(get().activity.start, taskId);
        if (task && task.type !== TaskType.start) {
          const prevTask = findTask(get().activity.start, task.prev);
          if (!prevTask) return;
          if (task.type === TaskType.stop) {
            prevTask.next = undefined;
          } else {
            prevTask.next = task.next;
            if (task.next) {
              task.next.prev = prevTask.id;
            }
          }
          set({
            activity: {
              ...get().activity,
            },
          });
        }
      },
      addCondition(taskId) {
        const result = findTask(get().activity.start, taskId);
        if (result && result.type === TaskType.switch) {
          result.cases.push(createCase("条件" + result.cases.length));
          set({
            activity: {
              ...get().activity,
            },
          });
        }
      },
      deleteCondition(taskId, index) {
        const result = findTask(get().activity.start, taskId);
        if (result && result.type === TaskType.switch) {
          result.cases.splice(index, 1);
          set({
            activity: {
              ...get().activity,
            },
          });
        }
      },
      setInfiniteLoop(taskId, bool) {
        const result = findTask(get().activity.start, taskId);
        if (result && result.type === TaskType.while) {
          result.infiniteLoop = bool;
          set({
            activity: {
              ...get().activity,
            },
          });
        }
      },
    };
  });
}
