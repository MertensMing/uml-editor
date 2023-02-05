import React from "react";
import ReactDOM from "react-dom/client";
import { Editor as ActivityEditor } from "./pages/ActivityEditor";
import { DeploymentEditor } from "./pages/DeploymentEditor";
import { createHashRouter, RouterProvider } from "react-router-dom";

import "./App.scss";
import { ConfigProvider } from "antd";

const router = createHashRouter([
  {
    path: "/activity",
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
