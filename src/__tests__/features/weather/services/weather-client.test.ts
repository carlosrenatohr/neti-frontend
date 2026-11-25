import { requestWeather } from "@/features/weather/services/weather-client";

const weather = {
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

function response(payload: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => payload,
  } as Response;
}

const originalFetch = global.fetch;

describe("requestWeather", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    global.fetch = fetchMock as unknown as typeof fetch;
    fetchMock.mockReset();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("returns a validated weather reading", async () => {
    fetchMock.mockResolvedValueOnce(response({ weather }));

    await expect(requestWeather("Bogotá")).resolves.toEqual(weather);
    expect(fetchMock).toHaveBeenCalledWith("/api/weather?city=Bogot%C3%A1", {
      signal: undefined,
      cache: "no-store",
    });
  });

  it("surfaces the API error message", async () => {
    fetchMock.mockResolvedValueOnce(
      response(
        { error: { code: "CITY_NOT_FOUND", message: "No encontramos esa ciudad." } },
        false,
        404,
      ),
    );

    await expect(requestWeather("Atlantis")).rejects.toMatchObject({
      name: "WeatherClientError",
      code: "CITY_NOT_FOUND",
      message: "No encontramos esa ciudad.",
    });
  });

  it("falls back to a safe message for an untyped error response", async () => {
    fetchMock.mockResolvedValueOnce(response({ nope: true }, false, 500));

    await expect(requestWeather("Madrid")).rejects.toMatchObject({ code: "UNKNOWN" });
  });

  it("rejects a malformed JSON response", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error("bad json");
      },
    } as unknown as Response);

    await expect(requestWeather("Madrid")).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
  });

  it("rejects an unexpected success payload", async () => {
    fetchMock.mockResolvedValueOnce(response({ weather: { city: "Madrid" } }));

    await expect(requestWeather("Madrid")).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
  });

  it("maps a network failure", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));

    await expect(requestWeather("Madrid")).rejects.toMatchObject({ code: "NETWORK_ERROR" });
  });

  it("rethrows an abort without converting it into a weather error", async () => {
    const abort = Object.assign(new Error("aborted"), { name: "AbortError" });
    fetchMock.mockRejectedValueOnce(abort);

    await expect(requestWeather("Madrid")).rejects.toBe(abort);
  });
});
