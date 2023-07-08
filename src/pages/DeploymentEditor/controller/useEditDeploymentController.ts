import {
  BaseObject,
  ContainerObjectType,
  ObjectType,
  Relation,
} from "../../../core/entities/Deployment";
import { createController } from "../../../shared/utils/createController";
import { deploymentStoreIdentifier } from "../store/deploymentStore";
import { useService } from "../../../shared/libs/di/react/useService";
import { UseDiagramServiceIdentifier } from "../service/useDiagramService";

type Handlers = {
  handleAddRelation(origin: string, target: string): void;
  handleDeleteRelation(origin: string, target: string): void;
  handleRelationChange<T extends keyof Relation>(
    id: string,
    relationId: string,
    field: T,
    value: Relation[T]
  ): void;
};

export const useEditDeploymentController = createController<[], Handlers>(
  () => {
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
        diagramService.save();
      },
      handleAddRelation(origin, target) {
        deploymentStore.getState().addRelation(origin, target);
        diagramService.save();
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
      handleToggleAllowDragRelation(allow) {
        deploymentStore.getState().toggleAllowDragRelation(allow);
        diagramService.save();
      },
      handleDeleteRelation(origin, to) {
        deploymentStore.getState().deleteRelation(origin, to);
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
      handleRelationChange(id, relationId, field, value) {
        deploymentStore.getState().updateRelation(id, relationId, field, value);
        diagramService.save();
      },
    };
  }
);
