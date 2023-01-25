import {
  ContainerObject,
  NormalObject,
  Deployment as DeploymentType,
  BaseObject,
} from "../entities/Deployment";

function getName(object: BaseObject) {
  return `"<text class="object" objectId="${object.id}">${object.name}</text>"`;
}

class DeploymentParser {
  parseDiagram(diagram: DeploymentType) {
    return `
      @startuml

      title ${getName(diagram.root)}

      ${this.parseChildren(diagram.root.children)}

      @enduml
    `;
  }
  parseObject(object: NormalObject) {
    return `
      ${this.parseObjectType(object.type)} ${getName(object)} as object_${
      object.id
    }
    `;
  }
  parseObjectType(type: NormalObject["type"]) {
    return (
      {
        circle: "circle",
      } as { [k in NormalObject["type"]]: string }
    )[type];
  }
  parseContainerType(type: ContainerObject["type"]) {
    return (
      {
        cloud: "cloud",
        rectangle: "rectangle",
      } as { [k in ContainerObject["type"]]: string }
    )[type];
  }
  parseContainer(container: ContainerObject) {
    return `
    ${this.parseContainerType(container.type)} ${getName(
      container
    )} as object_${container.id} {
        ${this.parseChildren(container.children)}
      }
    `;
  }
  parseChildren(children: ContainerObject["children"]) {
    return `
      ${children
        .map((object) => {
          if (!object.isContainer) {
            return this.parseObject(object as NormalObject);
          }
          return this.parseContainer(object);
        })
        .join("")}
    `;
  }
}

export const deploymentParser = new DeploymentParser();
