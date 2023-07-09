import { useSubscription } from "observable-hooks";
import React from "react";
import { useService } from "../../../../../../shared/libs/di/react/useService";
import { useObjectDetailController } from "../../../../controller/useObjectDetailController";
import { PopoverOperationSubjectIdentifier } from "../../observable/PopoverOperationSubjects";

export const AsyncUseObjectDetailController: React.FC = () => {
  const subjectService = useService(PopoverOperationSubjectIdentifier);
  const {
    handleAddRelation,
    handleMoveObject,
    handleDelete,
    handleSelectObjectBgColor,
  } = useObjectDetailController();
  useSubscription(subjectService.relation$, ({ id, target }) => {
    handleAddRelation(id, target);
  });
  useSubscription(subjectService.move$, ({ id, target }) => {
    handleMoveObject(id, target);
  });
  useSubscription(subjectService.color$, ({ id, color }) => {
    handleSelectObjectBgColor(id, color);
  });
  useSubscription(subjectService.delete$, ({ id }) => {
    handleDelete(id);
  });
  return null;
};

export default AsyncUseObjectDetailController;
