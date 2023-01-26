import { createStore, StoreApi } from "zustand";
import cloneDeep from "lodash/cloneDeep";
import {
  addChildObject,
  addRelation,
  BaseObject,
  ContainerObject,
  createContainer,
  createDiagram,
  createObject,
  Deployment,
  findObject,
  insertObject,
  NormalObject,
  Relation,
  removeAllRelation,
  removeObject,
  removeRelation,
} from "../../../core/entities/Deployment";
import { deploymentStorage } from "../../../shared/storage/deployment";
import { deploymentParser } from "../../../core/parser/deployment";
import { drawPng, drawSvg } from "../../../shared/utils/uml";
import { containerMap, objectMap } from "../const";

type State = {
  deployment?: Deployment;
  currentObjectId?: BaseObject["id"];
  svgUrl?: string;
  pngUrl?: string;
  allowDragRelation: boolean;
};

type Actions = {
  initializeDeployment(deployment?: State["deployment"]): void;
  addObject(
    containerId: ContainerObject["id"],
    type: NormalObject["type"]
  ): void;
  deleteObject(id: BaseObject["id"]): void;
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
  setObjectField(
    objectId: BaseObject["id"],
    field: keyof ContainerObject | keyof NormalObject,
    value: unknown
  ): void;
  addRelation(
    origin: ContainerObject["id"],
    target: ContainerObject["id"]
  ): void;
  deleteRelation(
    origin: ContainerObject["id"],
    target: ContainerObject["id"]
  ): void;
  updateRelation<T extends keyof Relation>(
    id: ContainerObject["id"],
    relationId: Relation["id"],
    field: T,
    value: Relation[T]
  ): void;
  toggleAllowDragRelation(allow: boolean): void;
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

    function resetCurrent() {
      set({
        currentObjectId: get().deployment.root.id,
      });
    }

    return {
      deployment: undefined,
      currentObjectId: undefined,
      svgUrl: undefined,
      pngUrl: undefined,
      allowDragRelation: false,

      addRelation(origin, target) {
        get().deployment.last++;
        addRelation(get().deployment, origin, target);
        updateDiagram();
      },
      deleteRelation(origin, target) {
        removeRelation(get().deployment, origin, target);
        updateDiagram();
      },
      updateRelation(id, relationId, field, value) {
        const relations = get().deployment.relations[id] || [];
        const relation = relations.find((item) => item.id === relationId);
        if (!relation) return;
        relation[field] = value;
        updateDiagram();
      },
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
      toggleAllowDragRelation(allow) {
        set({
          allowDragRelation: allow,
        });
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
      setObjectField(objectId, field, value) {
        const object = findObject(get().deployment?.root, objectId);
        if (!object) return;
        object[field] = value;
        updateDiagram();
      },
      deleteObject(id) {
        const removed = removeObject(get().deployment.root, id);
        if (!removed) return;
        resetCurrent();
        removeAllRelation(get().deployment, id);
        updateDiagram();
      },
    };
  });
}
