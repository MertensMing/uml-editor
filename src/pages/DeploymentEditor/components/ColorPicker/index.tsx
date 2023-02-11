import { Popover } from "antd";
import { CompactPicker } from "react-color";

const colorScheme = [
  "#1abc9c",
  "#16a085",
  "#2ecc71",
  "#27ae60",
  "#3498db",
  "#2980b9",
  "#9b59b6",
  "#8e44ad",
  "#34495e",
  "#2c3e50",
  "#f1c40f",
  "#f39c12",
  "#e67e22",
  "#d35400",
  "#e74c3c",
  "#c0392b",
  "#ecf0f1",
  "#bdc3c7",
  "#95a5a6",
  "#7f8c8d",
  "#f7dc6f",
  "#f0e68c",
  "#fdfd96",
  "#fffacd",
  "#b0e0e6",
  "#87cefa",
  "#add8e6",
  "#e0ffff",
  "#ffffff",
  "#000000",
];

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
        style={{
          padding: 0,
          boxShadow: "none",
          border: 0,
        }}
        content={
          <CompactPicker
            colors={colorScheme}
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
