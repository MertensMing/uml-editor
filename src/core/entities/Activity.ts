import { nanoid } from "nanoid";
import remove from "lodash/remove";

export enum TaskType {
  start = "start",
  normal = "normal",
  switch = "switch",
  stop = "stop",
  parallel = "parallel",
  while = "while",
}

type CommonTask = {
  id: string;
  prev?: Task["id"];
  name?: string;
  parent?: string;
};

export type StartTask = {
  type: TaskType.start;
  next?: Task;
} & CommonTask;

export type StopTask = {
  type: TaskType.stop;
  next?: Task;
} & CommonTask;

export type NormalTask = {
  type: TaskType.normal;
  next?: Task;
} & CommonTask;

export type WhileTask = {
  type: TaskType.while;
  while: Task;
  next?: Task;
  condition?: {
    yes: string;
    no: string;
  };
} & CommonTask;

export type Case = {
  condition: string;
  task: Task;
  id: string;
};

export type SwitchTask = {
  type: TaskType.switch;
  cases: Case[];
  next?: Task;
} & CommonTask;

export type ParallelTask = {
  type: TaskType.parallel;
  parallel: Task[];
  next?: Task;
} & CommonTask;

export type Task =
  | StartTask
  | StopTask
  | NormalTask
  | SwitchTask
  | WhileTask
  | ParallelTask;

export type Activity = {
  start: StartTask;
  title?: string;
  swimlanes?: {
    color?: string;
  }[];
};

// ======================== actions ========================

export function findTask(task: Task, taskId: string): Task | void {
  if (task.id === taskId) {
    return task;
  } else if (task.type === TaskType.switch) {
    for (const item of task.cases) {
      const result = findTask(item.task, taskId);
      if (result) {
        return result;
      }
    }
    if (task.next) {
      return findTask(task.next, taskId);
    }
  } else if (task.type === TaskType.parallel) {
    for (const item of task.parallel) {
      const result = findTask(item, taskId);
      if (result) {
        return result;
      }
    }
    if (task.next) {
      return findTask(task.next, taskId);
    }
  } else if (task.type === TaskType.while) {
    const result = findTask(task.while, taskId);
    if (result) {
      return result;
    }
    if (task.next) {
      return findTask(task.next, taskId);
    }
  } else if (task.type !== TaskType.stop && task.next) {
    return findTask(task.next, taskId);
  }
}

export function correctTask(task: Task, prevTaskId?: Task["id"]): Task | void {
  task.prev = prevTaskId;
  if (task.type === TaskType.switch) {
    for (const item of task.cases) {
      item.task.parent = task.id;
      correctTask(item.task);
    }
    if (task.next) {
      correctTask(task.next, task.id);
    }
  } else if (task.type === TaskType.parallel) {
    for (const item of task.parallel) {
      item.parent = task.id;
      correctTask(item);
    }
    if (task.next) {
      correctTask(task.next, task.id);
    }
  } else if (task.type === TaskType.while) {
    task.while.parent = task.id;
    correctTask(task.while);
    if (task.next) {
      correctTask(task.next, task.id);
    }
  } else if (task.type !== TaskType.stop && task.next) {
    correctTask(task.next, task.id);
  }
}

export function createTask(type: TaskType, prevTask?: Task): Task {
  if (prevTask?.type === TaskType.stop) {
    return;
  }
  switch (type) {
    case TaskType.start:
      return {
        type: TaskType.start,
        id: nanoid(),
        name: "开始",
      };
    case TaskType.stop:
      return {
        type: TaskType.stop,
        id: nanoid(),
        name: "结束",
        prev: prevTask?.id,
      };
    case TaskType.while:
      return {
        type: TaskType.while,
        id: nanoid(),
        name: "循环条件",
        while: createTask(TaskType.normal),
        prev: prevTask?.id,
        next: prevTask?.next,
      };
    case TaskType.parallel:
      return {
        type: TaskType.parallel,
        id: nanoid(),
        name: "并行",
        parallel: [createTask(TaskType.normal), createTask(TaskType.normal)],
        prev: prevTask?.id,
        next: prevTask?.next,
      };
    case TaskType.switch:
      return {
        type: TaskType.switch,
        id: nanoid(),
        name: "条件判断",
        cases: [
          createCase("是", TaskType.normal),
          createCase("否", TaskType.normal),
        ],
        prev: prevTask?.id,
        next: prevTask?.next,
      };
    case TaskType.normal:
    default:
      return {
        type: TaskType.normal,
        id: nanoid(),
        name: "流程",
        prev: prevTask?.id,
        next: prevTask?.next,
      };
  }
}

export function createCase(condition: string, type: TaskType) {
  return {
    condition,
    task: createTask(type),
    id: nanoid(),
  };
}

export function removeTask(activity: Activity, taskId: Task["id"]) {
  const task = findTask(activity.start, taskId);
  if (!task) return;
  if (task.type === TaskType.start) return;
  if (task.parent) {
    const parentTask = findTask(activity.start, task.parent);
    if (parentTask) {
      if (parentTask.type === TaskType.switch) {
        const targetCase = parentTask.cases.find(
          (item) => item.task.id === taskId
        );
        if (targetCase && targetCase.task.next) {
          const removed = targetCase.task;
          targetCase.task = targetCase.task.next;
          return removed;
        } else {
          return;
        }
      } else if (parentTask.type === TaskType.parallel) {
        const target = parentTask.parallel.find((item) => item.id === taskId);
        if (target && target.next) {
          const removed = target;
          remove(parentTask.parallel, (item) => item.id === taskId);
          parentTask.parallel.push(target.next);
          return removed;
        } else {
          return;
        }
      } else if (parentTask.type === TaskType.while) {
        if (parentTask.while.next) {
          const removed = parentTask.while;
          parentTask.while = parentTask.while.next;
          return removed;
        } else {
          return;
        }
      }
    }
  } else {
    const prevTask = findTask(activity.start, task.prev);
    if (!prevTask) return;
    if (task.type === TaskType.stop) {
      prevTask.next = undefined;
      const removed = task;
      return removed;
    }
    const removed = task;
    if (task.next) {
      task.next.prev = prevTask.id;
    }
    prevTask.next = task.next;
    return removed;
  }
}
