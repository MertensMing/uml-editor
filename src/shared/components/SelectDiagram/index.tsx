import { Button, Divider, Input, message, Select, Space } from "antd";
import { useEffect, useState } from "react";
import { useStore } from "zustand";
import { useParams } from "react-router-dom";
import { listStore } from "../../store/listStore";
import { useDiagramListContrller } from "../../controller/useDiagramListContrller";
import { DiagramType } from "../../constants";
import { db } from "../../../db";

export function SelectDiagram(props: {
  onDelete?: () => void;
  onAdd?: (name: string) => void;
}) {
  const { handleInit, handleSelectDiagram } = useDiagramListContrller([
    listStore,
  ]);
  const { id } = useParams();
  const diagramList = useStore(listStore, (state) => state.list);
  const type = useStore(listStore, (state) => state.type);
  const [name, setName] = useState("");

  useEffect(() => {
    handleInit();
  }, []);

  const handleExport = () => {
    const json = diagramList.reduce((acc, current) => {
      acc[current.id] = {
        id: current.id,
        name: current.name,
        diagram: current.diagram,
      };
      return acc;
    }, {});
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(json));
    const name = {
      [DiagramType.activity]: "activities",
      [DiagramType.deployment]: "deployments",
    }[type];
    const ele = document.createElement("a");
    ele.setAttribute("href", dataStr);
    ele.setAttribute("download", `${name}.json`);
    ele.click();
    message.success("导出成功");
  };

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
              <Input
                bordered={false}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                value={name}
                placeholder="请输入图表名称"
              />
              <Button
                type="text"
                onClick={() => {
                  props?.onAdd?.(name);
                  setName("");
                }}
              >
                新建图表
              </Button>
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
      <div className="dropdown dropdown-bottom dropdown-end">
        <label tabIndex={10} className="btn btn-ghost btn-circle">
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
        <ul
          tabIndex={10}
          className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li>
            <div onClick={() => props?.onDelete?.()}>删除图表</div>
          </li>
          <li>
            <div onClick={handleExport}>导出图表</div>
          </li>
          <li>
            <label htmlFor="import">
              导入图表{" "}
              <input
                id="import"
                type="file"
                accept=".json"
                className="fixed top-0 right-0 ml-96 opacity-0"
                style={{
                  top: "-10000px",
                }}
                onChange={function (e) {
                  const file = e.target.files[0];
                  if (file.type.includes("json")) {
                    const reader = new FileReader();
                    reader.onload = async function () {
                      const diagrams = JSON.parse(reader.result as string);
                      await Promise.all(
                        Object.keys(diagrams).map(async (key) => {
                          const item = diagrams[key];
                          if (type === DiagramType.activity) {
                            await db.activities.put(item);
                          } else {
                            await db.deployments.put(item);
                          }
                        })
                      );
                      message.success("导入成功");
                      listStore.getState().fetchList();
                    };
                    reader.readAsText(file);
                  }
                }}
              />
            </label>
          </li>
        </ul>
      </div>
    </div>
  );
}
