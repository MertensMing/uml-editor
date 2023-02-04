import {
  BaseObject,
  ContainerObject,
  Deployment,
  LineType,
  NormalObject,
  Relation,
} from "../../../core/entities/Deployment";
import { UndoStore } from "../../../shared/store/undo";
import { createLogic } from "../../../shared/utils/createLogic";
import { DeploymentStore } from "../store/deploymentStore";
import cloneDeep from "lodash/cloneDeep";
import { useAction } from "../../../shared/hooks/useAction";
import { deploymentHistoryStorage } from "../../../shared/storage/deployment";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../../db";
import { ListStore } from "../../../shared/store/listStore";

type Handlers = {
  handleInit(): Promise<void>;
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
  handleContentChange(objectId: BaseObject["id"], content: string): void;
  handleSelectObjectTextColor(objectId: BaseObject["id"], color: string): void;
  handleRelationChange<T extends keyof Relation>(
    id: ContainerObject["id"],
    relationId: Relation["id"],
    field: T,
    value: Relation[T]
  ): void;
  handleRedo(): void;
  handleUndo(): void;
  handleLineTypeChange(linetype: LineType): void;
};

export const useEditDeploymentLogic = createLogic<
  [DeploymentStore, UndoStore<Deployment>, ListStore],
  Handlers
>(([deploymentStore, undoStore, listStore]) => {
  const saveChanged = () => {
    const deployment = deploymentStore.getState().deployment;
    undoStore.getState().save(cloneDeep(deployment));
    deploymentHistoryStorage.set(undoStore.getState().queue);
    db.deployments.update(deployment.id, {
      diagram: JSON.stringify(deployment),
      name: deployment.root.name,
    });
    listStore.getState().fetchList();
  };

  const params = useParams();
  const actions = useAction(deploymentStore, ["setLineType"]);
  const navigate = useNavigate();

  return {
    async handleInit() {
      const id = params.id;
      const diagram = await db.deployments.get(id ?? "");
      const list = await db.deployments.toArray();
      if (!id && !diagram && !list.length) {
        deploymentStore.getState().initializeDeployment();
        await db.deployments.add({
          id: deploymentStore.getState().deployment.id,
          diagram: JSON.stringify(deploymentStore.getState().deployment),
          name: deploymentStore.getState().deployment.root.name,
        });
        navigate(`/deployment/${deploymentStore.getState().deployment.id}`);
        return;
      }
      deploymentStore
        .getState()
        .initializeDeployment(JSON.parse(diagram?.diagram || list[0].diagram));
      undoStore
        .getState()
        .initialize([cloneDeep(deploymentStore.getState().deployment)]);
      if (!id) {
        navigate(`/deployment/${deploymentStore.getState().deployment.id}`);
      }
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
    handleContentChange(id, content) {
      deploymentStore.getState().setObjectField(id, "content", content);
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
    handleLineTypeChange(linetype) {
      actions.setLineType(linetype);
    },
  };
});
