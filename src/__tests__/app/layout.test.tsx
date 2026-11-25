import { renderToStaticMarkup } from "react-dom/server";
import RootLayout, { metadata, viewport } from "@/app/layout";

describe("RootLayout", () => {
  it("renders the Spanish document shell", () => {
    const markup = renderToStaticMarkup(
      <RootLayout>
        <p>Contenido</p>
      </RootLayout>,
    );

    expect(markup).toContain('<html lang="es"');
    expect(markup).toContain("<body><p>Contenido</p></body>");
  });

  it("publishes the application metadata", () => {
    expect(metadata.title).toBe("Atmos — Clima actual");
    expect(viewport.themeColor).toBe("#dfe7e2");
  });
});
