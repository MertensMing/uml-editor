import { ReactSVG } from "react-svg";
import { EditorLayout } from "../../shared/components/EditorLayout";
import { drawSvg } from "../../shared/utils/uml";

const svgUrl = drawSvg(`
@startuml
actor "okokok okokok" as asdasda
actor "okokok" as asdasd



alt 成功情况

else <text objectId="okokok">某种失败情况 asd</text>
Alice -> Bob ++: <text objectId="okokok">某种失败情况 asd</text>

else 另一种失败

end
@enduml

`);

export function SequenceEditor() {
  return (
    <div>
      <EditorLayout
        currentDiagram="deployment"
        uml={""}
        pngUrl={""}
        svgUrl={""}
        diagram={
          <div className="sequence">
            <ReactSVG src={svgUrl} />
          </div>
        }
        operation={<div>as</div>}
        toolbar={<div>as</div>}
      />
    </div>
  );
}
