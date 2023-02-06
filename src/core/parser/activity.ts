import {
  Activity,
  Task,
  Case,
  TaskType,
  NormalTask,
  SwitchTask,
  ParallelTask,
  WhileTask,
} from "../entities/Activity";

function getTaskName(task: Task) {
  return `<text class="task" taskId="${task.id}" objectId="${task.id}">${
    task.name || "未命名流程"
  }</text>`;
}

export const activityParser = {
  parseActivityTitle(activity: Activity): string {
    if (activity?.title) {
      return `title "<text class="task" taskId="${activity.start.id}" objectId="${activity.start.id}">${activity.title}</text>"\n`;
    }
    return "";
  },
  parseActivity(activity: Activity): string {
    if (!activity) {
      return "";
    }
    const uml = `
      @startuml
        ${this.parseActivityTitle(activity)}
        ${this.parseTask("", activity.start)}
      @enduml
    `;
    return uml;
  },
  parseNormalTask(task: NormalTask): string {
    const comment = task?.comment?.content
      ? `note ${task.comment.direction}
      ${task.comment.content}
    end note
    `
      : "";
    return `:${getTaskName(task)};\n${comment}`;
  },
  parseSwitchTask(task: SwitchTask): string {
    return `
      switch (${getTaskName(task)})
        ${this.parseCases(task.cases)}
      endswitch\n
    `;
  },
  parseParallelTask(task: ParallelTask): string {
    return `
      fork 
        ${task.parallel.map((t) => this.parseTask("", t)).join("fork again\n")}
      end fork {${getTaskName(task)}}\n
    `;
  },
  parseWhileTask(task: WhileTask): string {
    const yes = task.condition?.yes || "是";
    const no = task.condition?.no || "否";
    return `
      repeat ${this.parseTask("", task.while)}
      repeat while (${getTaskName(task)}) is (${yes}) not (${no})\n
    `;
  },
  parseTask(uml: string, task: Task): string {
    switch (task.type) {
      case TaskType.start:
        uml += `start\n`;
        break;
      case TaskType.stop:
        uml += `stop\n`;
        return uml;
      case TaskType.normal:
        uml += this.parseNormalTask(task);
        break;
      case TaskType.switch:
        uml += this.parseSwitchTask(task);
        break;
      case TaskType.parallel:
        uml += this.parseParallelTask(task);
        break;
      case TaskType.while:
        uml += this.parseWhileTask(task);
        break;
      default:
        console.log("暂未支持", task);
        return uml;
    }
    if (task.next) {
      return this.parseTask(uml, task.next);
    }
    return uml;
  },
  parseCases(cases: Case[]): string {
    return cases
      .map((item) => {
        const condition = `
          case (<text caseId="${item.condition}">${item.condition}</text>)
            ${this.parseTask("", item.task)}
        `;
        return condition;
      })
      .join("\n");
  },
};
