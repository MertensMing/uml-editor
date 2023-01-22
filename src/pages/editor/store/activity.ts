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
  setCurrentTask(taskId: Task["id"]): void;
  setDiagramUrl(): void;
  // activity
  initializeActivity(): void;
  setActivityTitle(title: string): void;
  activeSwimlanes(bool: boolean): void;
  // task
  setTaskField(taskId: Task["id"], field: string, value: any): void;
  addTask(taskId: Task["id"], type?: TaskType): void;
  deleteTask(taskId: Task["id"]): void;
  addCondition(taskId: Task["id"], type: TaskType): void;
  deleteCondition(taskId: Task["id"], index: number): void;
  setInfiniteLoop(taskId: Task["id"], bool: boolean): void;
  addParallelTask(taskId: Task["id"], type: TaskType): void;
  deleteParallelTask(taskId: Task["id"], index: number): void;
};

export type ActivityStore = State & Actions;

export function createActivityStore(
  activity?: Activity
): StoreApi<ActivityStore> {
  return createStore((set, get) => {
    function updateActivity() {
      set({
        activity: {
          ...get().activity,
        },
      });
    }
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
        updateActivity();
      },
      setActivityTitle(title) {
        const activity = get().activity;
        activity.title = title;
        updateActivity();
      },
      setCurrentTask(taskId) {
        const result = findTask(get().activity.start, taskId);
        if (result) {
          set({
            currentTask: result,
          });
        }
      },
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
          updateActivity();
        }
      },
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
      setInfiniteLoop(taskId, bool) {
        const result = findTask(get().activity.start, taskId);
        if (result && result.type === TaskType.while) {
          result.infiniteLoop = bool;
          updateActivity();
        }
      },
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
