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
  return `<text class="task" taskId="${task.id}">${task.name}</text>`;
}

export const activityParser = {
  parseActivityTitle(activity: Activity): string {
    if (activity?.title) {
      return `title "<text class="activity" activityName="${activity.title}">${activity.title}</text>"\n`;
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
    return `
      ${task.swimlane ? `|${task.swimlane}|\n` : ""}
      :${getTaskName(task)};\n
    `;
  },
  parseSwitchTask(task: SwitchTask): string {
    return `
      ${task.swimlane ? `|${task.swimlane}|\n` : ""}
      switch (${getTaskName(task)})
        ${this.parseCases(task.cases)}
      endswitch\n
    `;
  },
  parseParallelTask(task: ParallelTask): string {
    return `
      ${task.swimlane ? `|${task.swimlane}|\n` : ""}
      fork 
        ${task.parallel.map((t) => this.parseTask("", t)).join("fork again\n")}
      end fork {${getTaskName(task)}}\n
    `;
  },
  parseWhileTask(task: WhileTask): string {
    return `
      ${task.swimlane ? `|${task.swimlane}|\n` : ""}
      while (${getTaskName(task)})
        ${this.parseTask("", task.while)}
      endwhile\n
      ${
        task.endless
          ? `-[hidden]->
             detach`
          : ""
      }
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
        return `
          case (<text class="task" caseid="${item.id}">${item.condition}</text>)
            ${this.parseTask("", item.task)}
        `;
      })
      .join("\n");
  },
};
