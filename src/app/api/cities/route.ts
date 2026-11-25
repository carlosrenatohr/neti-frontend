import { NextResponse } from "next/server";
import { citySearchQuerySchema } from "@/features/weather/schemas/geocoding.schema";
import { searchCities } from "@/features/weather/services/geocoding.service";
import { toWeatherErrorPayload } from "@/features/weather/services/weather.errors";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = citySearchQuerySchema.safeParse({ query: searchParams.get("query") ?? "" });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_CITY",
          message: parsed.error.issues[0]?.message ?? "Escribe al menos dos letras.",
        },
      },
      { status: 400 },
    );
  }

  try {
    const cities = await searchCities(parsed.data.query);

    return NextResponse.json(
      { cities },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    const { status, body } = toWeatherErrorPayload(error);
    return NextResponse.json(body, { status });
  }
}
