export const THEME_COOKIE = "atmos-theme";

export type Theme = "light" | "dark";

// -- only accept the two explicit modes; anything else follows the system --
export function parseTheme(value: string | undefined): Theme | undefined {
  return value === "light" || value === "dark" ? value : undefined;
}
