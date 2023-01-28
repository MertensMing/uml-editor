import React from "react";
import ReactDOM from "react-dom/client";
import {
  Experimental_CssVarsProvider as CssVarsProvider,
  experimental_extendTheme as extendTheme,
} from "@mui/material/styles";
import { Editor as ActivityEditor } from "./pages/ActivityEditor";
import { DeploymentEditor } from "./pages/DeploymentEditor";
import { createHashRouter, RouterProvider } from "react-router-dom";
import * as colors from "@mui/material/colors";

import "./App.scss";

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: colors.grey[900],
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: colors.grey[400],
        },
      },
    },
  },
});

const router = createHashRouter([
  {
    path: "/activity",
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
    <CssVarsProvider theme={theme}>
      <RouterProvider router={router} />
    </CssVarsProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
