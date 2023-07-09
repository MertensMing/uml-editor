import {
  addRelation,
  findObject,
  insertObject,
  removeAllRelation,
  removeObject,
} from "../../../core/entities/Deployment";
import { deploymentStoreIdentifier } from "../store/deploymentStore";
import { useService } from "../../../shared/libs/di/react/useService";
import { produce } from "immer";

export const useObjectDetailController = () => {
  const deploymentStore = useService(deploymentStoreIdentifier);

  return {
    handleSelectObjectBgColor(id, color) {
      deploymentStore.setState((state) =>
        produce(state, (draft) => {
          const object = findObject(draft.deployment?.root, id);
          if (!object) return;
          object.bgColor = color;
        })
      );
    },
    handleMoveObject(origin, target) {
      deploymentStore.setState((state) =>
        produce(state, (draft) => {
          const targetObject = findObject(draft.deployment.root, target);
          if (!targetObject || !targetObject?.isContainer) {
            throw new Error(`targetId ${target} 不是容器`);
          }
          const originObject = findObject(draft.deployment.root, origin);
          if (originObject?.isContainer && findObject(originObject, target)) {
            throw new Error(`父对象 ${origin} 不能移动到子对象 ${target} 中`);
          }
          const removed = removeObject(draft.deployment.root, origin);
          if (!removed) {
            throw new Error(`找不到对象 ${target}`);
          }
          insertObject(targetObject, removed);
        })
      );
    },
    handleDelete(id) {
      deploymentStore.setState((state) =>
        produce(state, (draft) => {
          const removed = removeObject(draft.deployment.root, id);
          if (!removed) return;
          draft.currentObjectId = draft.deployment.root.id;
          removeAllRelation(draft.deployment, id);
        })
      );
    },
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
  };
};
