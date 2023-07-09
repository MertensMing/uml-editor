import { useNavigate } from "react-router-dom";
import { useDiagramListService } from "../service/useDiagramListService";
import { listStore } from "../store/listStore";
import { createController } from "../utils/createController";

export const useDiagramListContrller = createController<
  [],
  {
    handleInit(): void;
    handleSelectDiagram(id: string): void;
  }
>(([]) => {
  const navigate = useNavigate();
  const listService = useDiagramListService();

  return {
    handleInit() {
      listService.fetchList();
    },
    handleSelectDiagram(id: string) {
      navigate(`/${listStore.getState().type}/${id}`);
    },
  };
});
