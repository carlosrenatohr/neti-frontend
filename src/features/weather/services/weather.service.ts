import {
  openWeatherErrorSchema,
  openWeatherResponseSchema,
} from "@/features/weather/schemas/open-weather.schema";
import { mapOpenWeatherToWeather } from "@/features/weather/mappers/weather.mapper";
import { WeatherServiceError } from "@/features/weather/services/weather.errors";
import type { Weather } from "@/features/weather/types/weather.types";
import { getWeatherApiKey } from "@/lib/env";

const WEATHER_ENDPOINT = "https://api.openweathermap.org/data/2.5/weather";

export const WEATHER_TIMEOUT_MS = 8000;

const STATUS_TO_ERROR = {
  401: "INVALID_API_KEY",
  404: "CITY_NOT_FOUND",
  429: "RATE_LIMITED",
} as const;

// -- keep provider communication behind one boundary and one normalized result --
export async function fetchWeather(city: string): Promise<Weather> {
  const apiKey = getWeatherApiKey();
  const url = new URL(WEATHER_ENDPOINT);
  url.searchParams.set("q", city);
  url.searchParams.set("appid", apiKey);
  url.searchParams.set("units", "metric");
  url.searchParams.set("lang", "es");

  let response: Response;

  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(WEATHER_TIMEOUT_MS),
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

  const parsed = openWeatherResponseSchema.safeParse(payload);

  if (!parsed.success) {
    const providerError = openWeatherErrorSchema.safeParse(payload);
    const providerCode = providerError.success ? Number(providerError.data.cod) : Number.NaN;

    throw new WeatherServiceError(providerCode === 404 ? "CITY_NOT_FOUND" : "INVALID_RESPONSE");
  }

  return mapOpenWeatherToWeather(parsed.data);
}
