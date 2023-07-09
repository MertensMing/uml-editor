import {
  CopyOutlined,
  DownloadOutlined,
  LeftOutlined,
  PlusOutlined,
  RightOutlined,
} from "@ant-design/icons";
import classNames from "classnames";
import copy from "copy-to-clipboard";
import { Suspense } from "react";
import { useStore } from "zustand";
import shallow from "zustand/shallow";
import {
  useAsyncService,
  useService,
} from "../../../../shared/libs/di/react/useService";
import { pick } from "../../../../shared/utils/pick";
import { useDiagramController } from "../../controller/useDiagramController";
import { useObjectController } from "../../controller/useObjectController";
import { deploymentStoreIdentifier } from "../../store/deploymentStore";
import { Dropdown, MessageIdentifier, Popover, Tooltip } from "../antd";
import { AddContainer } from "./components/AddContainer";
import { AddObject } from "./components/AddObject";

function Toolbar() {
  const deploymentStore = useService(deploymentStoreIdentifier);
  const { handleAddContainer, handleAddObject } = useObjectController();
  const { handleCopyDiagram } = useDiagramController([]);
  const { svgUrl, deployment, uml, pngUrl } = useStore(
    deploymentStore,
    (state) => pick(state, ["deployment", "svgUrl", "uml", "pngUrl"]),
    shallow
  );
  const messageService = useAsyncService(MessageIdentifier);

  return (
    <>
      <Suspense>
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
      </Suspense>
      <Suspense>
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
      </Suspense>

      <Suspense>
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
      </Suspense>
      <Suspense>
        <Dropdown
          menu={{
            items: [
              {
                label: (
                  <div
                    onClick={() => {
                      copy(uml);
                      messageService().then((res) => {
                        res.default.success("复制成功");
                      });
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
            ] as any,
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
      </Suspense>
      <Suspense>
        <Tooltip title="复制图表">
          <CopyOutlined
            className={classNames(
              "cursor-pointer text-gray-500 hover:text-gray-900",
              {}
            )}
            onClick={() => {
              handleCopyDiagram();
              messageService().then((res) => {
                res.default.success("复制成功");
              });
            }}
          />
        </Tooltip>
      </Suspense>
    </>
  );
}

export default Toolbar;
