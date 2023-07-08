import React from "react";
import { SelectDiagram } from "../SelectDiagram";

export function EditorLayout(props: {
  uml: string;
  pngUrl: string;
  svgUrl: string;
  currentDiagram: string;
  operation: React.ReactElement;
  diagram: React.ReactElement;
  toolbar?: React.ReactElement;
  onDelete?: () => void;
  onAdd?: (name: string) => void;
}) {
  return (
    <div data-theme="winter" className="h-full flex flex-col bg-slate-100">
      <div className="border-b navbar bg-white">
        <div className="flex-1">
          <a className="btn btn-ghost normal-case text-xl">PlantUML Editor</a>
        </div>
        <div className="flex-none gap-2">
          <SelectDiagram onDelete={props.onDelete} onAdd={props.onAdd} />
        </div>
      </div>
      <div className="flex flex-grow w-full relative overflow-hidden">
        <div className="p-2 px-8 shadow-lg bg-white space-x-8 flex items-center h-12 absolute top-0 left-0 w-full z-10">
          {props.toolbar}
        </div>
        <div className="overflow-auto w-full scrollbar-thumb-slate-300 scrollbar-thin flex">
          <div className="bg-white flex-shrink-0 shadow-xl mt-20 mb-8 ml-8 rounded p-4 scrollbar-thumb-slate-300 scrollbar-thin overflow-x-hidden overflow-y-auto">
            {props.operation}
          </div>
          <div className="px-9 pt-16">{props.diagram}</div>
        </div>
      </div>
    </div>
  );
}
