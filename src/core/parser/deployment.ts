import {
  ContainerObject,
  NormalObject,
  Deployment as DeploymentType,
  BaseObject,
  Deployment,
  Relation,
  RelationType,
  ObjectType,
  DEFAULT_NAME,
} from "../entities/Deployment";
import forEach from "lodash/forEach";

function getName(object: BaseObject) {
  return `"<text class="object" objectId="${object.id}">${
    object.name || DEFAULT_NAME
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

      allow_mixing

      ${
        diagram?.linetype !== "default"
          ? `skinparam linetype ${diagram.linetype}`
          : ""
      }

      title ${getName(diagram.root)}

      ${this.parseChildren(diagram.root.children)}

      ${this.parseRelations(diagram)}

      @enduml
    `;
  }
  parseRelationLink(relation: Relation) {
    switch (relation.type) {
      case RelationType.dependency:
        return `.${relation.linkDirection || ""}.>`;
      case RelationType.realize:
        return `.${relation.linkDirection || ""}.|>`;
      case RelationType.generalization:
        return `-${relation.linkDirection || ""}-|>`;
      case RelationType.composition:
        return `-${relation.linkDirection || ""}-*`;
      case RelationType.aggregation:
        return `-${relation.linkDirection || ""}-o`;
      case RelationType.association:
      default:
        return `-${relation.linkDirection || ""}->`;
    }
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
        result += `${relation.origin} ${this.parseRelationLink(relation)} ${
          relation.to
        } ${linkColor}${descText}\n`;
      });
    });
    return result;
  }
  parseObject(object: NormalObject) {
    const comment =
      object.comment && object.comment.content
        ? `note ${object.comment.direction} of ${object.id}
${object.comment.content}
      end note`
        : "";

    if (object.type === ObjectType.json) {
      return `
      ${this.parseObjectType(object.type)} "<color #000001>${
        object.name || DEFAULT_NAME
      }</color>" as ${object.id} ${getColorText(object)} {
        ${object.content || ""}
      }
      ${comment}
    `;
    }
    return `
      ${this.parseObjectType(object.type)} ${getName(object) || "Object"} as ${
      object.id
    } ${getColorText(object)}
      ${comment}
    `;
  }
  parseObjectType(type: NormalObject["type"]) {
    return (
      {
        circle: "circle",
        json: "object",
        actor: "actor",
        boundary: "boundary",
        database: "database",
        usecase: "usecase",
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
    const type = this.parseContainerType(container.type);
    const id = container.id;
    const name = getName(container);
    const color = getColorText(container);
    const comment =
      container.comment && container.comment.content
        ? `note ${container.comment.direction} of ${id}
${container.comment.content}
      end note`
        : "";

    return `
      ${type} ${name} as ${id} ${color} {
        ${this.parseChildren(container.children)}
      }
      ${comment}
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
