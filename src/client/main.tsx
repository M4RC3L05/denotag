import "./index.css";
import { render } from "preact";
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

render(<App />, document.getElementById("app") as HTMLElement);
