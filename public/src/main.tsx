import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app.tsx";

createRoot(document.querySelector("#app")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
