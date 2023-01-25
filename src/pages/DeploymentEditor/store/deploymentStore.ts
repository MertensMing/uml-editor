import { createStore, StoreApi } from "zustand";
import cloneDeep from "lodash/cloneDeep";
import {
  addChildObject,
  BaseObject,
  ContainerObject,
  createContainer,
  createDiagram,
  createObject,
  Deployment,
  findObject,
  insertObject,
  NormalObject,
  removeObject,
} from "../../../core/entities/Deployment";
import { deploymentStorage } from "../../../storage/deployment";
import { deploymentParser } from "../../../core/parser/deployment";
import { drawPng, drawSvg } from "../../../shared/utils/uml";
import { containerMap, objectMap } from "../const";

type State = {
  deployment?: Deployment;
  currentObjectId?: BaseObject["id"];
  svgUrl?: string;
  pngUrl?: string;
};

type Actions = {
  initializeDeployment(deployment?: State["deployment"]): void;
  addObject(
    containerId: ContainerObject["id"],
    type: NormalObject["type"]
  ): void;
  moveObject(
    origin: ContainerObject["id"],
    target: ContainerObject["id"]
  ): void;
  addContainer(
    containerId: ContainerObject["id"],
    type: ContainerObject["type"]
  ): void;
  updateUmlUrl(): void;
  updateCurrentObject(id: BaseObject["id"]): void;
};

export type DeploymentStore = State & Actions;

export function createDeploymentStore(): StoreApi<DeploymentStore> {
  return createStore((set, get) => {
    function updateDiagram() {
      set({
        deployment: cloneDeep(get().deployment),
      });
      deploymentStorage.set(get().deployment);
    }

    return {
      deployment: undefined,
      currentObjectId: undefined,
      svgUrl: undefined,
      pngUrl: undefined,
      updateUmlUrl() {
        const uml = deploymentParser.parseDiagram(get().deployment);
        set({
          svgUrl: drawSvg(uml),
          pngUrl: drawPng(uml),
        });
      },
      updateCurrentObject(id) {
        set({
          currentObjectId: id,
        });
      },
      initializeDeployment() {
        const storage = deploymentStorage.get();
        if (storage) {
          set({
            deployment: storage,
            currentObjectId: storage.root.id,
          });
        } else {
          const diagram = createDiagram();
          set({
            deployment: createDiagram(),
            currentObjectId: diagram.root.id,
          });
        }
      },
      addObject(containerId, type) {
        const container = findObject(
          get().deployment.root,
          containerId
        ) as ContainerObject;
        if (container) {
          get().deployment.last++;
          const target = createObject(
            objectMap[type],
            type,
            get().deployment.last
          );
          addChildObject(container, target);
          updateDiagram();
        }
      },
      addContainer(containerId, type) {
        const container = findObject(
          get().deployment.root,
          containerId
        ) as ContainerObject;
        if (container) {
          get().deployment.last++;
          const target = createContainer(
            containerMap[type],
            type,
            get().deployment.last
          );
          addChildObject(container, target);
          updateDiagram();
        }
      },
      moveObject(origin, target) {
        const removed = removeObject(get().deployment.root, origin);
        if (!removed) return;
        const targetObject = findObject(get().deployment.root, target);
        if (!targetObject || !targetObject?.isContainer) return;
        insertObject(targetObject, removed);
        updateDiagram();
      },
    };
  });
}
