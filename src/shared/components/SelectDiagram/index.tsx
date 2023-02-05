import {
  Button,
  Divider,
  Dropdown,
  Input,
  MenuProps,
  Select,
  Space,
} from "antd";
import { useEffect } from "react";
import { useStore } from "zustand";
import { useParams } from "react-router-dom";
import { listStore } from "../../store/listStore";
import { useDiagramListContrller } from "../../controller/useDiagramListContrller";

export function SelectDiagram() {
  const { handleInit, handleSelectDiagram } = useDiagramListContrller([
    listStore,
  ]);
  const { id } = useParams();
  const diagramList = useStore(listStore, (state) => state.list);

  useEffect(() => {
    handleInit();
  }, []);

  if (!diagramList.length) {
    return null;
  }

  return (
    <div className="flex items-center">
      <Select
        value={id}
        className="mt-1 pt-px"
        showArrow={false}
        style={{ width: 300 }}
        placeholder="选择图表"
        dropdownRender={(menu) => (
          <>
            {menu}
            <Divider style={{ margin: "8px 0" }} />
            <Space style={{ padding: "0 8px 4px" }}>
              <Input bordered={false} placeholder="图表名称" />
              <Button type="text">新建图表</Button>
            </Space>
          </>
        )}
        bordered={false}
        options={diagramList.map((item) => ({
          label: (
            <div className="text-gray-500 text-base cursor-pointer w-64 whitespace-nowrap overflow-ellipsis overflow-hidden text-right hover:text-gray-800">
              {item.name}
            </div>
          ),
          value: item.id,
        }))}
        onChange={(id: string) => {
          handleSelectDiagram(id);
        }}
      />
      <Dropdown
        menu={{
          items: [
            {
              label: <div>删除图表</div>,
              key: "1",
            },
          ] as MenuProps["items"],
        }}
        trigger={["click"]}
      >
        <label className="btn btn-ghost btn-circle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-5 h-5 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            ></path>
          </svg>
        </label>
      </Dropdown>
    </div>
  );
}
