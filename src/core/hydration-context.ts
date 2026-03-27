import { createContext } from "preact";

export type HydrationItem = {
  target: { hydration: string; props?: Record<string, unknown> };
  importPath: string;
  importName: string;
};

export type HydrationConfig = HydrationItem[];

export const HydrationContext = createContext<HydrationConfig>([]);
