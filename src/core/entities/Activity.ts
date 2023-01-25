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
      correctTask(item.task);
    }
    if (task.next) {
      correctTask(task.next, task.id);
    }
  } else if (task.type === TaskType.parallel) {
    for (const item of task.parallel) {
      correctTask(item);
    }
    if (task.next) {
      correctTask(task.next, task.id);
    }
  } else if (task.type === TaskType.while) {
    correctTask(task.while);
    if (task.next) {
      correctTask(task.next, task.id);
    }
  } else if (task.type !== TaskType.stop && task.next) {
    correctTask(task.next, task.id);
  }
}

function getId() {
  return `${Date.now()}${Math.random()}`;
}

export function createTask(type: TaskType, prevTask?: Task): Task {
  if (prevTask?.type === TaskType.stop) {
    return;
  }
  switch (type) {
    case TaskType.start:
      return {
        type: TaskType.start,
        id: getId(),
        name: "开始",
      };
    case TaskType.stop:
      return {
        type: TaskType.stop,
        id: getId(),
        name: "结束",
        prev: prevTask?.id,
      };
    case TaskType.while:
      return {
        type: TaskType.while,
        id: getId(),
        name: "循环条件",
        while: createTask(TaskType.normal),
        prev: prevTask?.id,
        next: prevTask?.next,
      };
    case TaskType.parallel:
      return {
        type: TaskType.parallel,
        id: getId(),
        name: "并行",
        parallel: [createTask(TaskType.normal), createTask(TaskType.normal)],
        prev: prevTask?.id,
        next: prevTask?.next,
      };
    case TaskType.switch:
      return {
        type: TaskType.switch,
        id: getId(),
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
        id: getId(),
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
    id: getId(),
  };
}