import {
  ContainerObject,
  createContainer,
  createObject,
  findObject,
  insertObject,
  removeAllRelation,
  removeObject,
} from "../../../core/entities/Deployment";
import { deploymentStoreIdentifier } from "../store/deploymentStore";
import { useService } from "../../../shared/libs/di/react/useService";
import { produce } from "immer";
import { containerMap, objectMap } from "../const";

export const useObjectController = () => {
  const deploymentStore = useService(deploymentStoreIdentifier);

  return {
    handleAddContainer(id, type) {
      deploymentStore.setState((state) =>
        produce(state, (draft) => {
          const container = findObject(
            draft.deployment.root,
            id
          ) as ContainerObject;
          if (container) {
            const target = createContainer(containerMap[type], type);
            insertObject(container, target);
          }
        })
      );
    },
    handleAddObject(id, type) {
      deploymentStore.setState((state) =>
        produce(state, (draft) => {
          const container = findObject(
            draft.deployment.root,
            id
          ) as ContainerObject;
          if (container) {
            const target = createObject(objectMap[type], type);
            insertObject(container, target);
          }
        })
      );
    },
    handleObjectSelect(id) {
      deploymentStore.setState((state) =>
        produce(state, (draft) => {
          draft.currentObjectId = id;
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
    handleObjectNameChange(id, name) {
      deploymentStore.setState((state) =>
        produce(state, (draft) => {
          const object = findObject(draft.deployment?.root, id);
          if (!object) return;
          object.name = name;
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
    handleSelectObjectBgColor(id, color) {
      deploymentStore.setState((state) =>
        produce(state, (draft) => {
          const object = findObject(draft.deployment?.root, id);
          if (!object) return;
          object.bgColor = color;
        })
      );
    },
    handleCommentChange(id, comment) {
      deploymentStore.setState((state) =>
        produce(state, (draft) => {
          const object = findObject(draft.deployment?.root, id);
          if (!object) return;
          object.comment = comment;
        })
      );
    },
    handleContentChange(id, content) {
      deploymentStore.setState((state) =>
        produce(state, (draft) => {
          const object = findObject(draft.deployment?.root, id);
          if (!object) return;
          object.content = content;
        })
      );
    },
    handleSelectObjectTextColor(id, color) {
      deploymentStore.setState((state) =>
        produce(state, (draft) => {
          const object = findObject(draft.deployment?.root, id);
          if (!object) return;
          object.textColor = color;
        })
      );
    },
    handleLineTypeChange(linetype) {
      deploymentStore.setState((state) => {
        return produce(state, (draft) => {
          draft.deployment.linetype = linetype;
        });
      });
    },
  };
};
