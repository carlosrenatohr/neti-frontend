/** @jest-environment node */

import { GEOCODING_LIMIT, searchCities } from "@/features/weather/services/geocoding.service";
import { WeatherServiceError } from "@/features/weather/services/weather.errors";

const providerPayload = [
  { name: "Managua", lat: 12.1328, lon: -86.2504, country: "NI" },
  { name: "Managua", lat: 12.1328, lon: -86.2504, country: "NI" },
  { name: "Managua", lat: 10.0, lon: -85.0, country: "CR", state: "Guanacaste" },
];

const originalFetch = global.fetch;
const originalApiKey = process.env.OPENWEATHER_API_KEY;

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("searchCities", () => {
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

  it("requests the provider limit and normalizes the matches", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(providerPayload));

    await expect(searchCities("Managua")).resolves.toEqual([
      { id: "12.13,-86.25", name: "Managua", country: "NI", lat: 12.1328, lon: -86.2504 },
      {
        id: "10.00,-85.00",
        name: "Managua",
        state: "Guanacaste",
        country: "CR",
        lat: 10,
        lon: -85,
      },
    ]);

    const [url, options] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(url.searchParams.get("q")).toBe("Managua");
    expect(url.searchParams.get("limit")).toBe(String(GEOCODING_LIMIT));
    expect(url.searchParams.get("appid")).toBe("test-key");
    expect(options.cache).toBe("no-store");
  });

  it("throws a safe error when the provider rejects the key", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: "bad key" }, 401));

    await expect(searchCities("Managua")).rejects.toMatchObject({ code: "INVALID_API_KEY" });
  });

  it("throws a safe error when the provider rate limits", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: "slow down" }, 429));

    await expect(searchCities("Managua")).rejects.toMatchObject({ code: "RATE_LIMITED" });
  });

  it("maps any other provider status to an unavailable service", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 500));

    await expect(searchCities("Managua")).rejects.toMatchObject({
      code: "PROVIDER_UNAVAILABLE",
    });
  });

  it("rejects malformed JSON", async () => {
    fetchMock.mockResolvedValueOnce(new Response("not json", { status: 200 }));

    await expect(searchCities("Managua")).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it("rejects a payload that does not match the provider schema", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ name: "Managua" }));

    await expect(searchCities("Managua")).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
  });

  it("maps a timeout to a safe error", async () => {
    const timeout = new Error("timed out");
    timeout.name = "TimeoutError";
    fetchMock.mockRejectedValueOnce(timeout);

    await expect(searchCities("Managua")).rejects.toMatchObject({ code: "TIMEOUT" });
  });

  it("maps a network failure to a safe error", async () => {
    fetchMock.mockRejectedValueOnce(new Error("offline"));

    await expect(searchCities("Managua")).rejects.toMatchObject({ code: "NETWORK_ERROR" });
  });
});
