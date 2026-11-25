import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { THEME_COOKIE } from "@/lib/theme";

const originalMatchMedia = window.matchMedia;

beforeEach(() => {
  document.documentElement.removeAttribute("data-theme");
  document.cookie = `${THEME_COOKIE}=; path=/; max-age=0`;
  window.matchMedia = jest
    .fn()
    .mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
});

afterAll(() => {
  window.matchMedia = originalMatchMedia;
});

describe("ThemeToggle", () => {
  it("switches from the light default to dark and stores the choice", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: /cambiar entre tema/i }));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.cookie).toContain(`${THEME_COOKIE}=dark`);
  });

  it("switches back to light", async () => {
    document.documentElement.dataset.theme = "dark";
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: /cambiar entre tema/i }));

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.cookie).toContain(`${THEME_COOKIE}=light`);
  });

  it("follows the system preference when the document has no explicit theme", async () => {
    window.matchMedia = jest
      .fn()
      .mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: /cambiar entre tema/i }));

    expect(document.documentElement.dataset.theme).toBe("light");
  });
});
