import { WeatherServiceError } from "@/features/weather/services/weather.errors";

export function getWeatherApiKey(): string {
  const apiKey = process.env.OPENWEATHER_API_KEY?.trim();

  if (!apiKey) {
    throw new WeatherServiceError("CONFIGURATION_ERROR");
  }

  return apiKey;
}
