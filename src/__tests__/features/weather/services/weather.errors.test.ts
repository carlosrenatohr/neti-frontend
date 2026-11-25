import {
  toWeatherErrorPayload,
  WeatherServiceError,
} from "@/features/weather/services/weather.errors";

describe("weather error mapping", () => {
  it("maps a known service error to its status and safe message", () => {
    expect(toWeatherErrorPayload(new WeatherServiceError("CITY_NOT_FOUND"))).toEqual({
      status: 404,
      body: {
        error: {
          code: "CITY_NOT_FOUND",
          message: "No encontramos esa ciudad. Revisa cómo la escribiste o elige una sugerencia.",
        },
      },
    });
  });

  it("maps timeouts to gateway timeout", () => {
    expect(toWeatherErrorPayload(new WeatherServiceError("TIMEOUT")).status).toBe(504);
  });

  it("maps configuration problems to a safe server error", () => {
    expect(toWeatherErrorPayload(new WeatherServiceError("CONFIGURATION_ERROR"))).toEqual({
      status: 500,
      body: {
        error: {
          code: "CONFIGURATION_ERROR",
          message: "Falta la configuración del servicio de clima.",
        },
      },
    });
  });

  it("does not leak an unknown error", () => {
    expect(toWeatherErrorPayload(new Error("provider stack trace"))).toEqual({
      status: 500,
      body: {
        error: {
          code: "UNKNOWN",
          message: "No pudimos obtener el clima. Inténtalo de nuevo.",
        },
      },
    });
  });
});
