/** @jest-environment node */

import { GET } from "@/app/api/cities/route";
import { searchCities } from "@/features/weather/services/geocoding.service";
import { WeatherServiceError } from "@/features/weather/services/weather.errors";
import type { CitySuggestion } from "@/features/weather/types/weather.types";

jest.mock("@/features/weather/services/geocoding.service", () => ({
  searchCities: jest.fn(),
}));

const searchCitiesMock = jest.mocked(searchCities);

const cities: CitySuggestion[] = [
  { id: "12.13,-86.25", name: "Managua", country: "NI", lat: 12.1328, lon: -86.2504 },
];

function request(query: string): Request {
  return new Request(`http://localhost/api/cities${query}`);
}

describe("GET /api/cities", () => {
  beforeEach(() => {
    searchCitiesMock.mockReset();
  });

  it("returns the suggestions and disables caching", async () => {
    searchCitiesMock.mockResolvedValueOnce(cities);

    const response = await GET(request("?query=%20Managua%20"));

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ cities });
    expect(searchCitiesMock).toHaveBeenCalledWith("Managua");
  });

  it("rejects a query that is too short", async () => {
    const response = await GET(request("?query=M"));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("INVALID_CITY");
    expect(searchCitiesMock).not.toHaveBeenCalled();
  });

  it("returns an empty list when there are no matches", async () => {
    searchCitiesMock.mockResolvedValueOnce([]);

    const response = await GET(request("?query=Atlantis"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ cities: [] });
  });

  it("returns a safe error when the provider fails", async () => {
    searchCitiesMock.mockRejectedValueOnce(new WeatherServiceError("RATE_LIMITED"));

    const response = await GET(request("?query=Managua"));
    const payload = await response.json();

    expect(response.status).toBe(429);
    expect(payload.error.code).toBe("RATE_LIMITED");
  });
});
