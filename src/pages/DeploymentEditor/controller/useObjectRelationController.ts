import { Relation } from "../../../core/entities/Deployment";
import { createController } from "../../../shared/utils/createController";
import { deploymentStoreIdentifier } from "../store/deploymentStore";
import { useService } from "../../../shared/libs/di/react/useService";
import { UseDiagramServiceIdentifier } from "../service/useDiagramService";

type Handlers = {
  handleAddRelation(origin: string, target: string): void;
  handleDeleteRelation(origin: string, target: string): void;
  handleRelationChange<T extends keyof Relation>(
    id: string,
    relationId: string,
    field: T,
    value: Relation[T]
  ): void;
};

export const useObjectRelationController = createController<[], Handlers>(
  () => {
    const deploymentStore = useService(deploymentStoreIdentifier);

    const useDiagramService = useService(UseDiagramServiceIdentifier);
    const diagramService = useDiagramService();

    return {
      handleAddRelation(origin, target) {
        deploymentStore.getState().addRelation(origin, target);
        diagramService.save();
      },
      handleDeleteRelation(origin, to) {
        deploymentStore.getState().deleteRelation(origin, to);
        diagramService.save();
      },
      handleRelationChange(id, relationId, field, value) {
        deploymentStore.getState().updateRelation(id, relationId, field, value);
        diagramService.save();
      },
    };
  }
);
