/* eslint-disable react-hooks/exhaustive-deps */
import Input from "@mui/material/Input";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";

export function ListOperation(props: {
  values: string[];
  allowDelete: boolean;
  allowEdit: boolean;
  onDelete(index: number): void;
  onChange?: (value: string, index: number) => void;
}) {
  return (
    <div>
      {props.values.map((value, index) => (
        <div className="flex items-center pb-2" key={index}>
          <input
            value={value}
            disabled={!props.allowEdit}
            onChange={(e) => props.onChange?.(e.target.value, index)}
            className="input input-bordered input-xs"
          />
          {props.allowDelete && (
            <button
              onClick={() => props.onDelete(index)}
              className="btn btn-outline btn-error btn-xs ml-2"
            >
              删除
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
