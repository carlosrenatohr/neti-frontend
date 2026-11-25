import { render } from "@testing-library/react";
import { WeatherIcon } from "@/components/weather/weather-icon";
import type { WeatherCondition } from "@/features/weather/types/weather.types";

const conditions: WeatherCondition[] = [
  "clear",
  "clouds",
  "rain",
  "drizzle",
  "thunderstorm",
  "snow",
  "mist",
  "unknown",
];

describe("WeatherIcon", () => {
  it.each(conditions)("renders the %s condition as decoration", (condition) => {
    const { container } = render(<WeatherIcon condition={condition} />);
    const icon = container.querySelector("svg");

    expect(icon).toHaveClass(`weather-icon--${condition}`);
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });
});
