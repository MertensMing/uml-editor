import { Popover } from "@mui/material";
import PopupState, { bindPopover, bindTrigger } from "material-ui-popup-state";
import { SwatchesPicker } from "react-color";

export function ColorPicker(props: {
  onChange?: (color: string) => void;
  color?: string;
}) {
  return (
    <PopupState variant="popover" popupId="demo-popup-popover">
      {(popupState) => (
        <div>
          <div
            {...bindTrigger(popupState)}
            className="rounded w-6 h-3 cursor-pointer border-solid border-gray-900"
            style={{
              background: props.color || "",
            }}
          />
          <Popover
            {...bindPopover(popupState)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
          >
            <SwatchesPicker onChange={(e) => props.onChange?.(e.hex)} />
          </Popover>
        </div>
      )}
    </PopupState>
  );
}
