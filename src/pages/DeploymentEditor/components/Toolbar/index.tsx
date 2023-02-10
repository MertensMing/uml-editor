import {
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Dropdown, MenuProps, message, Tooltip } from "antd";
import classNames from "classnames";
import copy from "copy-to-clipboard";
import { StoreApi, useStore } from "zustand";
import shallow from "zustand/shallow";
import {
  ContainerObjectType,
  findObject,
} from "../../../../core/entities/Deployment";
import { ListStore } from "../../../../shared/store/listStore";
import { UndoStore } from "../../../../shared/store/undo";
import { pick } from "../../../../shared/utils/pick";
import { useEditDeploymentController } from "../../controller/useEditDeploymentController";
import { DeploymentStore } from "../../store/deploymentStore";

function Toolbar(props: {
  deploymentStore: StoreApi<DeploymentStore>;
  undoStore: StoreApi<UndoStore<any>>;
  listStore: StoreApi<ListStore>;
}) {
  const { deploymentStore, undoStore, listStore } = props;
  const { handleDelete, handleUndo, handleRedo } = useEditDeploymentController([
    deploymentStore,
    undoStore,
    listStore,
  ]);
  const { allowRedo, allowUndo } = useStore(
    undoStore,
    (state) => ({
      allowUndo: state.undoIndex < state.queue.length - 1,
      allowRedo: state.undoIndex !== 0,
    }),
    shallow
  );
  const { currentObjectId, svgUrl, deployment, uml, pngUrl } = useStore(
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
  const currentObject = useStore(
    deploymentStore,
    (state) =>
      !state.deployment?.root
        ? undefined
        : findObject(state.deployment?.root, state.currentObjectId),
    shallow
  );
  const relations = deployment?.relations?.[currentObjectId] ?? [];
  const isRoot = currentObject?.type === ContainerObjectType.diagram;
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

      <Tooltip title="删除对象">
        <DeleteOutlined
          onClick={() => !isRoot && handleDelete(currentObjectId)}
          className={classNames(
            "cursor-pointer text-gray-500 hover:text-gray-900",
            {
              "opacity-30": isRoot,
            }
          )}
        />
      </Tooltip>

      <Tooltip title="复制 PlantUML">
        <CopyOutlined
          className={classNames(
            "cursor-pointer text-gray-500 hover:text-gray-900",
            {}
          )}
          onClick={() => {
            copy(uml);
            message.success("复制成功");
          }}
        />
      </Tooltip>
      <Dropdown
        menu={{
          items: [
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
    </>
  );
}

export default Toolbar;
