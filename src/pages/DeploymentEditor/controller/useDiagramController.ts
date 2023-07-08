import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { createDiagram, getId } from "../../../core/entities/Deployment";
import { createController } from "../../../shared/utils/createController";
import { PlantUMLEditorDatabaseIdentifier } from "../../../db";
import { listStoreIdentifier } from "../../../shared/store/listStore";
import { DiagramType } from "../../../shared/constants";
import { deploymentStoreIdentifier } from "../store/deploymentStore";
import { useService } from "../../../shared/libs/di/react/useService";
import { useDiagramListService } from "../../../shared/services/useDiagramListService";
import { useState } from "react";
import { debounceTime, Subject } from "rxjs";
import { useSubscription } from "observable-hooks";
import { UseDiagramServiceIdentifier } from "../service/useDiagramService";
import { produce } from "immer";
import { deploymentParser } from "../../../core/parser/deployment";
import { drawPng, drawSvg } from "../../../shared/utils/uml";

type Handlers = {
  handleDiagramInit(): Promise<void>;
  handleDiagramChange(): void;
  handleDeleteDiagram(): Promise<void>;
  handleAddDiagram(name: string): Promise<void>;
  handleCopyDiagram(): void;
};

export const useDiagramController = createController<[], Handlers>(() => {
  const deploymentStore = useService(deploymentStoreIdentifier);
  const listStore = useService(listStoreIdentifier);
  const db = useService(PlantUMLEditorDatabaseIdentifier);
  const listService = useDiagramListService();
  const useDiagramService = useService(UseDiagramServiceIdentifier);
  const diagramService = useDiagramService();

  const [diagramChange$] = useState(new Subject<void>());
  const [debounceChange$] = useState(
    diagramChange$.pipe(
      debounceTime(500) // 500ms 的防抖间隔
    )
  );

  useSubscription(debounceChange$, {
    next: () => {
      deploymentStore.setState((state) =>
        produce(state, (draft) => {
          const uml = deploymentParser.parseDiagram(draft.deployment);
          draft.svgUrl = drawSvg(uml);
          draft.pngUrl = drawPng(uml);
          draft.uml = uml;
        })
      );
      diagramService.save();
    },
  });

  const navigate = useNavigate();

  return {
    async handleDiagramInit() {
      listService.fetchList();
      diagramService.init().then((currentDiagram) => {
        if (!currentDiagram) return;
        deploymentStore.setState((state) =>
          produce(state, (draft) => {
            const storage = JSON.parse(currentDiagram.diagram);
            draft.deployment = storage;
            draft.currentObjectId = storage.root.id;
          })
        );
      });
    },
    async handleCopyDiagram() {
      deploymentStore.setState((state) =>
        produce(state, (draft) => {
          draft.deployment.id = `deployment_${getId()}`;
          draft.deployment.root.name = `${draft.deployment.root.name}（副本）`;
          db.deployments
            .add({
              id: draft.deployment.id,
              diagram: JSON.stringify(draft.deployment),
              name: draft.deployment.root.name,
            })
            .then(() => {
              navigate(`/${DiagramType.deployment}/${draft.deployment.id}`, {
                replace: true,
              });
            });
        })
      );
    },
    async handleDeleteDiagram() {
      if (listStore.getState().list.length <= 1) {
        message.warning("不能删除最后一个图表");
        return;
      }
      await db.deployments.delete(deploymentStore.getState().deployment.id);
      await listService.fetchList();
      const firstId = listStore.getState().list[0].id;
      navigate(`/${DiagramType.deployment}/${firstId}`, {
        replace: true,
      });
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
  };
});
