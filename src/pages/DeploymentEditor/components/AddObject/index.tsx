import { Button, ButtonGroup } from "@mui/material";
import { NormalObject, ObjectType } from "../../../../core/entities/Deployment";

export function AddObject(props: {
  onClick(type: NormalObject["type"]): void;
}) {
  return (
    <div>
      <ButtonGroup variant="outlined" size="small">
        <Button onClick={() => props.onClick(ObjectType.circle)}>圆</Button>
      </ButtonGroup>
    </div>
  );
}
