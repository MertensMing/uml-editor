import { Activity } from "../entities/Activity";

function set(activity: Activity) {
  window.localStorage.setItem("my_activity", JSON.stringify(activity));
}

function get() {
  return JSON.parse(window.localStorage.getItem("my_activity")) as Activity;
}

export const activityStorage = {
  set,
  get,
};
