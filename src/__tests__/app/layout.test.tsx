import { renderToStaticMarkup } from "react-dom/server";
import { cookies } from "next/headers";
import RootLayout, { metadata, viewport } from "@/app/layout";
import { THEME_COOKIE } from "@/lib/theme";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

const cookiesMock = jest.mocked(cookies);

type CookieStore = Awaited<ReturnType<typeof cookies>>;

function store(value?: string): CookieStore {
  return {
    get: () => (value ? { name: THEME_COOKIE, value } : undefined),
  } as unknown as CookieStore;
}

describe("RootLayout", () => {
  it("renders the Spanish document shell", async () => {
    cookiesMock.mockResolvedValue(store());

    const markup = renderToStaticMarkup(
      await RootLayout({
        children: <p>Contenido</p>,
      }),
    );

    expect(markup).toContain('<html lang="es"');
    expect(markup).toContain("<body><p>Contenido</p></body>");
  });

  it("applies a stored theme before the first paint", async () => {
    cookiesMock.mockResolvedValue(store("dark"));

    const markup = renderToStaticMarkup(
      await RootLayout({
        children: <p>Contenido</p>,
      }),
    );

    expect(markup).toContain('data-theme="dark"');
  });

  it("publishes the application metadata", () => {
    expect(metadata.title).toBe("Atmos — Clima actual");
    expect(viewport.themeColor).toEqual([
      { media: "(prefers-color-scheme: light)", color: "#dfe7e2" },
      { media: "(prefers-color-scheme: dark)", color: "#101713" },
    ]);
  });
});
