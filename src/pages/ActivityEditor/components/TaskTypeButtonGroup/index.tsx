import { PlusOutlined } from "@ant-design/icons";
import { Dropdown, MenuProps } from "antd";
import classNames from "classnames";
import { TaskType } from "../../../../core/entities/Activity";
import { TYPE_MAP } from "../../const";

export function AddTaskType(props: {
  group: TaskType[];
  onClick(type: TaskType): void;
}) {
  return (
    <Dropdown
      menu={{
        items: props.group.map((type, index) => {
          return {
            label: (
              <div key={type} onClick={() => props.onClick(type)}>
                {TYPE_MAP[type]}
              </div>
            ),
            key: index,
          };
        }) as MenuProps["items"],
      }}
      trigger={["hover"]}
    >
      <PlusOutlined
        className={classNames(
          "cursor-pointer text-gray-500 hover:text-gray-900",
          {
            "opacity-30": false,
          }
        )}
      />
    </Dropdown>
  );
}
