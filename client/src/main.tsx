import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app.tsx";

(() => {
  const getPreferredTheme = () => {
    return globalThis.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const setTheme = (theme: string) => {
    document.documentElement.setAttribute("data-bs-theme", theme);
  };

  setTheme(getPreferredTheme());

  globalThis.matchMedia("(prefers-color-scheme: dark)").addEventListener(
    "change",
    () => {
      setTheme(getPreferredTheme());
    },
  );
})();

createRoot(document.querySelector("#app")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
