import { FEATURED_CITIES, type FeaturedCity } from "@/features/weather/data/featured-cities";
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

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function toSuggestion(city: FeaturedCity): CitySuggestion {
  return {
    id: `${city.lat.toFixed(2)},${city.lon.toFixed(2)}`,
    name: city.name,
    state: city.state,
    country: city.country,
    lat: city.lat,
    lon: city.lon,
  };
}

// -- match the curated list without accents or case so "leon" finds "León" --
function findFeatured(query: string, limit: number): CitySuggestion[] {
  const needle = normalize(query);
  const starts: FeaturedCity[] = [];
  const contains: FeaturedCity[] = [];

  for (const city of FEATURED_CITIES) {
    const name = normalize(city.name);

    if (name.startsWith(needle)) {
      starts.push(city);
    } else if (name.includes(needle)) {
      contains.push(city);
    }
  }

  return [...starts, ...contains].slice(0, limit).map(toSuggestion);
}

// -- one place can arrive from both sources with slightly different coordinates --
function dedupe(cities: CitySuggestion[], limit: number): CitySuggestion[] {
  const seen = new Set<string>();
  const result: CitySuggestion[] = [];

  for (const city of cities) {
    const key = `${normalize(city.name)}|${normalize(city.state ?? "")}|${city.country}`;

    if (!seen.has(key)) {
      seen.add(key);
      result.push(city);
    }
  }

  return result.slice(0, limit);
}

// -- resolve partial city names against the curated list and the provider --
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

  const providerCities = parsed.data.map((location) =>
    toSuggestion({
      name: location.name,
      state: location.state,
      country: location.country,
      lat: location.lat,
      lon: location.lon,
    }),
  );

  return dedupe([...findFeatured(query, GEOCODING_LIMIT), ...providerCities], GEOCODING_LIMIT);
}
