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

function getSwimlane(task: Task) {
  // 暂不支持多泳道
  return "";
  // return `${task.swimlane ? `|${task.swimlane}|\n` : ""}`;
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
    // 暂不支持多泳道
    // const uml = `
    //   @startuml
    //     ${this.parseActivityTitle(activity)}
    //     ${
    //       activity.swimlanes?.length
    //         ? `|${activity.swimlanes["0"].name}|\n`
    //         : ""
    //     }
    //     ${this.parseTask("", activity.start)}
    //   @enduml
    // `;
    const uml = `
      @startuml
        ${this.parseActivityTitle(activity)}
        ${this.parseTask("", activity.start)}
      @enduml
    `;
    return uml;
  },
  parseNormalTask(task: NormalTask): string {
    return `:${getTaskName(task)};\n`;
  },
  parseSwitchTask(task: SwitchTask): string {
    return `
      ${getSwimlane(task)}
      switch (${getTaskName(task)})
        ${this.parseCases(task.cases)}
      endswitch\n
    `;
  },
  parseParallelTask(task: ParallelTask): string {
    return `
      ${getSwimlane(task)}
      fork 
        ${task.parallel.map((t) => this.parseTask("", t)).join("fork again\n")}
      end fork {${getTaskName(task)}}\n
    `;
  },
  parseWhileTask(task: WhileTask): string {
    const yes = task.condition?.yes || "yes";
    const no = task.condition?.no || "no";
    return `
      ${getSwimlane(task)}
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
        return `
          case (<text class="task" caseid="${item.id}">${item.condition}</text>)
            ${this.parseTask("", item.task)}
        `;
      })
      .join("\n");
  },
};
