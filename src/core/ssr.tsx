import type { FunctionalComponent } from "preact";
import { renderToString } from "preact-render-to-string";
import { type HydrationConfig, HydrationContext } from "./hydration-context.ts";

type RenderPageProps<P> = {
  props?: P;
  layout: (content: string) => string;
};

const cacheKey = Deno.env.get("STATIC_CACHE_KEY") ?? crypto.randomUUID();

export type LayoutFunction = () => string;

export const renderPage = <
  P extends Record<string, unknown> = Record<string, unknown>,
>(
  PageContent: FunctionalComponent<P>,
  args: RenderPageProps<P>,
) => {
  // This will be mutated with hydration items to be placed in the hydration script.
  const hydrations: HydrationConfig = [];

  const pageHtml = renderToString(
    <HydrationContext.Provider value={hydrations}>
      <PageContent {...(args?.props ?? ({} as P))} />
    </HydrationContext.Provider>,
  );

  let scriptSrc = "";

  if (hydrations.length > 0) {
    let importsSrc = "";
    let codeSrc = "";
    const imports: Map<string, boolean> = new Map();

    for (let i = 0, size = hydrations.length; i < size; i += 1) {
      const item = hydrations[i]!;

      if (!imports.has(item.importPath)) {
        imports.set(item.importPath, true);

        importsSrc +=
          `import ${item.importName} from "/static/dist/${item.importPath}?ck=${cacheKey}";`;
      }

      codeSrc += `${item.importName}(${
        JSON.stringify(item.target.props)
      }, document.getElementById("${item.target.hydration}"));`;
    }

    scriptSrc = `<script type="module">${importsSrc}${codeSrc}</script>`;
  }

  return args.layout(`${pageHtml}${scriptSrc}`);
};
