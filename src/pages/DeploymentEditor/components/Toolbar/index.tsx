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
import { StoreApi, useStore } from "zustand";
import shallow from "zustand/shallow";
import { ListStore } from "../../../../shared/store/listStore";
import { UndoStore } from "../../../../shared/store/undo";
import { pick } from "../../../../shared/utils/pick";
import { useEditDeploymentController } from "../../controller/useEditDeploymentController";
import { DeploymentStore } from "../../store/deploymentStore";
import { AddContainer } from "../AddContainer";
import { AddObject } from "../AddObject";

function Toolbar(props: {
  deploymentStore: StoreApi<DeploymentStore>;
  undoStore: StoreApi<UndoStore<any>>;
  listStore: StoreApi<ListStore>;
}) {
  const { deploymentStore, undoStore, listStore } = props;
  const {
    handleUndo,
    handleRedo,
    handleAddContainer,
    handleAddObject,
    handleCopyDiagram,
  } = useEditDeploymentController([deploymentStore, undoStore, listStore]);
  const { allowRedo, allowUndo } = useStore(
    undoStore,
    (state) => ({
      allowUndo: state.undoIndex < state.queue.length - 1,
      allowRedo: state.undoIndex !== 0,
    }),
    shallow
  );
  const { svgUrl, deployment, uml, pngUrl } = useStore(
    deploymentStore,
    (state) =>
      pick(state, [
        "currentObjectId",
        "deployment",
        "svgUrl",
        "allowDragRelation",
        "uml",
        "pngUrl",
      ]),
    shallow
  );

  return (
    <>
      <Tooltip title="撤销">
        <LeftOutlined
          className={classNames(
            "cursor-pointer text-gray-500 hover:text-gray-900",
            {
              "opacity-30": !allowUndo,
            }
          )}
          disabled={!allowUndo}
          onClick={allowUndo && handleUndo}
        />
      </Tooltip>

      <Tooltip title="恢复">
        <RightOutlined
          className={classNames(
            "cursor-pointer text-gray-500 hover:text-gray-900",
            {
              "opacity-30": !allowRedo,
            }
          )}
          onClick={allowRedo && handleRedo}
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
