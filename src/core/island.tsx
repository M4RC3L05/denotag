import type Preact from "preact";
import {
  type ContainerNode,
  createContext,
  type FunctionalComponent,
  hydrate,
} from "preact";
import { useContext } from "preact/hooks";
import { HydrationContext } from "./hydration-context.ts";

declare module "preact/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "preact-island": Preact.HTMLAttributes<HTMLElement>;
    }
  }
}

const isBrowser = typeof document !== "undefined";
const IslandContext = createContext(false);

export function withIsland<P extends Record<string, unknown>>(
  Component: FunctionalComponent<P>,
  path: string,
): FunctionalComponent<P> {
  if (isBrowser) {
    return (props: P, target: ContainerNode) => {
      if (target instanceof HTMLElement) {
        hydrate(<Component {...props} />, target);

        return;
      }

      return <Component {...props} />;
    };
  }

  // This prevents bundling the server code!
  const importPath = path.substring(
    path.indexOf("src/islands/") + "src/islands/".length,
  ).replace(/\.[^/.]+$/, ".js");
  const importName = importPath?.replaceAll("/", "_")?.replaceAll(".", "_")
    ?.replaceAll("-", "_");

  return (props: P) => {
    const inIslandContext = useContext(IslandContext);
    const hydrations = useContext(HydrationContext);
    const target = !inIslandContext
      ? {
        hydration: `pih-${importName}-${(hydrations?.length ?? 0) + 1}`,
        props,
      }
      : undefined;

    if (!inIslandContext) {
      hydrations.push({ target: target!, importPath, importName });
    }

    return inIslandContext
      ? <Component {...props} />
      : (
        <IslandContext.Provider value>
          <preact-island id={target?.hydration}>
            <Component {...props} />
          </preact-island>
        </IslandContext.Provider>
      );
  };
}
