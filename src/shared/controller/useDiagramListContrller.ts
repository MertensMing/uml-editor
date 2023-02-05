import { useNavigate } from "react-router-dom";
import { useAction } from "../hooks/useAction";
import { ListStore } from "../store/listStore";
import { createController } from "../utils/createController";

export const useDiagramListContrller = createController<
  [ListStore],
  {
    handleInit(): void;
    handleSelectDiagram(id: string): void;
  }
>(([store]) => {
  const actions = useAction(store, ["fetchList"]);
  const navigate = useNavigate();

  return {
    handleInit() {
      actions.fetchList();
    },
    handleSelectDiagram(id: string) {
      navigate(`/deployment/${id}`);
    },
  };
});
