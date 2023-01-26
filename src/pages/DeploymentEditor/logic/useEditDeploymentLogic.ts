import {
  BaseObject,
  ContainerObject,
  NormalObject,
  Relation,
} from "../../../core/entities/Deployment";
import { createLogic } from "../../../shared/utils/createLogic";
import { DeploymentStore } from "../store/deploymentStore";

type Handlers = {
  handleInit(): void;
  handleDiagramChange(): void;
  handleAddContainer(
    containerId: ContainerObject["id"],
    type: ContainerObject["type"]
  ): void;
  handleAddObject(
    containerId: ContainerObject["id"],
    type: NormalObject["type"]
  ): void;
  handleObjectNameChange(
    objectId: BaseObject["id"],
    name: BaseObject["name"]
  ): void;
  handleObjectSelect(id: BaseObject["id"]): void;
  handleDrop(origin: BaseObject["id"], target: BaseObject["id"]): void;
  handleDeleteRelation(
    origin: BaseObject["id"],
    target: BaseObject["id"]
  ): void;
  handleDelete(objectId: BaseObject["id"]): void;
  handleToggleAllowDragRelation(allow: boolean): void;
  handleSelectObjectBgColor(objectId: BaseObject["id"], color: string): void;
  handleSelectObjectTextColor(objectId: BaseObject["id"], color: string): void;
  handleRelationChange<T extends keyof Relation>(
    id: ContainerObject["id"],
    relationId: Relation["id"],
    field: T,
    value: Relation[T]
  ): void;
};

export const useEditDeploymentLogic = createLogic<[DeploymentStore], Handlers>(
  ([deploymentStore]) => {
    return {
      handleInit() {
        deploymentStore.getState().initializeDeployment();
      },
      handleDiagramChange() {
        deploymentStore.getState().updateUmlUrl();
      },
      handleAddContainer(id, type) {
        deploymentStore.getState().addContainer(id, type);
      },
      handleAddObject(id, type) {
        deploymentStore.getState().addObject(id, type);
      },
      handleObjectSelect(id) {
        deploymentStore.getState().updateCurrentObject(id);
      },
      handleDrop(origin, target) {
        if (deploymentStore.getState().allowDragRelation) {
          deploymentStore.getState().addRelation(origin, target);
        } else {
          deploymentStore.getState().moveObject(origin, target);
        }
      },
      handleObjectNameChange(id, name) {
        deploymentStore.getState().setObjectField(id, "name", name);
      },
      handleDelete(id) {
        deploymentStore.getState().deleteObject(id);
      },
      handleToggleAllowDragRelation(allow) {
        deploymentStore.getState().toggleAllowDragRelation(allow);
      },
      handleDeleteRelation(origin, to) {
        deploymentStore.getState().deleteRelation(origin, to);
      },
      handleSelectObjectBgColor(id, color) {
        deploymentStore.getState().setObjectField(id, "bgColor", color);
      },
      handleSelectObjectTextColor(id, color) {
        deploymentStore.getState().setObjectField(id, "textColor", color);
      },
      handleRelationChange(id, relationId, field, value) {
        deploymentStore.getState().updateRelation(id, relationId, field, value);
      },
    };
  }
);
