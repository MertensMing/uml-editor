import { createLogic } from "../../../common/createLogic";
import { TaskType } from "../../../entities/Activity";
import { ActivityStore } from "../store/activity";

type Handlers = {
  handleMount(): void;
  handleActivityChange(): void;
  handleTitleChange(title: string): void;
  handleAddTask(taskId: string, type?: TaskType): void;
  handleDeleteTask(taskId: string): void;
  handleSelectTask(taskId: string): void;
  handleTaskNameChange(taskId: string, name: string): void;
  handleTaskSwimLaneChange(taskId: string, swimlane: string): void;
  handleAddCondition(taskId: string, type: TaskType): void;
  handleDeleteCondition(taskId: string, index: number): void;
  handleToggleInfiniteLoop(taskId: string, bool: boolean): void;
  handleToggleSwimlanes(bool: boolean): void;
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
    };
  }
);
