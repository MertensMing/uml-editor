import {
  BaseObject,
  ContainerObjectType,
  ObjectType,
} from "../../../core/entities/Deployment";
import { createController } from "../../../shared/utils/createController";
import { deploymentStoreIdentifier } from "../store/deploymentStore";
import { useService } from "../../../shared/libs/di/react/useService";
import { UseDiagramServiceIdentifier } from "../service/useDiagramService";

type Handlers = {
  handleAddContainer(containerId: string, type: ContainerObjectType): void;
  handleAddObject(containerId: string, type: ObjectType): void;
  handleObjectNameChange(objectId: string, name: string): void;
  handleObjectSelect(id: string): void;
  handleMoveObject(origin: string, target: string): void;
  handleDelete(objectId: string): void;
  handleCopy(objectId: string): void;
  handleSelectObjectBgColor(objectId: string, color: string): void;
  handleContentChange(objectId: string, content: string): void;
  handleObjectChange(
    objectId: string,
    field: "type" | keyof BaseObject | "isContainer" | "children",
    value: unknown
  ): void;
  handleSelectObjectTextColor(objectId: string, color: string): void;
};

export const useObjectController = createController<[], Handlers>(() => {
  const deploymentStore = useService(deploymentStoreIdentifier);
  const useDiagramService = useService(UseDiagramServiceIdentifier);
  const diagramService = useDiagramService();

  return {
    handleCopy(id) {
      deploymentStore.getState().copyObject(id);
    },
    handleAddContainer(id, type) {
      deploymentStore.getState().addContainer(id, type);
      diagramService.save();
    },
    handleAddObject(id, type) {
      deploymentStore.getState().addObject(id, type);
      diagramService.save();
    },
    handleObjectSelect(id) {
      deploymentStore.getState().updateCurrentObject(id);
    },
    handleMoveObject(origin, target) {
      deploymentStore.getState().moveObject(origin, target);
      diagramService.save();
    },
    handleObjectNameChange(id, name) {
      deploymentStore.getState().setObjectField(id, "name", name);
      diagramService.save();
    },
    handleDelete(id) {
      deploymentStore.getState().deleteObject(id);
      diagramService.save();
    },
    handleSelectObjectBgColor(id, color) {
      deploymentStore.getState().setObjectField(id, "bgColor", color);
      diagramService.save();
    },
    handleObjectChange(id, type, value) {
      deploymentStore.getState().setObjectField(id, type, value);
      diagramService.save();
    },
    handleContentChange(id, content) {
      deploymentStore.getState().setObjectField(id, "content", content);
      diagramService.save();
    },
    handleSelectObjectTextColor(id, color) {
      deploymentStore.getState().setObjectField(id, "textColor", color);
      diagramService.save();
    },
  };
});
