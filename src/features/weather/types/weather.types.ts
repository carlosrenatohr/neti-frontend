export type WeatherCondition =
  "clear" | "clouds" | "rain" | "drizzle" | "thunderstorm" | "snow" | "mist" | "unknown";

export interface CitySuggestion {
  id: string;
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
}

export interface Weather {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  description: string;
  condition: WeatherCondition;
  icon: string;
  windSpeed: number;
  observedAt: string;
}

export type WeatherErrorCode =
  | "INVALID_CITY"
  | "CITY_NOT_FOUND"
  | "INVALID_API_KEY"
  | "RATE_LIMITED"
  | "PROVIDER_UNAVAILABLE"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "INVALID_RESPONSE"
  | "CONFIGURATION_ERROR"
  | "UNKNOWN";

export interface WeatherError {
  code: WeatherErrorCode;
  message: string;
}

export interface CitySuggestionsResponse {
  cities: CitySuggestion[];
}

export interface WeatherSuccessResponse {
  weather: Weather;
}

export interface WeatherErrorResponse {
  error: WeatherError;
}

export type WeatherResponse = WeatherSuccessResponse | WeatherErrorResponse;
