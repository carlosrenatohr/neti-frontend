import { render, screen } from "@testing-library/react";
import { WeatherDetails } from "@/components/weather/weather-details";

describe("WeatherDetails", () => {
  it("shows humidity, feels-like temperature and wind", () => {
    render(<WeatherDetails humidity={64} feelsLike={17.9} windSpeed={12} />);

    expect(screen.getByText("Humedad")).toBeInTheDocument();
    expect(screen.getAllByText("64%")).not.toHaveLength(0);
    expect(screen.getByText("18°")).toBeInTheDocument();
    expect(screen.getByText("12 km/h")).toBeInTheDocument();
  });
});
