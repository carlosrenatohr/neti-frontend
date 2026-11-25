import {
  citySearchQuerySchema,
  citySuggestionsResponseSchema,
  openWeatherGeocodingSchema,
} from "@/features/weather/schemas/geocoding.schema";

describe("citySearchQuerySchema", () => {
  it("trims a valid query", () => {
    expect(citySearchQuerySchema.parse({ query: "  Managua  " })).toEqual({ query: "Managua" });
  });

  it("rejects a query shorter than two letters", () => {
    expect(citySearchQuerySchema.safeParse({ query: " M " }).success).toBe(false);
  });

  it("rejects a query that is too long", () => {
    expect(citySearchQuerySchema.safeParse({ query: "a".repeat(81) }).success).toBe(false);
  });
});

describe("openWeatherGeocodingSchema", () => {
  it("accepts the provider shape with and without state", () => {
    const parsed = openWeatherGeocodingSchema.parse([
      { name: "Managua", lat: 12.13, lon: -86.25, country: "NI" },
      { name: "Austin", lat: 30.26, lon: -97.74, country: "US", state: "Texas" },
    ]);

    expect(parsed).toHaveLength(2);
  });

  it("rejects entries without coordinates", () => {
    expect(openWeatherGeocodingSchema.safeParse([{ name: "Managua", country: "NI" }]).success).toBe(
      false,
    );
  });
});

describe("citySuggestionsResponseSchema", () => {
  it("accepts the internal contract", () => {
    const parsed = citySuggestionsResponseSchema.parse({
      cities: [{ id: "12.13,-86.25", name: "Managua", country: "NI", lat: 12.13, lon: -86.25 }],
    });

    expect(parsed.cities[0]?.name).toBe("Managua");
  });

  it("rejects an invalid country", () => {
    expect(
      citySuggestionsResponseSchema.safeParse({
        cities: [{ id: "1,2", name: "Managua", country: "", lat: 1, lon: 2 }],
      }).success,
    ).toBe(false);
  });
});
