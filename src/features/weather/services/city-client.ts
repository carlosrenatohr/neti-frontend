import { citySuggestionsResponseSchema } from "@/features/weather/schemas/geocoding.schema";
import { WeatherClientError } from "@/features/weather/services/weather-client";
import type { CitySuggestion } from "@/features/weather/types/weather.types";

// -- suggestions share the same safe error contract as the weather client --
export async function requestCitySuggestions(
  query: string,
  signal?: AbortSignal,
): Promise<CitySuggestion[]> {
  let response: Response;

  try {
    response = await fetch(`/api/cities?query=${encodeURIComponent(query)}`, {
      signal,
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    throw new WeatherClientError("NETWORK_ERROR", "No pudimos conectar con el servicio de clima.");
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new WeatherClientError(
      "INVALID_RESPONSE",
      "El servicio de clima devolvió una respuesta inesperada.",
    );
  }

  if (!response.ok) {
    throw new WeatherClientError("UNKNOWN", "No pudimos cargar las sugerencias.");
  }

  const parsed = citySuggestionsResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new WeatherClientError(
      "INVALID_RESPONSE",
      "El servicio de clima devolvió una respuesta inesperada.",
    );
  }

  return parsed.data.cities;
}
