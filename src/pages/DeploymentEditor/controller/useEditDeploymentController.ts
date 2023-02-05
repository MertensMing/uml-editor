import { useNavigate, useParams } from "react-router-dom";
import { DeploymentStore } from "../store/deploymentStore";
import cloneDeep from "lodash/cloneDeep";
import {
  ContainerObject,
  Deployment,
  LineType,
  NormalObject,
  Relation,
} from "../../../core/entities/Deployment";
import { UndoStore } from "../../../shared/store/undo";
import { createController } from "../../../shared/utils/createController";
import { useAction } from "../../../shared/hooks/useAction";
import { deploymentHistoryStorage } from "../../../shared/storage/deployment";
import { db } from "../../../db";
import { ListStore } from "../../../shared/store/listStore";

type Handlers = {
  handleInit(): Promise<void>;
  handleDiagramChange(): void;
  handleAddContainer(containerId: string, type: ContainerObject["type"]): void;
  handleAddObject(containerId: string, type: NormalObject["type"]): void;
  handleObjectNameChange(objectId: string, name: string): void;
  handleObjectSelect(id: string): void;
  handleDrop(origin: string, target: string): void;
  handleDeleteRelation(origin: string, target: string): void;
  handleDelete(objectId: string): void;
  handleToggleAllowDragRelation(allow: boolean): void;
  handleSelectObjectBgColor(objectId: string, color: string): void;
  handleContentChange(objectId: string, content: string): void;
  handleSelectObjectTextColor(objectId: string, color: string): void;
  handleRelationChange<T extends keyof Relation>(
    id: string,
    relationId: string,
    field: T,
    value: Relation[T]
  ): void;
  handleRedo(): void;
  handleUndo(): void;
  handleLineTypeChange(linetype: LineType): void;
};

export const useEditDeploymentController = createController<
  [DeploymentStore, UndoStore<Deployment>, ListStore],
  Handlers
>(([deploymentStore, undoStore, listStore]) => {
  const saveChanged = () => {
    const state = deploymentStore.getState();
    const deployment = state.deployment;
    undoStore.getState().save(deployment);
    deploymentHistoryStorage.set(undoStore.getState().queue);
    db.deployments.update(deployment.id, {
      diagram: JSON.stringify(deployment),
      name: deployment.root.name,
    });
    listStore.getState().fetchList();
  };

  const params = useParams();
  const navigate = useNavigate();

  const actions = useAction(deploymentStore, [
    "setLineType",
    "initializeDeployment",
  ]);
  const undoActions = useAction(undoStore, [
    "initialize",
    "redo",
    "save",
    "undo",
  ]);

  return {
    async handleInit() {
      const state = deploymentStore.getState();
      const id = params.id;
      const diagram = await db.deployments.get(id ?? "");
      const list = await db.deployments.toArray();
      if (!id && !diagram && !list.length) {
        actions.initializeDeployment();
        await db.deployments.add({
          id: state.deployment.id,
          diagram: JSON.stringify(state.deployment),
          name: state.deployment.root.name,
        });
        navigate(`/deployment/${state.deployment.id}`);
        return;
      }
      actions.initializeDeployment(
        JSON.parse(diagram?.diagram || list[0].diagram)
      );
      undoActions.initialize([state.deployment]);
      if (!id) {
        navigate(`/deployment/${state.deployment.id}`);
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
