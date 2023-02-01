import { createStorage } from ".";
import { Deployment } from "../../core/entities/Deployment";

const DEPLOYMENT_STORAGE_KEY = "DEPLOYMENT_STORAGE_KEY";
const DEPLOYMENT_HISTORY_STORAGE_KEY = "DEPLOYMENT_HISTORY_STORAGE_KEY";

export const deploymentStorage = createStorage<Deployment>(
  DEPLOYMENT_STORAGE_KEY
);

export const deploymentHistoryStorage = createStorage<Deployment[]>(
  DEPLOYMENT_HISTORY_STORAGE_KEY
);
