import { TaskType } from "../../core/entities/Activity";

export const TYPE_MAP = {
  [TaskType.start]: "起始",
  [TaskType.normal]: "普通",
  [TaskType.parallel]: "并行",
  [TaskType.switch]: "条件",
  [TaskType.while]: "循环",
  [TaskType.stop]: "结束",
};
