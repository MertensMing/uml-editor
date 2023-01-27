/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback } from "react";
import cloneDeep from "lodash/cloneDeep";
import { createLogic } from "../../../shared/utils/createLogic";
import { Activity, Task } from "../../../core/entities/Activity";
import { activityStorage } from "../../../shared/storage/activity";
import { ActivityStore } from "../store/activity";
import { UndoStore } from "../../../shared/store/undo";

type Handlers = {
  handleMount(): void;
  handleActivityChange(): void;
  handleAddTask(taskId: Task["id"], type?: Task["type"]): void;
  handleDeleteTask(taskId: Task["id"]): void;
  handleSelectTask(taskId: Task["id"]): void;
  handleTaskNameChange(taskId: Task["id"], name: string): void;
  handleAddCondition(taskId: Task["id"], type: Task["type"]): void;
  handleDeleteCondition(taskId: Task["id"], index: number): void;
  handleConditionTextChange(
    taskId: Task["id"],
    index: number,
    text: string
  ): void;
  handleAddParallelTask(taskId: Task["id"], type: Task["type"]): void;
  handleDeleteParallelTask(taskId: Task["id"], index: number): void;
  handleRedo(): void;
  handleUndo(): void;
  handleWhileConditionChange(taskId: Task["id"], yes: string, no: string): void;
  handleMove(origin: Task["id"], target: Task["id"]): void;
};

export const useEditActivityLogic = createLogic<
  [ActivityStore, UndoStore<Activity>],
  Handlers
>(([activityStore, undoStore]) => {
  const saveChanged = () => {
    undoStore.getState().save(cloneDeep(activityStore.getState().activity));
  };

  return {
    handleMount() {
      activityStore.getState().initializeActivity();
      undoStore
        .getState()
        .initialize([cloneDeep(activityStore.getState().activity)]);
    },
    handleSelectTask(taskId) {
      activityStore.getState().setCurrentTask(taskId);
    },
    handleActivityChange: useCallback(() => {
      activityStore.getState().updateDiagramUrl();
      activityStorage.set(activityStore.getState().activity);
    }, []),
    handleAddTask(taskId, type) {
      activityStore.getState().addTask(taskId, type);
      saveChanged();
    },
    handleDeleteTask(taskId) {
      activityStore.getState().deleteTask(taskId);
      saveChanged();
    },
    handleTaskNameChange(taskId, name) {
      activityStore.getState().setTaskField(taskId, "name", name);
      saveChanged();
    },
    handleAddCondition(taskId, type) {
      activityStore.getState().addCondition(taskId, type);
      saveChanged();
    },
    handleDeleteCondition(taskId, index) {
      activityStore.getState().deleteCondition(taskId, index);
      saveChanged();
    },
    handleAddParallelTask(taskId, type) {
      activityStore.getState().addParallelTask(taskId, type);
      saveChanged();
    },
    handleDeleteParallelTask(taskId, index) {
      activityStore.getState().deleteParallelTask(taskId, index);
      saveChanged();
    },
    handleRedo() {
      undoStore.getState().redo();
      activityStore
        .getState()
        .setActivity(cloneDeep(undoStore.getState().current));
      activityStore.getState().resetCurrentTask();
    },
    handleUndo() {
      undoStore.getState().undo();
      activityStore
        .getState()
        .setActivity(cloneDeep(undoStore.getState().current));
      activityStore.getState().resetCurrentTask();
    },
    handleConditionTextChange(taskId, index, text) {
      activityStore.getState().updateConditionText(taskId, index, text);
      saveChanged();
    },
    handleWhileConditionChange(taskId, yes, no) {
      activityStore.getState().setWhileCondition(taskId, yes, no);
      saveChanged();
    },
    handleMove(origin, target) {
      activityStore.getState().moveTask(origin, target);
      saveChanged();
    },
  };
});
