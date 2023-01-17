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
  return "https://www.plantuml.com/plantuml/svg/" + encoder.encode(diagram);
}

type State = {
  activity?: Activity;
  currentTask?: Task;
  url: string;
};

type Actions = {
  initializeActivity(): void;
  setActivityTitle(title: string): void;
  setCurrentTask(taskId: string): void;
  setTaskName(taskId: string, name: string): void;
  addTask(taskId: string, type?: TaskType): void;
  deleteTask(taskId: string): void;
  addCondition(taskId: string): void;
  deleteCondition(taskId: string, index: number): void;
  setUmlUrl(): void;
  setEndless(taskId: string, bool: boolean): void;
};

export type ActivityStore = State & Actions;

export function createActivityStore(): StoreApi<ActivityStore> {
  return createStore((set, get) => {
    return {
      activity: undefined,
      url: "",
      setUmlUrl() {
        const uml = activityParser.parseActivity(get().activity);
        const url = draw(uml);
        set({
          url,
        });
      },
      initializeActivity() {
        const activity: Activity = {
          start: createTask(TaskType.start) as StartTask,
        };
        set({
          activity,
          currentTask: activity.start,
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
      setCurrentTask(taskId: string) {
        const result = findTask(get().activity.start, taskId);
        if (result) {
          console.log("result", result);
          set({
            currentTask: result,
          });
        }
      },
      setTaskName(taskId: string, name: string) {
        const result = findTask(get().activity.start, taskId);
        if (result) {
          result.name = name;
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
          if (task.type === TaskType.stop) {
            task.prev.next = undefined;
          } else {
            task.prev.next = task.next;
            if (task.next) {
              task.next.prev = task.prev;
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
      setEndless(taskId, bool) {
        const result = findTask(get().activity.start, taskId);
        if (result && result.type === TaskType.while) {
          result.endless = bool;
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
