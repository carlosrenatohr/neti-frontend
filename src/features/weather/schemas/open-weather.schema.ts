import { z } from "zod";

// -- validate the provider payload at the integration boundary --
export const openWeatherResponseSchema = z.object({
  weather: z
    .array(
      z.object({
        main: z.string().min(1),
        description: z.string().min(1),
        icon: z.string().min(1),
      }),
    )
    .min(1),
  main: z.object({
    temp: z.number(),
    feels_like: z.number(),
    humidity: z.number().min(0).max(100),
  }),
  wind: z
    .object({
      speed: z.number().nonnegative(),
    })
    .optional(),
  name: z.string().min(1),
  sys: z
    .object({
      country: z.string().length(2),
    })
    .optional(),
  dt: z.number().int().positive(),
});

export const openWeatherErrorSchema = z.object({
  cod: z.union([z.number(), z.string()]),
  message: z.string().optional(),
});

export type OpenWeatherResponse = z.infer<typeof openWeatherResponseSchema>;
