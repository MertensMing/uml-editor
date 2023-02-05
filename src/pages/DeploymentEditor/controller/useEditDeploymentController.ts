import { useNavigate, useParams } from "react-router-dom";
import { useRef } from "react";
import cloneDeep from "lodash/cloneDeep";
import debounce from "lodash/debounce";
import {
  ContainerObjectType,
  Deployment,
  LineType,
  ObjectType,
  Relation,
} from "../../../core/entities/Deployment";
import { UndoStore } from "../../../shared/store/undo";
import { createController } from "../../../shared/utils/createController";
import { useAction } from "../../../shared/hooks/useAction";
import { db } from "../../../db";
import { ListStore } from "../../../shared/store/listStore";
import { DiagramType } from "../../../shared/constants";
import { DeploymentStore } from "../store/deploymentStore";

type Handlers = {
  // 图表
  handleInit(): Promise<void>;
  handleDiagramChange(): void;
  handleDeleteDiagram(): Promise<void>;
  handleToggleAllowDragRelation(allow: boolean): void;
  handleRedo(): void;
  handleUndo(): void;
  // 对象和容器
  handleAddContainer(containerId: string, type: ContainerObjectType): void;
  handleAddObject(containerId: string, type: ObjectType): void;
  handleObjectNameChange(objectId: string, name: string): void;
  handleObjectSelect(id: string): void;
  handleDrop(origin: string, target: string): void;
  handleDelete(objectId: string): void;
  handleSelectObjectBgColor(objectId: string, color: string): void;
  handleContentChange(objectId: string, content: string): void;
  handleSelectObjectTextColor(objectId: string, color: string): void;
  handleLineTypeChange(linetype: LineType): void;
  // 关系
  handleDeleteRelation(origin: string, target: string): void;
  handleRelationChange<T extends keyof Relation>(
    id: string,
    relationId: string,
    field: T,
    value: Relation[T]
  ): void;
};

export const useEditDeploymentController = createController<
  [DeploymentStore, UndoStore<Deployment>, ListStore],
  Handlers
>(([deploymentStore, undoStore, listStore]) => {
  const saveChanged = useRef(
    debounce(() => {
      const state = deploymentStore.getState();
      const deployment = state.deployment;
      undoStore.getState().save(deployment);
      db.deployments.update(deployment.id, {
        diagram: JSON.stringify(deployment),
        name: deployment.root.name,
      });
      listStore.getState().fetchList();
    }, 1000)
  ).current;

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
      const id = params.id;
      const diagram = await db.deployments.get(id ?? "");
      const diagramList = await db.deployments.toArray();
      const currentDiagram = diagram || diagramList[0];

      if (!currentDiagram) {
        // 创建新图表
        actions.initializeDeployment();
        await db.deployments.add({
          id: deploymentStore.getState().deployment.id,
          diagram: JSON.stringify(deploymentStore.getState().deployment),
          name: deploymentStore.getState().deployment.root.name,
        });
        navigate(
          `/${DiagramType.deployment}/${
            deploymentStore.getState().deployment.id
          }`
        );
        return;
      }

      // 初始化 store
      actions.initializeDeployment(JSON.parse(currentDiagram.diagram));
      undoActions.initialize([deploymentStore.getState().deployment]);

      if (!id) {
        navigate(
          `/${DiagramType.deployment}/${
            deploymentStore.getState().deployment.id
          }`
        );
      }
    },
    async handleDeleteDiagram() {
      const state = deploymentStore.getState();
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
      saveChanged();
    },
    handleUndo() {
      undoStore.getState().undo();
      deploymentStore
        .getState()
        .setDiagram(cloneDeep(undoStore.getState().current));
      saveChanged();
    },
    handleLineTypeChange(linetype) {
      actions.setLineType(linetype);
      saveChanged();
    },
  };
});
