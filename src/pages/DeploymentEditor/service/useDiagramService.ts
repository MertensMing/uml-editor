import { useState } from "react";
import { PlantUMLEditorDatabaseIdentifier } from "../../../db";
import { deploymentStoreIdentifier } from "../store/deploymentStore";
import { useService } from "../../../shared/libs/di/react/useService";
import { createServiceIdentifier } from "../../../shared/libs/di/utils/createServiceIdentifier";
import { debounceTime, Subject } from "rxjs";
import { useSubscription } from "observable-hooks";
import { useParams } from "react-router";
import { createDiagram } from "../../../core/entities/Deployment";

export const useDiagramService = () => {
  const deploymentStore = useService(deploymentStoreIdentifier);
  const params = useParams();
  const db = useService(PlantUMLEditorDatabaseIdentifier);
  const [save$] = useState(new Subject<void>());
  const [debouncedSave$] = useState(save$.pipe(debounceTime(500)));

  useSubscription(debouncedSave$, {
    next() {
      const state = deploymentStore.getState();
      const deployment = state.deployment;
      db.deployments.update(deployment.id, {
        diagram: JSON.stringify(deployment),
        name: deployment.root.name,
      });
    },
  });

  return {
    save() {
      save$.next();
    },
    async init() {
      const id = params.id;
      const diagram = await db.deployments.get(id ?? "");
      const diagramList = await db.deployments.toArray();
      const currentDiagram = diagram || diagramList[0];
      if (!currentDiagram) {
        // 创建新图表
        const diagram = createDiagram();
        await db.deployments.add({
          id: diagram.id,
          diagram: JSON.stringify(diagram),
          name: diagram.root.name,
        });
        return diagram.id;
      }
      if (id) {
        return currentDiagram;
      }
      return currentDiagram.id;
    },
  };
};

export const UseDiagramServiceIdentifier = createServiceIdentifier<
  typeof useDiagramService
>("UseDiagramServiceIdentifer");
