import remove from "lodash/remove";
import uniqBy from "lodash/uniqBy";
import forEach from "lodash/forEach";

const getId = () => {
  return `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

export const DEFAULT_NAME = "未命名对象";

export enum RelationType {
  association = "association", // 关联
  dependency = "dependency", // 依赖
  realize = "realize", // 实现
  generalization = "generalization", // 继承
  aggregation = "aggregation", // 聚合
  composition = "composition", // 组合
}

export type LineType = "ortho" | "polyline" | "default";

export type Relation = {
  type: RelationType;
  to: BaseObject["id"];
  origin: BaseObject["id"];
  id: string;
  name: string;
  linkColor?: string;
  descColor?: string;
  linkDirection?: "up" | "down" | "left" | "right";
};

export type Deployment = {
  linetype: LineType;
  root: ContainerObject;
  relations: {
    [k: BaseObject["id"]]: Relation[];
  };
  id: string;
};

export enum ObjectType {
  circle = "circle",
  json = "json",
}

export enum ContainerObjectType {
  rectangle = "rectangle",
  cloud = "cloud",
  diagram = "diagram",
}

export type BaseObject = {
  name: string;
  id: string;
  bgColor?: string;
  textColor?: string;
  content?: string;
};

export type NormalObject = BaseObject & {
  isContainer: false;
  type: ObjectType;
};

export type ContainerObject = BaseObject & {
  isContainer: true;
  type: ContainerObjectType;
  children: Array<NormalObject | ContainerObject>;
};

export function createContainer(
  name: string,
  type: ContainerObjectType
): ContainerObject {
  return {
    name,
    type,
    children: [],
    id: `object_${getId()}`,
    isContainer: true,
  };
}

export function createObject(
  name: BaseObject["name"],
  type: ObjectType
): NormalObject {
  return {
    name,
    type,
    id: `object_${getId()}`,
    isContainer: false,
  };
}

export function createDiagram(): Deployment {
  return {
    root: createContainer("架构图名称", ContainerObjectType.diagram),
    relations: {},
    linetype: "default",
    id: `deployment_${getId()}`,
  };
}

export function findObject(
  container: ContainerObject,
  target: BaseObject["id"]
): NormalObject | ContainerObject | undefined {
  if (container.id === target) {
    return container;
  }
  for (const item of container.children) {
    if (item.isContainer) {
      const result = findObject(item, target);
      if (result) return result;
    }
    if (item.id === target) {
      return item;
    }
  }
}

export function removeObject(
  container: ContainerObject,
  target: BaseObject["id"]
) {
  const [removed] = remove(container.children, (item) => item.id === target);
  if (removed) {
    return removed;
  }
  for (const item of container.children) {
    if (item.isContainer) {
      const result = removeObject(item, target);
      if (result) return result;
    }
  }
}

export function insertObject(
  container: ContainerObject,
  target: ContainerObject | NormalObject
) {
  container.children.push(target);
}

export function createRelation(
  origin: BaseObject["id"],
  target: BaseObject["id"]
): Relation {
  return {
    type: RelationType.association,
    origin,
    to: target,
    name: "",
    id: `link_${getId()}`,
  };
}

export function addRelation(
  diagram: Deployment,
  origin: BaseObject["id"],
  target: BaseObject["id"]
) {
  if (!diagram?.relations[origin]) {
    diagram.relations[origin] = [];
  }
  diagram?.relations[origin].push(createRelation(origin, target));
  diagram.relations[origin] = uniqBy(diagram.relations[origin], "to");
}

export function removeRelation(
  diagram: Deployment,
  origin: BaseObject["id"],
  target: BaseObject["id"]
) {
  remove(diagram?.relations?.[origin], (item) => item.to === target);
}

export function removeAllRelation(diagram: Deployment, id: BaseObject["id"]) {
  forEach(diagram?.relations, (relations) => {
    remove(relations, (item) => item.to === id || item.origin === id);
  });
}

export function correctDeployment(diagram: Deployment) {
  forEach(diagram?.relations, (relations: Relation[]) => {
    remove(
      relations,
      (item) =>
        !findObject(diagram.root, item.origin) ||
        !findObject(diagram.root, item.to)
    );
  });
}
