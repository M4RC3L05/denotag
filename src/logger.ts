import {
  blue,
  cyan,
  getLogger,
  gray,
  handlers,
  loggerSetup,
  LogLevels,
  LogRecord,
  magenta,
  red,
  reset,
  yellow,
} from "./deps.ts";

export class MyConsoleHandler extends handlers.ConsoleHandler {
  override format(logRecord: LogRecord): string {
    return super.format(logRecord);
  }
}

const logLevelColorMap: Record<LogLevels, (s: string) => string> = {
  [LogLevels.NOTSET]: reset,
  [LogLevels.DEBUG]: gray,
  [LogLevels.INFO]: cyan,
  [LogLevels.WARNING]: yellow,
  [LogLevels.ERROR]: red,
  [LogLevels.CRITICAL]: magenta,
};

loggerSetup({
  handlers: {
    console: new MyConsoleHandler("DEBUG", {
      formatter: ({ levelName, level, msg, args }) =>
        `${logLevelColorMap[level as LogLevels](`${levelName}:`)} ${
          reset(msg)
        }${
          args?.length > 0
            ? `\n\n${blue("Extra:")}\n${
              args.map((x) =>
                Deno.inspect(x, {
                  colors: true,
                  depth: 100,
                  showHidden: true,
                  strAbbreviateSize: Number.POSITIVE_INFINITY,
                  trailingComma: true,
                })
              )
                .join("\n")
            }`
            : ""
        }`,
    }),
  },
  loggers: {
    "denotag": {
      level: "DEBUG",
      handlers: ["console"],
    },
  },
});

export const log = getLogger("denotag");
