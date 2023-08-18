import React, { lazy } from "react";
import { Icon } from "./components/Icon";

const SelectDiagram = lazy(() => import("../SelectDiagram"));

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
          <div className="ml-8">
            <Icon />
          </div>
          <a className="btn btn-ghost normal-case text-xl text-purple-900">
            PlantUML Editor
          </a>
        </div>
        <div className="flex-none gap-2">
          <SelectDiagram onDelete={props.onDelete} onAdd={props.onAdd} />
        </div>
      </div>
      <div className="flex flex-grow w-full relative overflow-hidden">
        <div className="p-2 px-8 shadow-lg bg-white space-x-8 flex items-center h-12 absolute top-0 left-0 w-full z-10">
          {props.toolbar}
        </div>
        <div
          className="
          bg-white flex-shrink-0 shadow-xl
          mt-20 mb-8 ml-8 mr-8 rounded p-4
          scrollbar-thumb-slate-300 scrollbar-thin
          overflow-x-hidden overflow-y-auto
          absolute left-0 top-0
          "
          style={{ height: 500 }}
        >
          {props.operation}
        </div>
        <div
          className="w-screen pt-16 pb-16 box-border overflow-auto scrollbar-thumb-slate-300 scrollbar-thin"
          style={{ paddingLeft: 270, paddingRight: 32 }}
        >
          {props.diagram}
        </div>
      </div>
    </div>
  );
}
