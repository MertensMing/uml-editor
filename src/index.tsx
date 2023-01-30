import React from "react";
import ReactDOM from "react-dom/client";
import { Editor as ActivityEditor } from "./pages/ActivityEditor";
import { DeploymentEditor } from "./pages/DeploymentEditor";
import { createHashRouter, RouterProvider } from "react-router-dom";

import "./App.scss";

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
    path: "/deployment",
    element: <DeploymentEditor />,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
