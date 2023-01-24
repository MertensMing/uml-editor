/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback } from "react";
import { createLogic } from "../../../common/createLogic";
import { Task } from "../../../entities/Activity";
import { activityStorage } from "../../../storage/activity";
import { ActivityStore } from "../store/activity";

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

export const useEditActivityLogic = createLogic<[ActivityStore], Handlers>(
  ([activityStore]) => {
    return {
      handleMount() {
        activityStore.getState().initializeActivity();
      },
      handleActivityChange: useCallback(() => {
        activityStore.getState().updateDiagramUrl();
        activityStorage.set(activityStore.getState().activity);
      }, []),
      handleAddTask(taskId, type) {
        activityStore.getState().addTask(taskId, type);
      },
      handleDeleteTask(taskId) {
        activityStore.getState().deleteTask(taskId);
      },
      handleSelectTask(taskId) {
        activityStore.getState().setCurrentTask(taskId);
      },
      handleTaskNameChange(taskId, name) {
        activityStore.getState().setTaskField(taskId, "name", name);
      },
      handleAddCondition(taskId, type) {
        activityStore.getState().addCondition(taskId, type);
      },
      handleDeleteCondition(taskId, index) {
        activityStore.getState().deleteCondition(taskId, index);
      },
      handleAddParallelTask(taskId, type) {
        activityStore.getState().addParallelTask(taskId, type);
      },
      handleDeleteParallelTask(taskId, index) {
        activityStore.getState().deleteParallelTask(taskId, index);
      },
      handleRedo() {
        activityStore.getState().redo();
      },
      handleUndo() {
        activityStore.getState().undo();
      },
      handleConditionTextChange(taskId, index, text) {
        activityStore.getState().updateConditionText(taskId, index, text);
      },
      handleWhileConditionChange(taskId, yes, no) {
        activityStore.getState().setWhileCondition(taskId, yes, no);
      },
    };
  }
);
