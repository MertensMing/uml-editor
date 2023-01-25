import { EditorLayout } from "../../components/EditorLayout";

export function DeploymentEditor() {
  return (
    <EditorLayout
      currentDiagram="deployment"
      uml=""
      pngUrl=""
      svgUrl=""
      diagram={<div>a</div>}
      operation={<div>b</div>}
    />
  );
}
