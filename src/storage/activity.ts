import { Activity } from "../entities/Activity";

const ACTIVITY_STORAGE_KEY = "ACTIVITY_STORAGE_KEY";

function set(activity: Activity) {
  window.localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activity));
}

function get() {
  return JSON.parse(
    window.localStorage.getItem(ACTIVITY_STORAGE_KEY)
  ) as Activity;
}

export const activityStorage = {
  set,
  get,
};
