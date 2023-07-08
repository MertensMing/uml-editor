import { createStore, StoreApi } from "zustand";
import cloneDeep from "lodash/cloneDeep";
import {
  addRelation,
  BaseObject,
  correctDeployment,
  Deployment,
  NormalObject,
  Relation,
  removeRelation,
} from "../../../core/entities/Deployment";
import { deploymentParser } from "../../../core/parser/deployment";
import { drawPng, drawSvg } from "../../../shared/utils/uml";
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
  updateUmlUrl(): void;
  updateCurrentObject(id: BaseObject["id"]): void;
  addRelation(originId: string, targetId: string): void;
  deleteRelation(originId: string, targetId: string): void;
  updateRelation<T extends keyof Relation>(
    id: string,
    relationId: Relation["id"],
    field: T,
    value: Relation[T]
  ): void;
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

    return {
      deployment: undefined,
      currentObjectId: undefined,
      svgUrl: undefined,
      pngUrl: undefined,
      allowDragRelation: false,
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
    };
  });
}
