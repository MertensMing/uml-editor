import { Suspense } from "react";
import { CompactPicker } from "react-color";
import { Popover } from "../antd";

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
  "#fcdabd",
  "#e0facd",
  "#bde9fc",
  "#b6eb8f",
  "#f0d6ff",
  "#ffffff",
  "#000000",
  "#F8F9FA",
  "#F1F3F5",
  "#E9ECEF",
  "#DEE2E6",
  "#CED4DA",
  "#ADB5BD",
  "#868E96",
  "#495057",
  "#343A40",
  "#212529",
  "#FFC9C9",
  "#FFA8A8",
  "#FF8787",
  "#FF6B6B",
  "#FA5252",
  "#F03E3E",
  "#E03131",
  "#C92A2A",
  "#AD2121",
  "#871717",
  "#FFE3C7",
  "#FFD8A8",
  "#FFCD89",
  "#FFC670",
  "#FFBB4D",
  "#FFB533",
  "#FAA219",
  "#E69500",
  "#C17D00",
  "#A16400",
  "#FFE8CC",
  "#FFD8A8",
  "#FFC184",
  "#FFB166",
  "#FFA34D",
  "#FF9933",
  "#FF8C19",
  "#FF8000",
  "#E67300",
  "#BF5B00",
  "#FFEEDD",
  "#FFDAB3",
  "#FFC48A",
  "#FFB366",
  "#FFA14D",
  "#FF8C33",
  "#FF7519",
  "#FF6600",
  "#E65C00",
  "#BF5000",
  "#FFCBC1",
  "#FFB1A6",
  "#FF9A8C",
  "#FF8873",
  "#FF7660",
  "#FF6347",
  "#FF5722",
  "#F2541D",
  "#D9480F",
  "#BF360C",
  "#F8E6E0",
  "#F1D2C7",
  "#E9B8A9",
  "#DEA290",
  "#D18A76",
  "#C1755C",
  "#AB4E40",
  "#8C3D35",
  "#6D302E",
  "#572B27",
  "#E8F5E9",
  "#C8E6C9",
  "#A5D6A7",
  "#81C784",
  "#66BB6A",
  "#4CAF50",
  "#43A047",
  "#388E3C",
  "#2E7D32",
  "#1B5E20",
  "#E0F2F1",
  "#B2DFDB",
  "#80CBC4",
  "#4DB6AC",
  "#26A69A",
  "#009688",
  "#00897B",
  "#00796B",
  "#00695C",
  "#004D40",
  "#E1F5FE",
  "#B3E5FC",
  "#81D4FA",
  "#4FC3F7",
  "#29B6F6",
  "#03A9F4",
  "#039BE5",
  "#0288D1",
  "#0277BD",
  "#01579B",
  "#EDE7F6",
  "#D1C4E9",
  "#B39DDB",
  "#9575CD",
  "#7E57C2",
  "#673AB7",
  "#5E35B1",
  "#512DA8",
  "#4527A0",
  "#311B92",
  "#F3E5F5",
  "#E1BEE7",
  "#CE93D8",
  "#BA68C8",
  "#AB47BC",
  "#9C27B0",
  "#8E24AA",
  "#7B1FA2",
  "#6A1B9A",
  "#4A148C",
];

export function ColorPicker(props: {
  onChange?: (color: string) => void;
  color?: string;
}) {
  return (
    <div className="flex items-center relative">
      <Suspense fallback={null}>
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
            className="h-4 w-4 rounded cursor-pointer"
            style={{
              background: props.color,
            }}
          />
        </Popover>
      </Suspense>
    </div>
  );
}
