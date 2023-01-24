/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback } from "react";
import cloneDeep from "lodash/cloneDeep";
import { createLogic } from "../../../common/createLogic";
import { Activity, Task } from "../../../entities/Activity";
import { activityStorage } from "../../../storage/activity";
import { ActivityStore } from "../store/activity";
import { UndoStore } from "../store/undo";

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
};

export const useEditActivityLogic = createLogic<
  [ActivityStore, UndoStore<Activity>],
  Handlers
>(([activityStore, undoStore]) => {
  const activityStoreState = activityStore.getState();
  const undoStoreState = undoStore.getState();

  const saveChanged = () => {
    undoStoreState.save(cloneDeep(activityStoreState.activity));
  };

  return {
    handleMount() {
      activityStoreState.initializeActivity();
      undoStoreState.initialize([cloneDeep(activityStoreState.activity)]);
    },
    handleSelectTask(taskId) {
      activityStoreState.setCurrentTask(taskId);
    },
    handleActivityChange: useCallback(() => {
      activityStoreState.updateDiagramUrl();
      activityStorage.set(activityStoreState.activity);
    }, []),
    handleAddTask(taskId, type) {
      activityStoreState.addTask(taskId, type);
      saveChanged();
    },
    handleDeleteTask(taskId) {
      activityStoreState.deleteTask(taskId);
      saveChanged();
    },
    handleTaskNameChange(taskId, name) {
      activityStoreState.setTaskField(taskId, "name", name);
      saveChanged();
    },
    handleAddCondition(taskId, type) {
      activityStoreState.addCondition(taskId, type);
      saveChanged();
    },
    handleDeleteCondition(taskId, index) {
      activityStoreState.deleteCondition(taskId, index);
      saveChanged();
    },
    handleAddParallelTask(taskId, type) {
      activityStoreState.addParallelTask(taskId, type);
      saveChanged();
    },
    handleDeleteParallelTask(taskId, index) {
      activityStoreState.deleteParallelTask(taskId, index);
      saveChanged();
    },
    handleRedo() {
      undoStoreState.redo();
      activityStoreState.setActivity(cloneDeep(undoStoreState.current));
      activityStoreState.resetCurrentTask();
    },
    handleUndo() {
      undoStoreState.undo();
      activityStoreState.setActivity(cloneDeep(undoStoreState.current));
      activityStoreState.resetCurrentTask();
    },
    handleConditionTextChange(taskId, index, text) {
      activityStoreState.updateConditionText(taskId, index, text);
      saveChanged();
    },
    handleWhileConditionChange(taskId, yes, no) {
      activityStoreState.setWhileCondition(taskId, yes, no);
      saveChanged();
    },
  };
});
