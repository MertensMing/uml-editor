import copy from "copy-to-clipboard";
import React from "react";

type Props = {
  uml: string;
  svg: string;
  png: string;
};

export function CopyDiagram(props: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      {open && (
        <div className="toast toast-top toast-center">
          <div className="alert alert-success whitespace-nowrap">
            <div>复制成功</div>
          </div>
        </div>
      )}
      <div className="dropdown dropdown-end">
        <label tabIndex={0} className="btn btn-ghost btn-circle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-5 h-5 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            ></path>
          </svg>
        </label>
        <ul
          tabIndex={10}
          className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
        >
          <li>
            <a
              className="justify-between"
              onClick={() => {
                const success = copy(props.uml);
                if (success) {
                  setOpen(true);
                  setTimeout(() => {
                    setOpen(false);
                  }, 1500);
                }
              }}
            >
              复制 PlantUML
            </a>
          </li>
          <li>
            <a href={props.svg} target="_blank">
              下载 SVG
            </a>
          </li>
          <li>
            <a href={props.png} target="_blank">
              下载 PNG
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
