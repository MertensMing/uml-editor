import { Container } from "inversify";
import { ReactSVG } from "react-svg";
import { useStore } from "zustand";
import shallow from "zustand/shallow";
import { connect } from "../../../../shared/libs/di/react/connect";
import { useService } from "../../../../shared/libs/di/react/useService";
import { pick } from "../../../../shared/utils/pick";
import { useObjectController } from "../../controller/useObjectController";
import {
  DiagramClick$,
  DiagramClick$Identifier,
} from "../../event/DiagramClick";
import { deploymentStoreIdentifier } from "../../store/deploymentStore";
import { PopoverOperations } from "../PopoverOperations";

function Diagram() {
  const deploymentStore = useService(deploymentStoreIdentifier);
  const { handleObjectSelect } = useObjectController();
  const diagramClick$ = useService(DiagramClick$Identifier);

  const { svgUrl } = useStore(
    deploymentStore,
    (state) => pick(state, ["svgUrl"]),
    shallow
  );

  return (
    <div className="pt-4">
      <PopoverOperations />
      <div
        className="deployment"
        id="deployment-diagram"
        style={{
          touchAction: "none",
        }}
        onClick={(e) => {
          diagramClick$.next(e);
          const target = e.target as any;
          const objectId = target?.attributes?.objectId?.value;
          if (objectId) {
            handleObjectSelect(objectId);
          } else if (
            target.nodeName === "text" &&
            `${target.parentNode.id}`.startsWith("elem_object")
          ) {
            handleObjectSelect(target.parentNode.id.replace("elem_", ""));
          }
        }}
      >
        {svgUrl && <ReactSVG src={svgUrl} />}
      </div>
    </div>
  );
}

export default connect(Diagram, () => {
  const container = new Container();
  container.bind(DiagramClick$Identifier).toConstantValue(DiagramClick$);
  return container;
});
