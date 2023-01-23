/* eslint-disable react-hooks/exhaustive-deps */
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import { TaskType } from "../../../../entities/Activity";

const typeMap = {
  [TaskType.start]: "起始",
  [TaskType.normal]: "普通",
  [TaskType.parallel]: "并行",
  [TaskType.switch]: "条件",
  [TaskType.while]: "循环",
  [TaskType.stop]: "结束",
};

export function OperationButtonGroup(props: {
  group: TaskType[];
  onClick(type: TaskType): void;
}) {
  return (
    <ButtonGroup variant="outlined" size="small">
      {props.group.map((type) => {
        return (
          <Button key={type} onClick={() => props.onClick(type)}>
            {typeMap[type]}
          </Button>
        );
      })}
    </ButtonGroup>
  );
}
