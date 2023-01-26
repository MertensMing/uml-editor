import {
  BaseObject,
  ContainerObject,
  Deployment,
  NormalObject,
  Relation,
} from "../../../core/entities/Deployment";
import { UndoStore } from "../../../shared/store/undo";
import { createLogic } from "../../../shared/utils/createLogic";
import { DeploymentStore } from "../store/deploymentStore";
import cloneDeep from "lodash/cloneDeep";

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
  handleRedo(): void;
  handleUndo(): void;
};

export const useEditDeploymentLogic = createLogic<
  [DeploymentStore, UndoStore<Deployment>],
  Handlers
>(([deploymentStore, undoStore]) => {
  const saveChanged = () => {
    undoStore.getState().save(cloneDeep(deploymentStore.getState().deployment));
  };
  return {
    handleInit() {
      deploymentStore.getState().initializeDeployment();
      undoStore
        .getState()
        .initialize([cloneDeep(deploymentStore.getState().deployment)]);
    },
    handleDiagramChange() {
      deploymentStore.getState().updateUmlUrl();
    },
    handleAddContainer(id, type) {
      deploymentStore.getState().addContainer(id, type);
      saveChanged();
    },
    handleAddObject(id, type) {
      deploymentStore.getState().addObject(id, type);
      saveChanged();
    },
    handleObjectSelect(id) {
      deploymentStore.getState().updateCurrentObject(id);
      saveChanged();
    },
    handleDrop(origin, target) {
      if (deploymentStore.getState().allowDragRelation) {
        deploymentStore.getState().addRelation(origin, target);
      } else {
        deploymentStore.getState().moveObject(origin, target);
      }
      saveChanged();
    },
    handleObjectNameChange(id, name) {
      deploymentStore.getState().setObjectField(id, "name", name);
      saveChanged();
    },
    handleDelete(id) {
      deploymentStore.getState().deleteObject(id);
      saveChanged();
    },
    handleToggleAllowDragRelation(allow) {
      deploymentStore.getState().toggleAllowDragRelation(allow);
      saveChanged();
    },
    handleDeleteRelation(origin, to) {
      deploymentStore.getState().deleteRelation(origin, to);
      saveChanged();
    },
    handleSelectObjectBgColor(id, color) {
      deploymentStore.getState().setObjectField(id, "bgColor", color);
      saveChanged();
    },
    handleSelectObjectTextColor(id, color) {
      deploymentStore.getState().setObjectField(id, "textColor", color);
      saveChanged();
    },
    handleRelationChange(id, relationId, field, value) {
      deploymentStore.getState().updateRelation(id, relationId, field, value);
      saveChanged();
    },
    handleRedo() {
      undoStore.getState().redo();
      deploymentStore
        .getState()
        .setDiagram(cloneDeep(undoStore.getState().current));
    },
    handleUndo() {
      undoStore.getState().undo();
      deploymentStore
        .getState()
        .setDiagram(cloneDeep(undoStore.getState().current));
    },
  };
});
