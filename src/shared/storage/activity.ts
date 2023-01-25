import { Activity } from "../../core/entities/Activity";

const ACTIVITY_STORAGE_KEY = "ACTIVITY_STORAGE_KEY";

function set(activity: Activity) {
  window.localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activity));
}

function get() {
  const data = window.localStorage.getItem(ACTIVITY_STORAGE_KEY);
  return data && (JSON.parse(data) as Activity);
}

export const activityStorage = {
  set,
  get,
};
