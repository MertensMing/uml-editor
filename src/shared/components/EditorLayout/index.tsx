import React from "react";
import { CopyDiagram } from "../CopyDiagram";
import { useNavigate } from "react-router-dom";
import classNames from "classnames";

export function EditorLayout(props: {
  uml: string;
  pngUrl: string;
  svgUrl: string;
  currentDiagram: string;
  operation: React.ReactElement;
  diagram: React.ReactElement;
  toolbar?: React.ReactElement;
}) {
  const navigate = useNavigate();
  return (
    <div data-theme="winter" className="h-full flex flex-col bg-slate-100">
      <div className="border-b navbar bg-white">
        <div className="flex-none">
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </label>
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a
                  className={classNames({
                    active: props.currentDiagram === "activity",
                  })}
                  onClick={() => {
                    navigate(`/activity`);
                  }}
                >
                  活动图
                </a>
              </li>
              <li>
                <a
                  className={classNames({
                    active: props.currentDiagram === "deployment",
                  })}
                  onClick={() => {
                    navigate(`/deployment`);
                  }}
                >
                  部署图
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex-1">
          <a className="btn btn-ghost normal-case text-xl">PlantUML Editor</a>
        </div>
        <div className="flex-none gap-2">
          <CopyDiagram uml={props.uml} png={props.pngUrl} svg={props.svgUrl} />
        </div>
      </div>
      <div className="flex flex-grow w-full relative overflow-hidden">
        <div className="p-2 px-6 shadow-lg bg-white space-x-2 flex items-center h-12 absolute top-0 left-0 w-full z-10">
          {props.toolbar}
        </div>
        <div className="overflow-auto w-full h-full">
          <div className="px-64 pt-12">{props.diagram}</div>
        </div>
        <div className="absolute top-0 left-0 bg-white shadow-xl mt-16 ml-6 rounded p-4 max-h-96 overflow-auto">
          {props.operation}
        </div>
      </div>
    </div>
  );
}
