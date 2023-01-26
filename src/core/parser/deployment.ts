import {
  ContainerObject,
  NormalObject,
  Deployment as DeploymentType,
  BaseObject,
  Deployment,
  Relation,
} from "../entities/Deployment";
import forEach from "lodash/forEach";

const defaultName = "未命名对象";

function getName(object: BaseObject) {
  return `"<text class="object" objectId="${object.id}">${
    object.name || defaultName
  }</text>"`;
}

const getColor = (c: string) => `${c}`.replace("#", "");

function getColorText(object: BaseObject) {
  const colors = [
    object.bgColor ? getColor(object.bgColor) : "",
    object.textColor ? `text:${getColor(object.textColor)}` : "",
  ].filter((i) => !!i);
  const colorText = colors?.length > 0 ? "#" + colors.join(";") : "";
  return colorText;
}

class DeploymentParser {
  parseDiagram(diagram: DeploymentType) {
    return `
      @startuml

      title ${getName(diagram.root)}

      ${this.parseChildren(diagram.root.children)}

      ${this.parseRelations(diagram)}

      @enduml
    `;
  }
  parseRelations(diagram: Deployment) {
    let result = "";
    forEach(diagram?.relations, (relationArray) => {
      forEach(relationArray, (relation: Relation) => {
        const linkColor = relation.linkColor || "";
        const textColor = relation.descColor || "";
        const desc = textColor
          ? `<color ${textColor}>${relation.name}</color>`
          : relation.name;
        const descText = desc ? `: ${desc}` : "";
        result += `${relation.origin} -${relation.linkDirection || ""}-> ${
          relation.to
        } ${linkColor}${descText}\n`;
      });
    });
    return result;
  }
  parseObject(object: NormalObject) {
    return `
      ${this.parseObjectType(object.type)} ${getName(object)} as ${
      object.id
    } ${getColorText(object)}
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
    ${this.parseContainerType(container.type)} ${getName(container)} as ${
      container.id
    } ${getColorText(container)} {
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
