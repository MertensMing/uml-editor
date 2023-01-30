/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react-hooks/exhaustive-deps */
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
      <div className="flex flex-grow overflow-auto">
        <div
          className={classNames(
            `px-4 py-4 h-full overflow-auto w-52`,
            `flex-shrink-0 border-r scrollbar shadow-lg`,
            `scrollbar-thumb-gray-300 scrollbar-track-gray-100 scrollbar-w-0.5 shadow-r bg-white`
          )}
        >
          {props.operation}
        </div>
        <div className="h-full w-full overflow-auto">{props.diagram}</div>
      </div>
    </div>
  );
}
