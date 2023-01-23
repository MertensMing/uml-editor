/* eslint-disable react-hooks/exhaustive-deps */
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import AccountCircle from "@mui/icons-material/AccountCircle";

export function ListOperation(props: {
  values: string[];
  allowDelete: boolean;
  allowEdit: boolean;
  onDelete(index: number): void;
}) {
  return (
    <div>
      {props.values.map((value, index) => (
        <div className="flex items-center" key={value}>
          <Input
            startAdornment={
              <InputAdornment position="start">
                <AccountCircle />
              </InputAdornment>
            }
            value={value}
            disabled={!props.allowEdit}
          />
          {props.allowDelete && (
            <div
              onClick={() => props.onDelete(index)}
              className="ml-1 cursor-pointer text-xs hover:bg-gray-200 px-2 py-1 rounded"
            >
              删除
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
