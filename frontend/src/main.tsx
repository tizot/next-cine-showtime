import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { startOfDay } from "date-fns";

import App from "./App";
import ErrorPage from "./error-page";

const getDate = ({ params }: { params: { date?: string } }) => {
  return startOfDay(
    params.date === undefined ? new Date() : new Date(params.date)
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    loader: getDate,
    errorElement: <ErrorPage />,
  },
  {
    path: "/:date",
    element: <App />,
    loader: getDate,
    errorElement: <ErrorPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
