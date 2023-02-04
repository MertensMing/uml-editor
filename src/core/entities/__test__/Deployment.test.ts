import {
  insertObject,
  ContainerObjectType,
  createContainer,
  createDiagram,
  createObject,
  findObject,
  ObjectType,
  removeObject,
  addRelation,
  removeRelation,
  removeAllRelation,
  correctDeployment,
} from "../Deployment";

describe("部署图", () => {
  test("创建部署图", () => {
    const diagram = createDiagram();
    expect(diagram.linetype).toBe("default");
    expect(diagram.root.name).toBe("图表名称");
    expect(diagram.root.type).toBe(ContainerObjectType.diagram);
  });

  test("创建对象", () => {
    const object = createObject("对象名称", ObjectType.circle);
    expect(object.name).toBe("对象名称");
    expect(object.type).toBe(ObjectType.circle);
  });

  test("创建容器", () => {
    const container = createContainer("容器", ContainerObjectType.rectangle);
    expect(container.name).toBe("容器");
    expect(container.type).toBe(ContainerObjectType.rectangle);
  });

  test("添加对象", () => {
    const container = createContainer("容器", ContainerObjectType.rectangle);
    const object = createObject("对象名称", ObjectType.circle);
    insertObject(container, object);
    expect(container.children.length).toBe(1);
  });

  test("查找当前对象", () => {
    const container = createContainer("容器", ContainerObjectType.rectangle);
    const target = findObject(container, container.id);
    expect(target.id).toBe(container.id);
  });

  test("查找对象", () => {
    const container = createContainer("容器", ContainerObjectType.rectangle);
    const container2 = createContainer("容器", ContainerObjectType.rectangle);
    const object = createObject("对象名称", ObjectType.circle);
    const object2 = createObject("对象名称", ObjectType.circle);
    insertObject(container, container2);
    insertObject(container, object);
    insertObject(container, object2);
    const target = findObject(container, object.id);
    expect(target.id).toBe(object.id);
  });

  test("移除对象", () => {
    const container = createContainer("容器", ContainerObjectType.rectangle);
    const object = createObject("对象名称", ObjectType.circle);
    insertObject(container, object);
    const target = removeObject(container, object.id);
    expect(target.id).toBe(object.id);
  });

  test("移除深层对象", () => {
    const container = createContainer("容器", ContainerObjectType.rectangle);
    const container2 = createContainer("容器", ContainerObjectType.rectangle);
    const container3 = createContainer("容器", ContainerObjectType.rectangle);
    const object = createObject("对象名称", ObjectType.circle);
    insertObject(container, container2);
    insertObject(container2, container3);
    insertObject(container3, object);
    const target = removeObject(container, object.id);
    expect(target.id).toBe(object.id);
  });

  test("添加关系", () => {
    const diagram = createDiagram();
    const container = createContainer("容器", ContainerObjectType.rectangle);
    const object = createObject("对象名称", ObjectType.circle);
    insertObject(diagram.root, container);
    insertObject(container, object);
    addRelation(diagram, container.id, object.id);
    expect(diagram.relations[container.id][0].origin).toBe(container.id);
    expect(diagram.relations[container.id][0].to).toBe(object.id);
  });

  test("移除关系", () => {
    const diagram = createDiagram();
    const container = createContainer("容器", ContainerObjectType.rectangle);
    const object = createObject("对象名称", ObjectType.circle);
    insertObject(diagram.root, container);
    insertObject(container, object);
    addRelation(diagram, container.id, object.id);
    expect(diagram.relations[container.id][0].origin).toBe(container.id);
    expect(diagram.relations[container.id][0].to).toBe(object.id);
    removeRelation(diagram, container.id, object.id);
    expect(diagram.relations[container.id]?.length).toBe(0);
  });

  test("移除所有关系", () => {
    const diagram = createDiagram();
    const container = createContainer("容器", ContainerObjectType.rectangle);
    const object = createObject("对象名称", ObjectType.circle);
    insertObject(diagram.root, container);
    insertObject(container, object);
    addRelation(diagram, container.id, object.id);
    expect(diagram.relations[container.id][0].origin).toBe(container.id);
    expect(diagram.relations[container.id][0].to).toBe(object.id);
    removeAllRelation(diagram, object.id);
    correctDeployment(diagram);
    expect(diagram.relations[container.id]?.length).toBe(0);
  });
});
