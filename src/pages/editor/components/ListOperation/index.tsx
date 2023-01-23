/* eslint-disable react-hooks/exhaustive-deps */
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import AccountCircle from "@mui/icons-material/AccountCircle";

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
        <div className="flex items-center" key={index}>
          <Input
            startAdornment={
              <InputAdornment position="start">
                <AccountCircle />
              </InputAdornment>
            }
            defaultValue={value}
            disabled={!props.allowEdit}
            onBlur={(e) => props.onChange?.(e.target.value, index)}
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
