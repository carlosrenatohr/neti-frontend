import { z } from "zod";

// -- validate the provider's geocoding list before it becomes suggestions --
export const openWeatherGeocodingSchema = z.array(
  z.object({
    name: z.string().min(1),
    lat: z.number(),
    lon: z.number(),
    country: z.string().min(1),
    state: z.string().min(1).optional(),
  }),
);

export const citySearchQuerySchema = z.object({
  query: z
    .string()
    .trim()
    .min(2, "Escribe al menos dos letras.")
    .max(80, "El nombre de la ciudad es demasiado largo."),
});

export type CitySearchQuery = z.infer<typeof citySearchQuerySchema>;

export const citySuggestionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  state: z.string().min(1).optional(),
  country: z.string().min(1),
  lat: z.number(),
  lon: z.number(),
});

export const citySuggestionsResponseSchema = z.object({
  cities: z.array(citySuggestionSchema),
});
