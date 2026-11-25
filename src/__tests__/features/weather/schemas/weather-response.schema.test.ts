import {
  weatherErrorResponseSchema,
  weatherSuccessResponseSchema,
} from "@/features/weather/schemas/weather.schema";

const weather = {
  city: "Madrid",
  country: "ES",
  temperature: 18.4,
  feelsLike: 17.9,
  humidity: 64,
  description: "cielo claro",
  condition: "clear" as const,
  icon: "01d",
  windSpeed: 12,
  observedAt: "2026-11-25T12:00:00.000Z",
};

describe("weather API schemas", () => {
  it("accepts a complete success payload", () => {
    expect(weatherSuccessResponseSchema.safeParse({ weather }).success).toBe(true);
  });

  it("rejects an invalid condition", () => {
    expect(
      weatherSuccessResponseSchema.safeParse({ weather: { ...weather, condition: "hail" } })
        .success,
    ).toBe(false);
  });

  it("accepts a typed error payload", () => {
    expect(
      weatherErrorResponseSchema.safeParse({
        error: { code: "CITY_NOT_FOUND", message: "No encontramos esa ciudad." },
      }).success,
    ).toBe(true);
  });

  it("rejects an unknown error code", () => {
    expect(
      weatherErrorResponseSchema.safeParse({
        error: { code: "SOMETHING_ELSE", message: "Error" },
      }).success,
    ).toBe(false);
  });
});
