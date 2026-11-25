import { NextResponse } from "next/server";
import { cityQuerySchema } from "@/features/weather/schemas/weather.schema";
import { toWeatherErrorPayload } from "@/features/weather/services/weather.errors";
import { fetchWeather } from "@/features/weather/services/weather.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = cityQuerySchema.safeParse({ city: searchParams.get("city") ?? "" });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_CITY",
          message: parsed.error.issues[0]?.message ?? "Escribe el nombre de una ciudad.",
        },
      },
      { status: 400 },
    );
  }

  try {
    const weather = await fetchWeather(parsed.data.city);

    return NextResponse.json(
      { weather },
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
