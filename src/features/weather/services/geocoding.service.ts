import { openWeatherGeocodingSchema } from "@/features/weather/schemas/geocoding.schema";
import { WeatherServiceError } from "@/features/weather/services/weather.errors";
import type { CitySuggestion } from "@/features/weather/types/weather.types";
import { getWeatherApiKey } from "@/lib/env";

const GEOCODING_ENDPOINT = "https://api.openweathermap.org/geo/1.0/direct";

export const GEOCODING_TIMEOUT_MS = 5000;
export const GEOCODING_LIMIT = 5;

const STATUS_TO_ERROR = {
  401: "INVALID_API_KEY",
  429: "RATE_LIMITED",
} as const;

// -- resolve partial city names against the provider and keep only usable matches --
export async function searchCities(query: string): Promise<CitySuggestion[]> {
  const apiKey = getWeatherApiKey();
  const url = new URL(GEOCODING_ENDPOINT);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(GEOCODING_LIMIT));
  url.searchParams.set("appid", apiKey);

  let response: Response;

  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(GEOCODING_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new WeatherServiceError("TIMEOUT");
    }

    throw new WeatherServiceError("NETWORK_ERROR");
  }

  if (!response.ok) {
    const mappedStatus = response.status as keyof typeof STATUS_TO_ERROR;
    const code = STATUS_TO_ERROR[mappedStatus] ?? "PROVIDER_UNAVAILABLE";
    throw new WeatherServiceError(code);
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new WeatherServiceError("INVALID_RESPONSE");
  }

  const parsed = openWeatherGeocodingSchema.safeParse(payload);

  if (!parsed.success) {
    throw new WeatherServiceError("INVALID_RESPONSE");
  }

  const seen = new Set<string>();

  return parsed.data.flatMap((location) => {
    const id = `${location.lat.toFixed(2)},${location.lon.toFixed(2)}`;

    if (seen.has(id)) {
      return [];
    }

    seen.add(id);

    return [
      {
        id,
        name: location.name,
        state: location.state,
        country: location.country,
        lat: location.lat,
        lon: location.lon,
      },
    ];
  });
}
