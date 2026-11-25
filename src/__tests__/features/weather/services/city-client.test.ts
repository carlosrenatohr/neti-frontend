import { requestCitySuggestions } from "@/features/weather/services/city-client";
import { WeatherClientError } from "@/features/weather/services/weather-client";

function response(payload: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => payload,
  } as Response;
}

const originalFetch = global.fetch;

const cities = [
  { id: "12.13,-86.25", name: "Managua", country: "NI", lat: 12.1328, lon: -86.2504 },
];

describe("requestCitySuggestions", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    global.fetch = fetchMock as unknown as typeof fetch;
    fetchMock.mockReset();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("requests the internal route and returns the suggestions", async () => {
    fetchMock.mockResolvedValueOnce(response({ cities }));

    await expect(requestCitySuggestions("Managua")).resolves.toEqual(cities);
    expect(fetchMock).toHaveBeenCalledWith("/api/cities?query=Managua", {
      signal: undefined,
      cache: "no-store",
    });
  });

  it("encodes the query", async () => {
    fetchMock.mockResolvedValueOnce(response({ cities: [] }));

    await requestCitySuggestions("Ciudad de México");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/cities?query=Ciudad%20de%20M%C3%A9xico",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("rejects a non-success response", async () => {
    fetchMock.mockResolvedValueOnce(response({ error: { code: "UNKNOWN" } }, false, 500));

    await expect(requestCitySuggestions("Managua")).rejects.toMatchObject({ code: "UNKNOWN" });
  });

  it("rejects an invalid payload", async () => {
    fetchMock.mockResolvedValueOnce(response({ cities: [{ name: "Managua" }] }));

    await expect(requestCitySuggestions("Managua")).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
  });

  it("rejects a body that is not JSON", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError("not json");
      },
    } as unknown as Response);

    await expect(requestCitySuggestions("Managua")).rejects.toBeInstanceOf(WeatherClientError);
  });

  it("maps a network failure", async () => {
    fetchMock.mockRejectedValueOnce(new Error("offline"));

    await expect(requestCitySuggestions("Managua")).rejects.toMatchObject({
      code: "NETWORK_ERROR",
    });
  });

  it("rethrows an abort so the caller can ignore it", async () => {
    const abort = new Error("aborted");
    abort.name = "AbortError";
    fetchMock.mockRejectedValueOnce(abort);

    await expect(requestCitySuggestions("Managua")).rejects.toBe(abort);
  });
});
