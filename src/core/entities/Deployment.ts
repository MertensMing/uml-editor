import remove from "lodash/remove";
import uniqBy from "lodash/uniqBy";
import forEach from "lodash/forEach";

export enum RelationType {
  dependency = "dependency",
}

export type Relation = {
  type: RelationType;
  to: BaseObject["id"];
  origin: BaseObject["id"];
  id: string;
  name: string;
  linkColor?: string;
  descColor?: string;
};

export type Deployment = {
  root: ContainerObject;
  last: number;
  relations: {
    [k: BaseObject["id"]]: Relation[];
  };
};

export enum ObjectType {
  circle = "circle",
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
  type: ContainerObjectType,
  last: Deployment["last"]
): ContainerObject {
  return {
    name,
    type,
    children: [],
    id: `object_${last}`,
    isContainer: true,
  };
}

export function createObject(
  name: BaseObject["name"],
  type: ObjectType,
  last: Deployment["last"]
): NormalObject {
  return {
    name,
    type,
    id: `object_${last}`,
    isContainer: false,
  };
}

export function createDiagram(): Deployment {
  const last = 0;
  return {
    root: createContainer("图表名称", ContainerObjectType.diagram, last),
    last,
    relations: {},
  };
}

export function addChildObject(
  container: ContainerObject,
  object: ContainerObject | NormalObject
): void {
  container.children.push(object);
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
  target: BaseObject["id"],
  last: number
): Relation {
  return {
    type: RelationType.dependency,
    origin,
    to: target,
    name: "依赖",
    id: `link_${last}`,
  };
}

export function addRelation(
  diagram: Deployment,
  origin: BaseObject["id"],
  target: BaseObject["id"]
) {
  if (!diagram.relations) {
    diagram.relations = {};
  }
  if (!diagram.relations[origin]) {
    diagram.relations[origin] = [];
  }
  diagram.relations[origin].push(createRelation(origin, target, diagram.last));
  diagram.relations[origin] = uniqBy(diagram.relations[origin], "to");
}

export function removeRelation(
  diagram: Deployment,
  origin: BaseObject["id"],
  target: BaseObject["id"]
) {
  if (!diagram.relations[origin]) {
    diagram.relations[origin] = [];
  }
  remove(diagram.relations[origin], (item) => item.to === target);
}

export function removeAllRelation(diagram: Deployment, id: BaseObject["id"]) {
  forEach(diagram.relations, (relations) => {
    remove(relations, (item) => item.to === id || item.origin === id);
  });
}
