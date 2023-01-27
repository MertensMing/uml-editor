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
        <div className="flex items-center" key={index}>
          <Input
            value={value}
            disabled={!props.allowEdit}
            onChange={(e) => props.onChange?.(e.target.value, index)}
          />
          {props.allowDelete && (
            <div className="ml-1">
              <IconButton size="small" onClick={() => props.onDelete(index)}>
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
