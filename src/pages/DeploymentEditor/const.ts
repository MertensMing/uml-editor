import {
  ContainerObjectType,
  ObjectType,
} from "../../core/entities/Deployment";

export const containerMap = {
  [ContainerObjectType.cloud]: "云朵",
  [ContainerObjectType.rectangle]: "矩形",
};

export const objectMap = {
  [ObjectType.circle]: "圆",
  [ObjectType.usecase]: "用例",
  [ObjectType.actor]: "参与者",
  [ObjectType.database]: "数据库",
  [ObjectType.json]: "对象",
  [ObjectType.boundary]: "边界类",
};
