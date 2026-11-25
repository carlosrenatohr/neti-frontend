import type { WeatherError, WeatherErrorCode } from "@/features/weather/types/weather.types";

const MESSAGES: Record<WeatherErrorCode, string> = {
  INVALID_CITY: "Escribe el nombre de una ciudad.",
  CITY_NOT_FOUND: "No encontramos esa ciudad. Revisa el nombre e inténtalo de nuevo.",
  INVALID_API_KEY: "El servicio de clima no está configurado correctamente.",
  RATE_LIMITED: "Hay demasiadas consultas ahora mismo. Espera unos segundos.",
  PROVIDER_UNAVAILABLE: "El servicio de clima no está disponible. Inténtalo más tarde.",
  NETWORK_ERROR: "No pudimos conectar con el servicio de clima.",
  TIMEOUT: "El servicio de clima tardó demasiado en responder.",
  INVALID_RESPONSE: "El servicio de clima devolvió una respuesta inesperada.",
  CONFIGURATION_ERROR: "Falta la configuración del servicio de clima.",
  UNKNOWN: "No pudimos obtener el clima. Inténtalo de nuevo.",
};

const STATUS_BY_CODE: Record<WeatherErrorCode, number> = {
  INVALID_CITY: 400,
  CITY_NOT_FOUND: 404,
  INVALID_API_KEY: 502,
  RATE_LIMITED: 429,
  PROVIDER_UNAVAILABLE: 502,
  NETWORK_ERROR: 502,
  TIMEOUT: 504,
  INVALID_RESPONSE: 502,
  CONFIGURATION_ERROR: 500,
  UNKNOWN: 500,
};

export class WeatherServiceError extends Error {
  readonly code: WeatherErrorCode;

  constructor(code: WeatherErrorCode) {
    super(MESSAGES[code]);
    this.name = "WeatherServiceError";
    this.code = code;
  }
}

export function toWeatherErrorPayload(error: unknown): {
  status: number;
  body: { error: WeatherError };
} {
  const code = error instanceof WeatherServiceError ? error.code : "UNKNOWN";

  return {
    status: STATUS_BY_CODE[code],
    body: {
      error: {
        code,
        message: MESSAGES[code],
      },
    },
  };
}
