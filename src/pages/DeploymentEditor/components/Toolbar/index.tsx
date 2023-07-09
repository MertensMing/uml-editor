import {
  CopyOutlined,
  DownloadOutlined,
  LeftOutlined,
  PlusOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Dropdown, MenuProps, message, Popover, Tooltip } from "antd";
import classNames from "classnames";
import copy from "copy-to-clipboard";
import { useStore } from "zustand";
import shallow from "zustand/shallow";
import { useService } from "../../../../shared/libs/di/react/useService";
import { pick } from "../../../../shared/utils/pick";
import { useDiagramController } from "../../controller/useDiagramController";
import { useObjectController } from "../../controller/useObjectController";
import { deploymentStoreIdentifier } from "../../store/deploymentStore";
import { AddContainer } from "../AddContainer";
import { AddObject } from "../AddObject";

function Toolbar() {
  const deploymentStore = useService(deploymentStoreIdentifier);
  const { handleAddContainer, handleAddObject } = useObjectController();
  const { handleCopyDiagram } = useDiagramController([]);
  const { svgUrl, deployment, uml, pngUrl } = useStore(
    deploymentStore,
    (state) => pick(state, ["deployment", "svgUrl", "uml", "pngUrl"]),
    shallow
  );

  return (
    <>
      <Tooltip title="撤销">
        <LeftOutlined
          className={classNames(
            "cursor-pointer text-gray-500 hover:text-gray-900",
            {
              "opacity-30": true,
            }
          )}
          disabled={false}
        />
      </Tooltip>
      <Tooltip title="恢复">
        <RightOutlined
          className={classNames(
            "cursor-pointer text-gray-500 hover:text-gray-900",
            {
              "opacity-30": true,
            }
          )}
        />
      </Tooltip>
      <Popover
        showArrow={false}
        content={
          <div>
            <div>
              <h3 className="pb-2 text-sm font-bold">添加容器</h3>
              <div>
                <AddContainer
                  onClick={(type) =>
                    handleAddContainer(deployment?.root?.id, type)
                  }
                />
              </div>
            </div>
            <div className="pt-8">
              <h3 className="pb-2 text-sm font-bold">添加图形</h3>
              <div>
                <AddObject
                  onClick={(type) =>
                    handleAddObject(deployment?.root?.id, type)
                  }
                />
              </div>
            </div>
          </div>
        }
        placement="leftBottom"
      >
        <PlusOutlined
          className={classNames(
            "cursor-pointer text-gray-500 hover:text-gray-900",
            {}
          )}
        />
      </Popover>
      <Dropdown
        menu={{
          items: [
            {
              label: (
                <div
                  onClick={() => {
                    copy(uml);
                    message.success("复制成功");
                  }}
                >
                  PlantUML
                </div>
              ),
              key: "0",
            },
            {
              label: (
                <a href={pngUrl} target="_blank">
                  PNG
                </a>
              ),
              key: "1",
            },
            {
              label: (
                <a href={svgUrl} target="_blank">
                  SVG
                </a>
              ),
              key: "2",
            },
          ] as MenuProps["items"],
        }}
        trigger={["hover"]}
      >
        <DownloadOutlined
          className={classNames(
            "cursor-pointer text-gray-500 hover:text-gray-900",
            {}
          )}
        />
      </Dropdown>
      <Tooltip title="复制图表">
        <CopyOutlined
          className={classNames(
            "cursor-pointer text-gray-500 hover:text-gray-900",
            {}
          )}
          onClick={() => {
            handleCopyDiagram();
            message.success("复制成功");
          }}
        />
      </Tooltip>
    </>
  );
}

export default Toolbar;
