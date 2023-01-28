import { ContainerObjectType } from "../../../../core/entities/Deployment";

export function AddContainer(props: {
  onClick(type: ContainerObjectType): void;
}) {
  return (
    <div className="space-x-1">
      <button
        className="btn btn-xs btn-outline"
        onClick={() => props.onClick(ContainerObjectType.rectangle)}
      >
        矩形
      </button>
      <button
        className="btn btn-xs btn-outline"
        onClick={() => props.onClick(ContainerObjectType.cloud)}
      >
        云
      </button>
    </div>
  );
}
