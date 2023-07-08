import {
  addRelation,
  Relation,
  removeRelation,
} from "../../../core/entities/Deployment";
import { createController } from "../../../shared/utils/createController";
import { deploymentStoreIdentifier } from "../store/deploymentStore";
import { useService } from "../../../shared/libs/di/react/useService";
import { produce } from "immer";

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
        deploymentStore.setState((state) =>
          produce(state, (draft) => {
            if ([origin, target].includes(draft.deployment.root.id)) {
              return;
            }
            addRelation(draft.deployment, origin, target);
          })
        );
      },
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
  }
);
