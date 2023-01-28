import { NormalObject, ObjectType } from "../../../../core/entities/Deployment";

export function AddObject(props: {
  onClick(type: NormalObject["type"]): void;
}) {
  return (
    <div className="space-x-1">
      <button
        className="btn btn-xs btn-outline"
        onClick={() => props.onClick(ObjectType.circle)}
      >
        圆
      </button>
    </div>
  );
}
