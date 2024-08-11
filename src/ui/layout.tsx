import type { FunctionComponent } from "preact";

export const Layout: FunctionComponent = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>DenoTAG</title>

        @@css@@
      </head>

      <body>
        <div
          id="error-dialog"
          class="backdrop-dialog hidden"
        >
          <dialog>
          </dialog>
        </div>

        {children}

        @@js@@
      </body>
    </html>
  );
};
