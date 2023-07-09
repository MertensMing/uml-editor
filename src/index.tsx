import "reflect-metadata";
import React from "react";
import ReactDOM from "react-dom/client";
import { DeploymentEditor } from "./pages/DeploymentEditor";
import { createHashRouter, RouterProvider } from "react-router-dom";
import ConfigProvider from "antd/es/config-provider";
import "./App.scss";

const router = createHashRouter([
  {
    path: "/",
    element: <DeploymentEditor />,
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
