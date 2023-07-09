import {
  ContainerObject,
  ContainerObjectType,
  createContainer,
  createObject,
  findObject,
  insertObject,
  ObjectType,
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
    handleAddContainer(id: string, type: ContainerObjectType) {
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
    handleAddObject(id: string, type: ObjectType) {
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
    handleObjectNameChange(id, name) {
      deploymentStore.setState((state) =>
        produce(state, (draft) => {
          const object = findObject(draft.deployment?.root, id);
          if (!object) return;
          object.name = name;
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
