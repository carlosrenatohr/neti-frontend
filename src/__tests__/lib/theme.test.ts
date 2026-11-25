import { parseTheme, THEME_COOKIE } from "@/lib/theme";

describe("parseTheme", () => {
  it("accepts both explicit modes", () => {
    expect(parseTheme("light")).toBe("light");
    expect(parseTheme("dark")).toBe("dark");
  });

  it("ignores anything else so the system preference wins", () => {
    expect(parseTheme(undefined)).toBeUndefined();
    expect(parseTheme("sepia")).toBeUndefined();
    expect(parseTheme("")).toBeUndefined();
  });

  it("keeps a stable cookie name", () => {
    expect(THEME_COOKIE).toBe("atmos-theme");
  });
});
