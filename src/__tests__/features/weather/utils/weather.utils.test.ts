import {
  CONDITION_LABELS,
  formatCountry,
  formatHumidity,
  formatObservedTime,
  formatTemperature,
  formatWind,
} from "@/features/weather/utils/weather.utils";

describe("weather formatting", () => {
  it("rounds temperature, humidity and wind", () => {
    expect(formatTemperature(18.6)).toBe("19°");
    expect(formatHumidity(64.4)).toBe("64%");
    expect(formatWind(12.5)).toBe("13 km/h");
  });

  it("formats the observation time in Spanish", () => {
    expect(formatObservedTime("2026-11-25T12:30:00.000Z")).toMatch(/^\d{2}:\d{2}$/);
  });

  it("handles an invalid observation date", () => {
    expect(formatObservedTime("not-a-date")).toBe("hora desconocida");
  });

  it("exposes a label for every known condition", () => {
    expect(CONDITION_LABELS.clear).toBe("Despejado");
    expect(CONDITION_LABELS.thunderstorm).toBe("Tormenta");
    expect(CONDITION_LABELS.unknown).toBe("Variable");
  });

  it("translates an ISO country code", () => {
    expect(formatCountry("NI")).toBe("Nicaragua");
    expect(formatCountry("ni")).toBe("Nicaragua");
  });

  it("keeps an unknown country code and an empty value safe", () => {
    expect(formatCountry("")).toBe("");
    expect(formatCountry("ZZ")).toBeTruthy();
  });
});
