import { removeRelation } from "../../../core/entities/Deployment";
import { deploymentStoreIdentifier } from "../store/deploymentStore";
import { useService } from "../../../shared/libs/di/react/useService";
import { produce } from "immer";

export const useObjectRelationController = () => {
  const deploymentStore = useService(deploymentStoreIdentifier);
  return {
    handleDeleteRelation(origin, to) {
      deploymentStore.setState((state) =>
        produce(state, (draft) => {
          removeRelation(draft.deployment, origin, to);
        })
      );
    },
    handleRelationChange(id, relationId, field, value) {
      deploymentStore.setState((state) =>
        produce(state, (draft) => {
          const relations = draft.deployment.relations[id] || [];
          const relation = relations.find((item) => item.id === relationId);
          if (!relation) return;
          relation[field] = value;
        })
      );
    },
  };
};
