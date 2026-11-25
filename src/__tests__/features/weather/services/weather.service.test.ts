/** @jest-environment node */

import { fetchWeather, WEATHER_TIMEOUT_MS } from "@/features/weather/services/weather.service";
import { WeatherServiceError } from "@/features/weather/services/weather.errors";

const providerPayload = {
  weather: [{ main: "Clear", description: "cielo claro", icon: "01d" }],
  main: { temp: 21.2, feels_like: 20.8, humidity: 48 },
  wind: { speed: 3.1 },
  name: "Madrid",
  sys: { country: "ES" },
  dt: 1795608000,
};

const originalFetch = global.fetch;
const originalApiKey = process.env.OPENWEATHER_API_KEY;

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("fetchWeather", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    process.env.OPENWEATHER_API_KEY = "test-key";
    global.fetch = fetchMock as unknown as typeof fetch;
    fetchMock.mockReset();
  });

  afterAll(() => {
    global.fetch = originalFetch;

    if (originalApiKey === undefined) {
      delete process.env.OPENWEATHER_API_KEY;
    } else {
      process.env.OPENWEATHER_API_KEY = originalApiKey;
    }
  });

  it("requests metric units in Spanish and returns a normalized reading", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(providerPayload));

    await expect(fetchWeather("Madrid")).resolves.toMatchObject({
      city: "Madrid",
      country: "ES",
      temperature: 21.2,
      humidity: 48,
      description: "cielo claro",
      condition: "clear",
    });

    const [url, options] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(url.searchParams.get("q")).toBe("Madrid");
    expect(url.searchParams.get("appid")).toBe("test-key");
    expect(url.searchParams.get("units")).toBe("metric");
    expect(url.searchParams.get("lang")).toBe("es");
    expect(options.cache).toBe("no-store");
    expect(WEATHER_TIMEOUT_MS).toBe(8000);
  });

  it("maps an invalid API key without exposing the provider message", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: "Invalid API key" }, 401));

    await expect(fetchWeather("Madrid")).rejects.toMatchObject({
      name: "WeatherServiceError",
      code: "INVALID_API_KEY",
    });
  });

  it("maps a missing city to CITY_NOT_FOUND", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ cod: "404", message: "city not found" }, 404));

    await expect(fetchWeather("Atlantis")).rejects.toMatchObject({ code: "CITY_NOT_FOUND" });
  });

  it("maps rate limiting", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: "too many requests" }, 429));

    await expect(fetchWeather("Madrid")).rejects.toMatchObject({ code: "RATE_LIMITED" });
  });

  it("maps provider server errors", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: "server error" }, 503));

    await expect(fetchWeather("Madrid")).rejects.toMatchObject({ code: "PROVIDER_UNAVAILABLE" });
  });

  it("maps network failures", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));

    await expect(fetchWeather("Madrid")).rejects.toMatchObject({ code: "NETWORK_ERROR" });
  });

  it("maps timeouts", async () => {
    const timeout = Object.assign(new Error("The operation was aborted due to timeout"), {
      name: "TimeoutError",
    });
    fetchMock.mockRejectedValueOnce(timeout);

    await expect(fetchWeather("Madrid")).rejects.toMatchObject({ code: "TIMEOUT" });
  });

  it("rejects malformed JSON", async () => {
    fetchMock.mockResolvedValueOnce(new Response("not json", { status: 200 }));

    await expect(fetchWeather("Madrid")).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
  });

  it("rejects an unexpected success shape", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ unexpected: true }));

    await expect(fetchWeather("Madrid")).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
  });

  it("recognizes a provider-level 404 inside a 200 response", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ cod: 404, message: "city not found" }));

    await expect(fetchWeather("Atlantis")).rejects.toMatchObject({ code: "CITY_NOT_FOUND" });
  });

  it("fails before the request when the API key is missing", async () => {
    delete process.env.OPENWEATHER_API_KEY;

    await expect(fetchWeather("Madrid")).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(fetchWeather("Madrid")).rejects.toMatchObject({ code: "CONFIGURATION_ERROR" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
