import { Subject } from "rxjs";
import { createServiceIdentifier } from "../../../shared/libs/di/utils/createServiceIdentifier";

export const DiagramClick$ = new Subject<any>();

export const DiagramClick$Identifier =
  createServiceIdentifier<typeof DiagramClick$>("DiagramClick");
