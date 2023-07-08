import { useRef } from "react";
import debounce from "lodash/debounce";
import {
  BaseObject,
  ContainerObjectType,
  LineType,
  ObjectType,
  Relation,
} from "../../../core/entities/Deployment";
import { deploymentUndoStoreIdentifier } from "../../../shared/store/undo";
import { createController } from "../../../shared/utils/createController";
import { useAction } from "../../../shared/hooks/useAction";
import { db } from "../../../db";
import { listStoreIdentifier } from "../../../shared/store/listStore";
import { deploymentStoreIdentifier } from "../store/deploymentStore";
import { useService } from "../../../shared/libs/di/react/useService";
import { useDiagramListService } from "../../../shared/services/useDiagramListService";

type Handlers = {
  handleToggleAllowDragRelation(allow: boolean): void;
  handleAddContainer(containerId: string, type: ContainerObjectType): void;
  handleAddObject(containerId: string, type: ObjectType): void;
  handleObjectNameChange(objectId: string, name: string): void;
  handleObjectSelect(id: string): void;
  handleAddRelation(origin: string, target: string): void;
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

  // 关系
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
    const listStore = useService(listStoreIdentifier);
    const undoStore = useService(deploymentUndoStoreIdentifier);
    const listService = useDiagramListService();

    const saveChanged = useRef(
      debounce((needSaveUndo?: boolean) => {
        needSaveUndo = needSaveUndo ?? true;
        const state = deploymentStore.getState();
        const deployment = state.deployment;
        if (needSaveUndo) {
          undoStore.getState().save(deployment);
        }
        db.deployments.update(deployment.id, {
          diagram: JSON.stringify(deployment),
          name: deployment.root.name,
        });
        listService.fetchList();
      }, 1000)
    ).current;

    const actions = useAction(deploymentStore, [
      "setLineType",
      "initializeDeployment",
      "copyDiagram",
    ]);

    return {
      handleCopy(id) {
        deploymentStore.getState().copyObject(id);
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
      handleAddRelation(origin, target) {
        deploymentStore.getState().addRelation(origin, target);
        saveChanged();
      },
      handleMoveObject(origin, target) {
        deploymentStore.getState().moveObject(origin, target);
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
      handleObjectChange(id, type, value) {
        deploymentStore.getState().setObjectField(id, type, value);
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
    };
  }
);
