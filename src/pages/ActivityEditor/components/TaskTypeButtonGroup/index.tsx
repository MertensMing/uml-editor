import { TaskType } from "../../../../core/entities/Activity";
import { TYPE_MAP } from "../../const";

export function AddTaskType(props: {
  group: TaskType[];
  onClick(type: TaskType): void;
}) {
  return (
    <div className="dropdown dropdown-hover">
      <label className="flex items-center">
        <button className="btn btn-xs btn-ghost relative top-0 mt-px -ml-1">
          <svg
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className=" w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            ></path>
          </svg>
        </button>
      </label>
      <ul className="dropdown-content menu p-2 shadow-lg bg-slate-50 rounded-box w-24 z-10">
        {props.group.map((type) => {
          return (
            <li key={type} onClick={() => props.onClick(type)}>
              <a>{TYPE_MAP[type]}</a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
