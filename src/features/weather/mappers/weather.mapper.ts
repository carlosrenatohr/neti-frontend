import type { OpenWeatherResponse } from "@/features/weather/schemas/open-weather.schema";
import type { Weather, WeatherCondition } from "@/features/weather/types/weather.types";

const CONDITION_BY_PROVIDER_MAIN: Record<string, WeatherCondition> = {
  clear: "clear",
  clouds: "clouds",
  rain: "rain",
  drizzle: "drizzle",
  thunderstorm: "thunderstorm",
  snow: "snow",
  mist: "mist",
  smoke: "mist",
  haze: "mist",
  dust: "mist",
  fog: "mist",
  sand: "mist",
  ash: "mist",
  squall: "rain",
  tornado: "thunderstorm",
};

// -- translate one provider shape into the model the interface owns --
export function mapOpenWeatherToWeather(payload: OpenWeatherResponse): Weather {
  const current = payload.weather[0];
  const providerMain = current.main.toLowerCase();

  return {
    city: payload.name,
    country: payload.sys?.country ?? "",
    temperature: payload.main.temp,
    feelsLike: payload.main.feels_like,
    humidity: payload.main.humidity,
    description: current.description,
    condition: CONDITION_BY_PROVIDER_MAIN[providerMain] ?? "unknown",
    icon: current.icon,
    windSpeed: Math.round((payload.wind?.speed ?? 0) * 3.6),
    observedAt: new Date(payload.dt * 1000).toISOString(),
  };
}
