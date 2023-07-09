import { useContext, useMemo } from "react";
import {
  AsyncServiceIdentifier,
  ServiceIdentifier,
} from "../utils/createServiceIdentifier";
import { context } from "./connect";

export function useService<T>(serviceIdentifier: ServiceIdentifier<T>): T {
  const container = useContext(context);
  const service = useMemo(
    () => container.get<T>(serviceIdentifier),
    [container, serviceIdentifier]
  );
  return service;
}

export function useAsyncService<T>(
  serviceIdentifier: AsyncServiceIdentifier<T>
): () => T {
  const container = useContext(context);
  const service = useMemo(
    () => container.get(serviceIdentifier),
    [container, serviceIdentifier]
  );
  return service;
}
