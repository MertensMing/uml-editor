import { Popover } from "antd";
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
        showArrow={false}
        content={
          <SwatchesPicker
            onChange={(e) => {
              props.onChange?.(e.hex);
            }}
          />
        }
      >
        <div
          className="h-4 w-4 rounded"
          style={{
            background: props.color,
          }}
        />
      </Popover>
    </div>
  );
}
