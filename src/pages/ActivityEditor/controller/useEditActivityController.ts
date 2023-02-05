import { useCallback } from "react";
import cloneDeep from "lodash/cloneDeep";
import { createController } from "../../../shared/utils/createController";
import {
  Activity,
  createTask,
  StartTask,
  Task,
  TaskType,
} from "../../../core/entities/Activity";
import { activityStorage } from "../../../shared/storage/activity";
import { ActivityStore } from "../store/activity";
import { UndoStore } from "../../../shared/store/undo";
import { useAction } from "../../../shared/hooks/useAction";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../../db";
import { nanoid } from "nanoid";
import { ListStore } from "../../../shared/store/listStore";
import { DiagramType } from "../../../shared/constants";
import { message } from "antd";

type Handlers = {
  handleMount(): Promise<void>;
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
  handleTitleChange(title: string): void;
  handleAddActivity(name: string): void;
  handleDeleteDiagram(): Promise<void>;
};

export const useEditActivityController = createController<
  [ActivityStore, UndoStore<Activity>, ListStore],
  Handlers
>(([activityStore, undoStore, listStore]) => {
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
    "setActivityTitle",
  ]);

  const undoActions = useAction(undoStore, [
    "initialize",
    "save",
    "redo",
    "undo",
  ]);

  const navigate = useNavigate();

  const params = useParams();

  const saveChanged = () => {
    const { activity } = activityStore.getState();
    undoActions.save(cloneDeep(activity));
    db.activities.update(activity.id, {
      diagram: JSON.stringify(activity),
      name: activity.title,
    });
    listStore.getState().fetchList();
  };

  return {
    handleTitleChange(title: string) {
      actions.setActivityTitle(title);
      saveChanged();
    },
    async handleDeleteDiagram() {
      if (listStore.getState().list.length <= 1) {
        message.warning("不能删除最后一个图表");
        return;
      }
      await db.activities.delete(activityStore.getState().activity.id);
      await listStore.getState().fetchList();
      navigate(`/${DiagramType.activity}/${listStore.getState().list[0].id}`, {
        replace: true,
      });
    },
    async handleMount() {
      listStore.getState().setCurrentType(DiagramType.activity);

      const id = params.id;
      const diagram = await db.activities.get(id ?? "");
      const diagramList = await db.activities.toArray();
      const currentDiagram = diagram || diagramList[0];
      if (!currentDiagram) {
        const activity: Activity = {
          start: createTask(TaskType.start) as StartTask,
          id: nanoid(),
          title: "流程图",
        };
        await db.activities.add({
          id: activity.id,
          diagram: JSON.stringify(activity),
          name: activity.title,
        });
        return;
      }
      actions.initializeActivity(JSON.parse(currentDiagram.diagram));
      undoActions.initialize([JSON.parse(currentDiagram.diagram)]);
      navigate(`/${DiagramType.activity}/${currentDiagram.id}`, {
        replace: true,
      });
    },
    async handleAddActivity(name: string) {
      const diagram: Activity = {
        start: createTask(TaskType.start) as StartTask,
        id: nanoid(),
        title: name,
      };
      await db.activities.add({
        id: diagram.id,
        diagram: JSON.stringify(diagram),
        name: diagram.title,
      });
      await listStore.getState().fetchList();
      navigate(`/${DiagramType.activity}/${diagram.id}`, {
        replace: true,
      });
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
