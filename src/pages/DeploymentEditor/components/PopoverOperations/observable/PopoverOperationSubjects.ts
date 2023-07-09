import { Subject } from "rxjs";
import { createServiceIdentifier } from "../../../../../shared/libs/di/utils/createServiceIdentifier";

export const subjects = {
  color$: new Subject<{ id: string; color: string }>(),
  relation$: new Subject<{ id: string; target: string }>(),
  move$: new Subject<{ id: string; target: string }>(),
  delete$: new Subject<{ id: string }>(),
};

export const PopoverOperationSubjectIdentifier =
  createServiceIdentifier<typeof subjects>("subjects");
