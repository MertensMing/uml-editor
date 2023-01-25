import { Button, ButtonGroup } from "@mui/material";
import { ContainerObjectType } from "../../../../core/entities/Deployment";

export function AddContainer(props: {
  onClick(type: ContainerObjectType): void;
}) {
  return (
    <div>
      <ButtonGroup variant="outlined" size="small">
        <Button onClick={() => props.onClick(ContainerObjectType.rectangle)}>
          矩形
        </Button>
        <Button onClick={() => props.onClick(ContainerObjectType.cloud)}>
          云朵
        </Button>
      </ButtonGroup>
    </div>
  );
}
