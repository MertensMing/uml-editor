import { createLogic } from "../../../common/createLogic";
import { Task } from "../../../entities/Activity";
import { ActivityStore } from "../store/activity";

type Handlers = {
  handleMount(): void;
  handleActivityChange(): void;
  handleTitleChange(title: string): void;
  handleAddTask(taskId: Task["id"], type?: Task["type"]): void;
  handleDeleteTask(taskId: Task["id"]): void;
  handleSelectTask(taskId: Task["id"]): void;
  handleTaskNameChange(taskId: Task["id"], name: string): void;
  handleTaskSwimLaneChange(taskId: Task["id"], swimlane: string): void;
  handleAddCondition(taskId: Task["id"], type: Task["type"]): void;
  handleDeleteCondition(taskId: Task["id"], index: number): void;
  handleToggleInfiniteLoop(taskId: Task["id"], bool: boolean): void;
  handleToggleSwimlanes(bool: boolean): void;
  handleAddParallelTask(taskId: Task["id"], type: Task["type"]): void;
  handleDeleteParallelTask(taskId: Task["id"], index: number): void;
  handleRedo(): void;
  handleUndo(): void;
};

export const useEditActivityLogic = createLogic<[ActivityStore], Handlers>(
  ([activityStore]) => {
    return {
      handleMount() {
        activityStore.getState().initializeActivity();
      },
      handleActivityChange() {
        window.localStorage.setItem(
          "my_activity",
          JSON.stringify(activityStore.getState().activity)
        );
        activityStore.getState().setDiagramUrl();
      },
      handleTitleChange(title) {
        activityStore.getState().setActivityTitle(title);
      },
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
      handleTaskSwimLaneChange(taskId, name) {
        activityStore.getState().setTaskField(taskId, "swimlane", name);
      },
      handleAddCondition(taskId, type) {
        activityStore.getState().addCondition(taskId, type);
      },
      handleDeleteCondition(taskId, index) {
        activityStore.getState().deleteCondition(taskId, index);
      },
      handleToggleInfiniteLoop(taskId, bool) {
        activityStore.getState().setInfiniteLoop(taskId, bool);
      },
      handleToggleSwimlanes(bool) {
        activityStore.getState().activeSwimlanes(bool);
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
    };
  }
);
