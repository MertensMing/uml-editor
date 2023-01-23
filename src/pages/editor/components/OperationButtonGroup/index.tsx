/* eslint-disable react-hooks/exhaustive-deps */
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import { TaskType } from "../../../../entities/Activity";
import { TYPE_MAP } from "../../const";

export function OperationButtonGroup(props: {
  group: TaskType[];
  onClick(type: TaskType): void;
}) {
  return (
    <ButtonGroup variant="outlined" size="small">
      {props.group.map((type) => {
        return (
          <Button key={type} onClick={() => props.onClick(type)}>
            {TYPE_MAP[type]}
          </Button>
        );
      })}
    </ButtonGroup>
  );
}
