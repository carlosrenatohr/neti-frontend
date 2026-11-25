import {
  weatherErrorResponseSchema,
  weatherSuccessResponseSchema,
} from "@/features/weather/schemas/weather.schema";
import type { Weather, WeatherErrorCode } from "@/features/weather/types/weather.types";

export class WeatherClientError extends Error {
  readonly code: WeatherErrorCode;

  constructor(code: WeatherErrorCode, message: string) {
    super(message);
    this.name = "WeatherClientError";
    this.code = code;
  }
}

// -- the browser only knows this internal contract, never the provider one --
export async function requestWeather(city: string, signal?: AbortSignal): Promise<Weather> {
  let response: Response;

  try {
    response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`, {
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
    const parsedError = weatherErrorResponseSchema.safeParse(payload);

    if (parsedError.success) {
      throw new WeatherClientError(parsedError.data.error.code, parsedError.data.error.message);
    }

    throw new WeatherClientError("UNKNOWN", "No pudimos obtener el clima. Inténtalo de nuevo.");
  }

  const parsedWeather = weatherSuccessResponseSchema.safeParse(payload);

  if (!parsedWeather.success) {
    throw new WeatherClientError(
      "INVALID_RESPONSE",
      "El servicio de clima devolvió una respuesta inesperada.",
    );
  }

  return parsedWeather.data.weather;
}
