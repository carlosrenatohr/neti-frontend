/** @jest-environment node */

import { GET } from "@/app/api/weather/route";
import { WeatherServiceError } from "@/features/weather/services/weather.errors";
import { fetchWeather } from "@/features/weather/services/weather.service";
import type { Weather } from "@/features/weather/types/weather.types";

jest.mock("@/features/weather/services/weather.service", () => ({
  fetchWeather: jest.fn(),
}));

const fetchWeatherMock = jest.mocked(fetchWeather);

const weather: Weather = {
  city: "Madrid",
  country: "ES",
  temperature: 18.4,
  feelsLike: 17.9,
  humidity: 64,
  description: "cielo claro",
  condition: "clear",
  icon: "01d",
  windSpeed: 12,
  observedAt: "2026-11-25T12:00:00.000Z",
};

function request(query: string): Request {
  return new Request(`http://localhost/api/weather${query}`);
}

describe("GET /api/weather", () => {
  beforeEach(() => {
    fetchWeatherMock.mockReset();
  });

  it("returns the normalized reading and disables caching", async () => {
    fetchWeatherMock.mockResolvedValueOnce(weather);

    const response = await GET(request("?city=%20Madrid%20"));

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ weather });
    expect(fetchWeatherMock).toHaveBeenCalledWith("Madrid");
  });

  it("rejects a missing city before calling the provider", async () => {
    const response = await GET(request(""));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("INVALID_CITY");
    expect(fetchWeatherMock).not.toHaveBeenCalled();
  });

  it("returns 404 for an unknown city", async () => {
    fetchWeatherMock.mockRejectedValueOnce(new WeatherServiceError("CITY_NOT_FOUND"));

    const response = await GET(request("?city=Atlantis"));
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.error.code).toBe("CITY_NOT_FOUND");
  });

  it("returns 504 for a provider timeout", async () => {
    fetchWeatherMock.mockRejectedValueOnce(new WeatherServiceError("TIMEOUT"));

    const response = await GET(request("?city=Madrid"));

    expect(response.status).toBe(504);
  });

  it("returns a safe 500 for an unexpected failure", async () => {
    fetchWeatherMock.mockRejectedValueOnce(new Error("stack trace"));

    const response = await GET(request("?city=Madrid"));
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toEqual({
      code: "UNKNOWN",
      message: "No pudimos obtener el clima. Inténtalo de nuevo.",
    });
  });
});
