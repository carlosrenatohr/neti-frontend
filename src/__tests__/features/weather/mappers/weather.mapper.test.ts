import { mapOpenWeatherToWeather } from "@/features/weather/mappers/weather.mapper";
import type { OpenWeatherResponse } from "@/features/weather/schemas/open-weather.schema";

const payload: OpenWeatherResponse = {
  weather: [{ main: "Clouds", description: "nubes dispersas", icon: "03d" }],
  main: { temp: 16.7, feels_like: 15.2, humidity: 71 },
  wind: { speed: 4.5 },
  name: "Bogotá",
  sys: { country: "CO" },
  dt: 1764072000,
};

describe("mapOpenWeatherToWeather", () => {
  it("normalizes provider fields into the application model", () => {
    expect(mapOpenWeatherToWeather(payload)).toEqual({
      city: "Bogotá",
      country: "CO",
      temperature: 16.7,
      feelsLike: 15.2,
      humidity: 71,
      description: "nubes dispersas",
      condition: "clouds",
      icon: "03d",
      windSpeed: 16,
      observedAt: "2025-11-25T12:00:00.000Z",
    });
  });

  it("falls back to an unknown condition and empty optional values", () => {
    const result = mapOpenWeatherToWeather({
      ...payload,
      weather: [{ main: "Volcanic ash", description: "ceniza", icon: "50d" }],
      wind: undefined,
      sys: undefined,
    });

    expect(result.condition).toBe("unknown");
    expect(result.country).toBe("");
    expect(result.windSpeed).toBe(0);
  });
});
