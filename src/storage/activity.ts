import { createStorage } from ".";
import { Activity } from "../core/entities/Activity";

const ACTIVITY_STORAGE_KEY = "ACTIVITY_STORAGE_KEY";

export const activityStorage = createStorage<Activity>(ACTIVITY_STORAGE_KEY);
