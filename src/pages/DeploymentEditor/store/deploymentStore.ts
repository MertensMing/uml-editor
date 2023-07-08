import { createStore, StoreApi } from "zustand";
import { BaseObject, Deployment } from "../../../core/entities/Deployment";
import { createServiceIdentifier } from "../../../shared/libs/di/utils/createServiceIdentifier";

type State = {
  deployment?: Deployment;
  currentObjectId?: BaseObject["id"];
  svgUrl?: string;
  pngUrl?: string;
  uml?: string;
};

export type DeploymentStore = State;

export const deploymentStoreIdentifier =
  createServiceIdentifier<StoreApi<DeploymentStore>>("DeploymentStore");

export function createDeploymentStore(): StoreApi<DeploymentStore> {
  return createStore(() => {
    return {
      deployment: undefined,
      currentObjectId: undefined,
      svgUrl: undefined,
      pngUrl: undefined,
    };
  });
}
