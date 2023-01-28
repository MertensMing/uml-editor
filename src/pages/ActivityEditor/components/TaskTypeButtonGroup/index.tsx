/* eslint-disable react-hooks/exhaustive-deps */
import { TaskType } from "../../../../core/entities/Activity";
import { TYPE_MAP } from "../../const";

export function TaskTypeButtonGroup(props: {
  group: TaskType[];
  onClick(type: TaskType): void;
}) {
  return (
    <>
      {props.group.map((type) => {
        return (
          <button
            className="btn btn-outline btn-sm"
            key={type}
            onClick={() => props.onClick(type)}
          >
            {TYPE_MAP[type]}
          </button>
        );
      })}
    </>
  );
}
