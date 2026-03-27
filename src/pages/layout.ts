import css from "simpledotcss/simple.min.css" with { type: "text" };

type LayoutProps = {
  title?: string;
};

export const layout = (props?: LayoutProps) => (content: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>${props?.title ?? "Denotag"}</title>
        <style>preact-island{display:contents;}${css}</style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `;
};
