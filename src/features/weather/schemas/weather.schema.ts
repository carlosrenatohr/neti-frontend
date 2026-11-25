import { z } from "zod";

// -- keep the accepted city predictable before it reaches the provider --
export const cityQuerySchema = z.object({
  city: z
    .string()
    .trim()
    .min(1, "Escribe el nombre de una ciudad.")
    .max(80, "El nombre de la ciudad es demasiado largo."),
});

export type CityQuery = z.infer<typeof cityQuerySchema>;

export const weatherConditionSchema = z.enum([
  "clear",
  "clouds",
  "rain",
  "drizzle",
  "thunderstorm",
  "snow",
  "mist",
  "unknown",
]);

export const weatherSchema = z.object({
  city: z.string().min(1),
  country: z.string(),
  temperature: z.number(),
  feelsLike: z.number(),
  humidity: z.number().min(0).max(100),
  description: z.string().min(1),
  condition: weatherConditionSchema,
  icon: z.string(),
  windSpeed: z.number().nonnegative(),
  observedAt: z.string(),
});

export const weatherSuccessResponseSchema = z.object({
  weather: weatherSchema,
});

export const weatherErrorResponseSchema = z.object({
  error: z.object({
    code: z.enum([
      "INVALID_CITY",
      "CITY_NOT_FOUND",
      "INVALID_API_KEY",
      "RATE_LIMITED",
      "PROVIDER_UNAVAILABLE",
      "NETWORK_ERROR",
      "TIMEOUT",
      "INVALID_RESPONSE",
      "CONFIGURATION_ERROR",
      "UNKNOWN",
    ]),
    message: z.string().min(1),
  }),
});
