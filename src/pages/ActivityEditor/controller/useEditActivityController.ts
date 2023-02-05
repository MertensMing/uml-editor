import { useCallback } from "react";
import cloneDeep from "lodash/cloneDeep";
import { createController } from "../../../shared/utils/createController";
import { Activity, Task } from "../../../core/entities/Activity";
import { activityStorage } from "../../../shared/storage/activity";
import { ActivityStore } from "../store/activity";
import { UndoStore } from "../../../shared/store/undo";
import { useAction } from "../../../shared/hooks/useAction";

type Handlers = {
  handleMount(): void;
  handleActivityChange(): void;
  handleAddTask(taskId: string, type?: Task["type"]): void;
  handleDeleteTask(taskId: string): void;
  handleSelectTask(taskId: string): void;
  handleTaskNameChange(taskId: string, name: string): void;
  handleAddCondition(taskId: string, type: Task["type"]): void;
  handleDeleteCondition(taskId: string, index: number): void;
  handleConditionTextChange(taskId: string, index: number, text: string): void;
  handleAddParallelTask(taskId: string, type: Task["type"]): void;
  handleDeleteParallelTask(taskId: string, index: number): void;
  handleRedo(): void;
  handleUndo(): void;
  handleWhileConditionChange(taskId: string, yes: string, no: string): void;
  handleMove(origin: string, target: string): void;
};

export const useEditActivityController = createController<
  [ActivityStore, UndoStore<Activity>],
  Handlers
>(([activityStore, undoStore]) => {
  const actions = useAction(activityStore, [
    "initializeActivity",
    "setCurrentTask",
    "updateDiagramUrl",
    "deleteTask",
    "addTask",
    "setTaskField",
    "addCondition",
    "deleteCondition",
    "addParallelTask",
    "deleteParallelTask",
    "setActivity",
    "resetCurrentTask",
    "updateConditionText",
    "setWhileCondition",
    "moveTask",
  ]);

  const undoActions = useAction(undoStore, [
    "initialize",
    "save",
    "redo",
    "undo",
  ]);

  const saveChanged = () => {
    undoActions.save(cloneDeep(activityStore.getState().activity));
  };

  return {
    handleMount() {
      actions.initializeActivity();
      undoActions.initialize([cloneDeep(activityStore.getState().activity)]);
    },
    handleSelectTask(taskId) {
      actions.setCurrentTask(taskId);
    },
    handleActivityChange: useCallback(() => {
      actions.updateDiagramUrl();
      activityStorage.set(activityStore.getState().activity);
    }, []),
    handleAddTask(taskId, type) {
      actions.addTask(taskId, type);
      saveChanged();
    },
    handleDeleteTask(taskId) {
      actions.deleteTask(taskId);
      saveChanged();
    },
    handleTaskNameChange(taskId, name) {
      actions.setTaskField(taskId, "name", name);
      saveChanged();
    },
    handleAddCondition(taskId, type) {
      actions.addCondition(taskId, type);
      saveChanged();
    },
    handleDeleteCondition(taskId, index) {
      actions.deleteCondition(taskId, index);
      saveChanged();
    },
    handleAddParallelTask(taskId, type) {
      actions.addParallelTask(taskId, type);
      saveChanged();
    },
    handleDeleteParallelTask(taskId, index) {
      actions.deleteParallelTask(taskId, index);
      saveChanged();
    },
    handleRedo() {
      undoActions.redo();
      actions.setActivity(cloneDeep(undoStore.getState().current));
      actions.resetCurrentTask();
    },
    handleUndo() {
      undoActions.undo();
      actions.setActivity(cloneDeep(undoStore.getState().current));
      actions.resetCurrentTask();
    },
    handleConditionTextChange(taskId, index, text) {
      actions.updateConditionText(taskId, index, text);
      saveChanged();
    },
    handleWhileConditionChange(taskId, yes, no) {
      actions.setWhileCondition(taskId, yes, no);
      saveChanged();
    },
    handleMove(origin, target) {
      actions.moveTask(origin, target);
      saveChanged();
    },
  };
});
