import { Popover } from "antd";
import classNames from "classnames";
import { SwatchesPicker } from "react-color";

export function ColorPicker(props: {
  onChange?: (color: string) => void;
  color?: string;
}) {
  return (
    <div className="flex items-center relative">
      <Popover
        placement="rightBottom"
        arrowPointAtCenter
        content={
          <SwatchesPicker
            onChange={(e) => {
              props.onChange?.(e.hex);
            }}
          />
        }
      >
        <div
          className="h-4 w-8 rounded"
          style={{
            background: props.color,
          }}
        />
      </Popover>
    </div>
  );
}
