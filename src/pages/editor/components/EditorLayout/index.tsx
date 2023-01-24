/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { CopyButtonGroup } from "../CopyButtonGroup";

export function EditorLayout(props: {
  uml: string;
  pngUrl: string;
  svgUrl: string;
  operation: React.ReactElement;
  diagram: React.ReactElement;
}) {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex p-4 items-center border-b-solid border-gray-700 border-b-2 h-16 justify-between">
        <div className="font-bold text-xl">PlantUML Editor</div>
        <CopyButtonGroup
          uml={props.uml}
          png={props.pngUrl}
          svg={props.svgUrl}
        />
      </div>
      <div className="flex" style={{ height: `calc(100vh - 64px)` }}>
        <div
          style={{ width: 300 }}
          className="px-4 py-4 h-full flex-shrink-0 border-r-solid border-gray-700 border-r-2 overflow-auto"
        >
          {props.operation}
        </div>
        <div className="h-full w-full overflow-auto bg-gray-100">
          {props.diagram}
        </div>
      </div>
    </div>
  );
}
