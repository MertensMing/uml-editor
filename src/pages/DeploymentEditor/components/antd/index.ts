import { lazy } from "react";
import { createAysncServiceIdentifier } from "../../../../shared/libs/di/utils/createServiceIdentifier";

export const modal = import("antd/es/modal");
export const message = import("antd/es/message");

export const ModalIdentifier =
  createAysncServiceIdentifier<typeof modal>("ModalIdentifier");
export const MessageIdentifier =
  createAysncServiceIdentifier<typeof message>("MessageIdentifier");

export const Popover = lazy(() => import("antd/es/popover"));
export const Dropdown = lazy(() => import("antd/es/dropdown"));
export const Tooltip = lazy(() => import("antd/es/tooltip"));
