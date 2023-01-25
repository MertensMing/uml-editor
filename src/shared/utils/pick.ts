import lodashPick from "lodash/pick";

export function pick<T, K extends keyof T>(
  object: T,
  keys: K[]
): {
  [A in K]: T[A];
} {
  return lodashPick(object, keys);
}
