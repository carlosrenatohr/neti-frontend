import type { WeatherCondition } from "@/features/weather/types/weather.types";

export const CONDITION_LABELS: Record<WeatherCondition, string> = {
  clear: "Despejado",
  clouds: "Nublado",
  rain: "Lluvia",
  drizzle: "Llovizna",
  thunderstorm: "Tormenta",
  snow: "Nieve",
  mist: "Niebla",
  unknown: "Variable",
};

export function formatTemperature(value: number): string {
  return `${Math.round(value)}°`;
}

export function formatHumidity(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatWind(value: number): string {
  return `${Math.round(value)} km/h`;
}

const regionNames = new Intl.DisplayNames(["es"], { type: "region" });

// -- show "Nicaragua" instead of "NI" while keeping the provider's ISO code intact --
export function formatCountry(code: string): string {
  if (!code) {
    return "";
  }

  try {
    return regionNames.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

export function formatObservedTime(iso: string, locale = "es-ES"): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "hora desconocida";
  }

  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
