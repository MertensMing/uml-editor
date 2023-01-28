import { ContainerObjectType } from "../../../../core/entities/Deployment";

export function AddContainer(props: {
  onClick(type: ContainerObjectType): void;
}) {
  return (
    <div className="space-x-1">
      <button
        className="btn btn-sm btn-outline"
        onClick={() => props.onClick(ContainerObjectType.rectangle)}
      >
        Rectangle
      </button>
      <button
        className="btn btn-sm btn-outline"
        onClick={() => props.onClick(ContainerObjectType.cloud)}
      >
        Cloud
      </button>
    </div>
  );
}
