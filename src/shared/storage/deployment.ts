import { createStorage } from ".";
import { Deployment } from "../../core/entities/Deployment";

const DEPLOYMENT_STORAGE_KEY = "DEPLOYMENT_STORAGE_KEY";

export const deploymentStorage = createStorage<Deployment>(
  DEPLOYMENT_STORAGE_KEY
);
