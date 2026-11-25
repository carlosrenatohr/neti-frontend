import { act, renderHook } from "@testing-library/react";
import { useWeather } from "@/features/weather/hooks/use-weather";
import { requestWeather, WeatherClientError } from "@/features/weather/services/weather-client";
import type { Weather } from "@/features/weather/types/weather.types";

jest.mock("@/features/weather/services/weather-client", () => {
  const actual = jest.requireActual("@/features/weather/services/weather-client");
  return { ...actual, requestWeather: jest.fn() };
});

const requestWeatherMock = jest.mocked(requestWeather);

const weather: Weather = {
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

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

describe("useWeather", () => {
  beforeEach(() => {
    requestWeatherMock.mockReset();
  });

  it("starts idle", () => {
    const { result } = renderHook(() => useWeather());

    expect(result.current.status).toBe("idle");
    expect(result.current.weather).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("stores a successful reading", async () => {
    requestWeatherMock.mockResolvedValueOnce(weather);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search("  Madrid  ");
    });

    expect(requestWeatherMock).toHaveBeenCalledWith("Madrid", expect.any(AbortSignal));
    expect(result.current.status).toBe("success");
    expect(result.current.weather).toEqual(weather);
  });

  it("rejects an empty city without calling the API", async () => {
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search("   ");
    });

    expect(requestWeatherMock).not.toHaveBeenCalled();
    expect(result.current.status).toBe("error");
    expect(result.current.error).toBe("Escribe el nombre de una ciudad.");
  });

  it("exposes the API error message", async () => {
    requestWeatherMock.mockRejectedValueOnce(
      new WeatherClientError("CITY_NOT_FOUND", "No encontramos esa ciudad."),
    );
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search("Atlantis");
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toBe("No encontramos esa ciudad.");
  });

  it("uses a safe fallback for an unexpected failure", async () => {
    requestWeatherMock.mockRejectedValueOnce(new Error("unexpected"));
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search("Madrid");
    });

    expect(result.current.error).toBe("No pudimos obtener el clima. Inténtalo de nuevo.");
  });

  it("keeps the newest result when an older request finishes later", async () => {
    const first = deferred<Weather>();
    const second = deferred<Weather>();
    requestWeatherMock.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const { result } = renderHook(() => useWeather());

    act(() => {
      void result.current.search("Madrid");
    });

    act(() => {
      void result.current.search("Bogotá");
    });

    const bogota = { ...weather, city: "Bogotá" };

    await act(async () => {
      second.resolve(bogota);
      await second.promise;
    });

    expect(result.current.weather).toEqual(bogota);

    await act(async () => {
      first.resolve(weather);
      await first.promise;
    });

    expect(result.current.weather).toEqual(bogota);
  });

  it("aborts the previous request when a new search starts", () => {
    const first = deferred<Weather>();
    const second = deferred<Weather>();
    requestWeatherMock.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const { result } = renderHook(() => useWeather());

    act(() => {
      void result.current.search("Madrid");
    });

    const firstSignal = requestWeatherMock.mock.calls[0]?.[1];
    expect(firstSignal?.aborted).toBe(false);

    act(() => {
      void result.current.search("Bogotá");
    });

    expect(firstSignal?.aborted).toBe(true);
    expect(result.current.status).toBe("loading");
  });
});
