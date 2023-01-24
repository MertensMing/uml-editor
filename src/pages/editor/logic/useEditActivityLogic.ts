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
  const undoSave = () => {
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
      undoSave();
    },
    handleDeleteTask(taskId) {
      activityStore.getState().deleteTask(taskId);
      undoSave();
    },
    handleTaskNameChange(taskId, name) {
      activityStore.getState().setTaskField(taskId, "name", name);
      undoSave();
    },
    handleAddCondition(taskId, type) {
      activityStore.getState().addCondition(taskId, type);
      undoSave();
    },
    handleDeleteCondition(taskId, index) {
      activityStore.getState().deleteCondition(taskId, index);
      undoSave();
    },
    handleAddParallelTask(taskId, type) {
      activityStore.getState().addParallelTask(taskId, type);
      undoSave();
    },
    handleDeleteParallelTask(taskId, index) {
      activityStore.getState().deleteParallelTask(taskId, index);
      undoSave();
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
      undoSave();
    },
    handleWhileConditionChange(taskId, yes, no) {
      activityStore.getState().setWhileCondition(taskId, yes, no);
      undoSave();
    },
  };
});
