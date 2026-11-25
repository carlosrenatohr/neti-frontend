"use client";

import { useCallback, useRef, useState } from "react";
import { requestWeather, WeatherClientError } from "@/features/weather/services/weather-client";
import type { Weather } from "@/features/weather/types/weather.types";

export type WeatherStatus = "idle" | "loading" | "success" | "error";

interface UseWeatherResult {
  weather: Weather | null;
  error: string | null;
  status: WeatherStatus;
  search: (city: string) => Promise<void>;
}

export function useWeather(): UseWeatherResult {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<WeatherStatus>("idle");
  const requestId = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);

  const search = useCallback(async (rawCity: string) => {
    const city = rawCity.trim();
    const nextRequestId = requestId.current + 1;
    requestId.current = nextRequestId;
    controllerRef.current?.abort();

    if (!city) {
      setWeather(null);
      setError("Escribe el nombre de una ciudad.");
      setStatus("error");
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setWeather(null);
    setError(null);
    setStatus("loading");

    try {
      const result = await requestWeather(city, controller.signal);

      // -- a slower previous request must never replace the latest search --
      if (requestId.current !== nextRequestId) {
        return;
      }

      setWeather(result);
      setStatus("success");
    } catch (requestError) {
      if (controller.signal.aborted || requestId.current !== nextRequestId) {
        return;
      }

      setError(
        requestError instanceof WeatherClientError
          ? requestError.message
          : "No pudimos obtener el clima. Inténtalo de nuevo.",
      );
      setStatus("error");
    }
  }, []);

  return { weather, error, status, search };
}
