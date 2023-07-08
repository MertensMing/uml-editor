import { createStore, StoreApi } from "zustand";
import cloneDeep from "lodash/cloneDeep";
import {
  addRelation,
  BaseObject,
  ContainerObject,
  correctDeployment,
  createContainer,
  createObject,
  Deployment,
  findObject,
  getId,
  insertObject,
  LineType,
  NormalObject,
  Relation,
  removeAllRelation,
  removeObject,
  removeRelation,
} from "../../../core/entities/Deployment";
import { deploymentParser } from "../../../core/parser/deployment";
import { drawPng, drawSvg } from "../../../shared/utils/uml";
import { containerMap, objectMap } from "../const";
import { createServiceIdentifier } from "../../../shared/libs/di/utils/createServiceIdentifier";

type State = {
  deployment?: Deployment;
  currentObjectId?: BaseObject["id"];
  svgUrl?: string;
  pngUrl?: string;
  uml?: string;
  allowDragRelation: boolean;
};

type Actions = {
  initializeDeployment(deployment?: State["deployment"]): void;
  addObject(containerId: string, type: NormalObject["type"]): void;
  deleteObject(id: BaseObject["id"]): void;
  moveObject(originId: string, targetId: string): void;
  addContainer(containerId: string, type: ContainerObject["type"]): void;
  updateUmlUrl(): void;
  updateCurrentObject(id: BaseObject["id"]): void;
  setObjectField(
    objectId: BaseObject["id"],
    field: keyof ContainerObject | keyof NormalObject,
    value: unknown
  ): void;
  copyObject(id: string): void;
  addRelation(originId: string, targetId: string): void;
  deleteRelation(originId: string, targetId: string): void;
  updateRelation<T extends keyof Relation>(
    id: string,
    relationId: Relation["id"],
    field: T,
    value: Relation[T]
  ): void;
  toggleAllowDragRelation(allow: boolean): void;
  setDiagram(diagram: Deployment): void;
  setLineType(linetype: LineType): void;
  copyDiagram(): void;
};

export type DeploymentStore = State & Actions;

export const deploymentStoreIdentifier =
  createServiceIdentifier<StoreApi<DeploymentStore>>("DeploymentStore");

export function createDeploymentStore(): StoreApi<DeploymentStore> {
  return createStore((set, get) => {
    function updateDiagram() {
      const diagram = cloneDeep(get().deployment);
      correctDeployment(diagram);
      set({
        deployment: diagram,
      });
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

      setLineType(linetype) {
        const diagram = get().deployment;
        diagram.linetype = linetype;
        updateDiagram();
      },
      setDiagram(diagram: Deployment) {
        set({
          deployment: diagram,
        });
        updateDiagram();
      },
      addRelation(originId, targetId) {
        if ([originId, targetId].includes(get().deployment.root.id)) {
          return;
        }
        addRelation(get().deployment, originId, targetId);
        updateDiagram();
      },
      deleteRelation(originId, targetId) {
        removeRelation(get().deployment, originId, targetId);
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
          uml,
        });
      },
      updateCurrentObject(id) {
        set({
          currentObjectId: id,
        });
      },
      initializeDeployment(storage) {
        set({
          deployment: storage,
          currentObjectId: storage.root.id,
        });
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
          const target = createObject(objectMap[type], type);
          insertObject(container, target);
          updateDiagram();
        }
      },
      addContainer(containerId, type) {
        const container = findObject(
          get().deployment.root,
          containerId
        ) as ContainerObject;
        if (container) {
          const target = createContainer(containerMap[type], type);
          insertObject(container, target);
          updateDiagram();
        }
      },
      copyDiagram() {
        const newDeployment = cloneDeep(get().deployment);
        newDeployment.id = `deployment_${getId()}`;
        newDeployment.root.name = `${newDeployment.root.name}（副本）`;
        set({
          deployment: newDeployment,
        });
      },
      copyObject(objectId) {
        // const targetObject = findObject(get().deployment.root, objectId);
        // const newObject = cloneDeep(targetObject);
        // newObject.id = `object_${getId()}`;
        // insertObject(get().deployment.root, newObject);
        // updateDiagram();
      },
      moveObject(originId, targetId) {
        const targetObject = findObject(get().deployment.root, targetId);
        if (!targetObject || !targetObject?.isContainer) {
          throw new Error(`targetId ${targetId} 不是容器`);
        }
        const originObject = findObject(get().deployment.root, originId);
        if (originObject?.isContainer && findObject(originObject, targetId)) {
          throw new Error(`父对象 ${originId} 不能移动到子对象 ${targetId} 中`);
        }
        const removed = removeObject(get().deployment.root, originId);
        if (!removed) {
          throw new Error(`找不到对象 ${targetId}`);
        }
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
