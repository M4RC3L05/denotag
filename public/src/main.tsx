import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app.tsx";

(() => {
  const getPreferredTheme = () => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const setTheme = (theme: string) => {
    document.documentElement.setAttribute("data-bs-theme", theme);
  };

  setTheme(getPreferredTheme());

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener(
    "change",
    () => {
      setTheme(getPreferredTheme());
    },
  );
})();

createRoot(document.querySelector("#app")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
