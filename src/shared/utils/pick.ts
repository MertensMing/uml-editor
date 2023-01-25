import lodashPick from "lodash/pick";

export function pick<T, K extends keyof T>(object: T, keys: K[]) {
  return lodashPick(object, keys);
}
