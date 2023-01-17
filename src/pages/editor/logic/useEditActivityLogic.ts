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
  handleAddCondition(taskId: string): void;
  handleDeleteCondition(taskId: string, index: number): void;
  handleToggleEndless(taskId: string, bool: boolean): void;
};

export const useEditActivityLogic = createLogic<[ActivityStore], Handlers>(
  ([activityStore]) => {
    return {
      handleMount() {
        activityStore.getState().initializeActivity();
      },
      handleActivityChange() {
        activityStore.getState().setUmlUrl();
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
        activityStore.getState().setTaskName(taskId, name);
      },
      handleAddCondition(taskId) {
        activityStore.getState().addCondition(taskId);
      },
      handleDeleteCondition(taskId, index) {
        activityStore.getState().deleteCondition(taskId, index);
      },
      handleToggleEndless(taskId, bool) {
        activityStore.getState().setEndless(taskId, bool);
      },
    };
  }
);
