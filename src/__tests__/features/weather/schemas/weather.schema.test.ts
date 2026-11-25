import { cityQuerySchema } from "@/features/weather/schemas/weather.schema";

describe("cityQuerySchema", () => {
  it("trims a valid city", () => {
    expect(cityQuerySchema.parse({ city: "  Madrid  " })).toEqual({ city: "Madrid" });
  });

  it("rejects an empty city", () => {
    expect(cityQuerySchema.safeParse({ city: "" }).success).toBe(false);
  });

  it("rejects a whitespace-only city", () => {
    expect(cityQuerySchema.safeParse({ city: "   " }).success).toBe(false);
  });

  it("rejects a city longer than 80 characters", () => {
    expect(cityQuerySchema.safeParse({ city: "a".repeat(81) }).success).toBe(false);
  });
});
