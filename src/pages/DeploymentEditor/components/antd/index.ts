import { lazy } from "react";
import { createServiceIdentifier } from "../../../../shared/libs/di/utils/createServiceIdentifier";

export const modal = import("antd/es/modal");
export const message = import("antd/es/message");

export const ModalIdentifier =
  createServiceIdentifier<typeof modal>("ModalIdentifier");
export const MessageIdentifier =
  createServiceIdentifier<typeof message>("MessageIdentifier");

export const Popover = lazy(() => import("antd/es/popover"));
export const Dropdown = lazy(() => import("antd/es/dropdown"));
export const Tooltip = lazy(() => import("antd/es/tooltip"));
