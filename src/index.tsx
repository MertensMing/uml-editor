import "reflect-metadata";
import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { DeploymentEditor } from "./pages/DeploymentEditor";
import { createHashRouter, RouterProvider } from "react-router-dom";
import "./App.scss";

const ConfigProvider = lazy(() => import("antd/es/config-provider"));

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
    <Suspense>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#f0f0f0",
          },
        }}
      >
        <RouterProvider router={router} />
      </ConfigProvider>
    </Suspense>
  </React.StrictMode>
);
