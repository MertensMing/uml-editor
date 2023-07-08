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

export const useObjectDetailController = () => {
  const deploymentStore = useService(deploymentStoreIdentifier);

  return {
    handleObjectNameChange(id, name) {
      deploymentStore.setState((state) =>
        produce(state, (draft) => {
          const object = findObject(draft.deployment?.root, id);
          if (!object) return;
          object.name = name;
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
