import { useContext, useMemo } from "react";
import { ServiceIdentifier } from "../utils/createServiceIdentifier";
import { context } from "./connect";

export function useService<T>(serviceIdentifier: ServiceIdentifier<T>): T {
  const container = useContext(context);
  const service = useMemo(() => container.get<T>(serviceIdentifier), []);
  return service;
}
