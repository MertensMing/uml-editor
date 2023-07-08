import { useNavigate, useParams } from "react-router-dom";
import { message } from "antd";
import { createDiagram, LineType } from "../../../core/entities/Deployment";
import { deploymentUndoStoreIdentifier } from "../../../shared/store/undo";
import { createController } from "../../../shared/utils/createController";
import { useAction } from "../../../shared/hooks/useAction";
import { PlantUMLEditorDatabaseIdentifier } from "../../../db";
import { listStoreIdentifier } from "../../../shared/store/listStore";
import { DiagramType } from "../../../shared/constants";
import { deploymentStoreIdentifier } from "../store/deploymentStore";
import { useService } from "../../../shared/libs/di/react/useService";
import { useDiagramListService } from "../../../shared/services/useDiagramListService";
import { useState } from "react";
import { debounceTime, Subject } from "rxjs";
import { useSubscription } from "observable-hooks";

type Handlers = {
  handleDiagramInit(): Promise<void>;
  handleDiagramChange(): void;
  handleDeleteDiagram(): Promise<void>;
  handleAddDiagram(name: string): Promise<void>;
  handleCopyDiagram(): void;
  handleLineTypeChange(linetype: LineType): void;
};

export const useDiagramController = createController<[], Handlers>(() => {
  const deploymentStore = useService(deploymentStoreIdentifier);
  const listStore = useService(listStoreIdentifier);
  const undoStore = useService(deploymentUndoStoreIdentifier);
  const db = useService(PlantUMLEditorDatabaseIdentifier);
  const listService = useDiagramListService();
  const [diagramChange$] = useState(new Subject<void>());
  const [debounceChange$] = useState(
    diagramChange$.pipe(
      debounceTime(500) // 500ms 的防抖间隔
    )
  );

  useSubscription(debounceChange$, {
    next: () => {
      deploymentStore.getState().updateUmlUrl();
    },
  });

  const params = useParams();
  const navigate = useNavigate();

  const actions = useAction(deploymentStore, [
    "setLineType",
    "initializeDeployment",
    "copyDiagram",
  ]);
  const undoActions = useAction(undoStore, [
    "initialize",
    "redo",
    "save",
    "undo",
  ]);

  return {
    async handleDiagramInit() {
      const id = params.id;
      const diagram = await db.deployments.get(id ?? "");
      const diagramList = await db.deployments.toArray();
      const currentDiagram = diagram || diagramList[0];

      listService.fetchList();

      if (!currentDiagram) {
        // 创建新图表
        const diagram = createDiagram();
        await db.deployments.add({
          id: diagram.id,
          diagram: JSON.stringify(diagram),
          name: diagram.root.name,
        });
        navigate(`/${DiagramType.deployment}/${diagram.id}`, {
          replace: true,
        });
        return;
      }

      if (id) {
        // 初始化 store
        actions.initializeDeployment(JSON.parse(currentDiagram.diagram));
        undoActions.initialize([JSON.parse(currentDiagram.diagram)]);
      } else {
        navigate(`/${DiagramType.deployment}/${currentDiagram.id}`, {
          replace: true,
        });
      }
    },
    async handleCopyDiagram() {
      actions.copyDiagram();
      await db.deployments.add({
        id: deploymentStore.getState().deployment.id,
        diagram: JSON.stringify(deploymentStore.getState().deployment),
        name: deploymentStore.getState().deployment.root.name,
      });
      navigate(
        `/${DiagramType.deployment}/${
          deploymentStore.getState().deployment.id
        }`,
        {
          replace: true,
        }
      );
    },
    async handleDeleteDiagram() {
      if (listStore.getState().list.length <= 1) {
        message.warning("不能删除最后一个图表");
        return;
      }
      await db.deployments.delete(deploymentStore.getState().deployment.id);
      await listService.fetchList();
      navigate(
        `/${DiagramType.deployment}/${listStore.getState().list[0].id}`,
        {
          replace: true,
        }
      );
    },
    async handleAddDiagram(name) {
      const diagram = createDiagram(name);
      await db.deployments.add({
        id: diagram.id,
        diagram: JSON.stringify(diagram),
        name: diagram.root.name,
      });
      await listService.fetchList();
      navigate(`/${DiagramType.deployment}/${diagram.id}`, {
        replace: true,
      });
    },
    handleDiagramChange() {
      diagramChange$.next();
    },
    handleLineTypeChange(linetype) {
      actions.setLineType(linetype);
    },
  };
});
