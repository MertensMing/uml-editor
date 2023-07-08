import { Relation } from "../../../core/entities/Deployment";
import { createController } from "../../../shared/utils/createController";
import { deploymentStoreIdentifier } from "../store/deploymentStore";
import { useService } from "../../../shared/libs/di/react/useService";

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
    return {
      handleAddRelation(origin, target) {
        deploymentStore.getState().addRelation(origin, target);
      },
      handleDeleteRelation(origin, to) {
        deploymentStore.getState().deleteRelation(origin, to);
      },
      handleRelationChange(id, relationId, field, value) {
        deploymentStore.getState().updateRelation(id, relationId, field, value);
      },
    };
  }
);
