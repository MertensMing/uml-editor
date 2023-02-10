import React from "react";
import ReactDOM from "react-dom/client";
import { Editor as ActivityEditor } from "./pages/ActivityEditor";
import { DeploymentEditor } from "./pages/DeploymentEditor";
import { createHashRouter, RouterProvider } from "react-router-dom";

import "./App.scss";
import { ConfigProvider } from "antd";
import { SequenceEditor } from "./pages/SequenceEditor";

const router = createHashRouter([
  {
    path: "/activity",
    element: <ActivityEditor />,
  },
  {
    path: "/activity/:id",
    element: <ActivityEditor />,
  },
  {
    path: "/",
    element: <ActivityEditor />,
  },
  {
    path: "/deployment/:id",
    element: <DeploymentEditor />,
  },
  {
    path: "/deployment",
    element: <DeploymentEditor />,
  },
  {
    path: "/sequence",
    element: <SequenceEditor />,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#f0f0f0",
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  </React.StrictMode>
);
