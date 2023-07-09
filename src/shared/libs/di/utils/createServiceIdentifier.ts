export type Newable<T> = new (...args: never[]) => T;
export interface Abstract<T> {
  prototype: T;
}
export type ServiceIdentifier<T = unknown> =
  | string
  | symbol
  | Newable<T>
  | Abstract<T>;
export type AsyncServiceIdentifier<T = unknown> =
  | string
  | symbol
  | Newable<T>
  | Abstract<T>;

export type PickInner<T extends ServiceIdentifier<any>> =
  T extends ServiceIdentifier<infer H> ? H : never;

export function createServiceIdentifier<T>(id: string): ServiceIdentifier<T> {
  return Symbol.for(id);
}
export function createAysncServiceIdentifier<T>(
  id: string
): AsyncServiceIdentifier<T> {
  return Symbol.for(id);
}
