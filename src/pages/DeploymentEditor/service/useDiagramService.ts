import { useRef, useState } from "react";
import debounce from "lodash/debounce";
import { deploymentUndoStoreIdentifier } from "../../../shared/store/undo";
import { db } from "../../../db";
import { deploymentStoreIdentifier } from "../store/deploymentStore";
import { useService } from "../../../shared/libs/di/react/useService";
import { useDiagramListServiceIdentifier } from "../../../shared/services/useDiagramListService";
import { createServiceIdentifier } from "../../../shared/libs/di/utils/createServiceIdentifier";
import { debounceTime, Subject } from "rxjs";
import { useSubscription } from "observable-hooks";

export const useDiagramService = () => {
  const deploymentStore = useService(deploymentStoreIdentifier);
  const undoStore = useService(deploymentUndoStoreIdentifier);
  const useDiagramListService = useService(useDiagramListServiceIdentifier);
  const listService = useDiagramListService();

  const [save$] = useState(new Subject<boolean>());
  const [debouncedSave$] = useState(save$.pipe(debounceTime(500)));

  useSubscription(debouncedSave$, {
    next(needSaveUndo?: boolean) {
      needSaveUndo = needSaveUndo ?? true;
      const state = deploymentStore.getState();
      const deployment = state.deployment;
      if (needSaveUndo) {
        undoStore.getState().save(deployment);
      }
      db.deployments.update(deployment.id, {
        diagram: JSON.stringify(deployment),
        name: deployment.root.name,
      });
      listService.fetchList();
    },
  });

  return {
    save(needSaveUndo?: boolean) {
      save$.next(needSaveUndo);
    },
  };
};

export const UseDiagramServiceIdentifier = createServiceIdentifier<
  typeof useDiagramService
>("UseDiagramServiceIdentifer");
