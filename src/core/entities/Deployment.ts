export type Deployment = {
  objects: {
    [key: BaseObject["id"]]: NormalObject | ContainerObject;
  };
  root: ContainerObject;
  last: number;
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
    objects: {},
    root: createContainer("图表名称", ContainerObjectType.diagram, last),
    last,
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
) {
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
