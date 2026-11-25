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
