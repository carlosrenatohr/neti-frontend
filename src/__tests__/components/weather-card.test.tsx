import { render, screen } from "@testing-library/react";
import { WeatherCard } from "@/components/weather/weather-card";
import type { Weather } from "@/features/weather/types/weather.types";

const weather: Weather = {
  city: "Madrid",
  country: "ES",
  temperature: 18.4,
  feelsLike: 17.9,
  humidity: 64,
  description: "cielo claro",
  condition: "clear",
  icon: "01d",
  windSpeed: 12,
  observedAt: "2026-11-25T12:00:00.000Z",
};

describe("WeatherCard", () => {
  it("renders the required weather information", () => {
    render(<WeatherCard weather={weather} />);

    expect(screen.getByRole("heading", { level: 2, name: /Madrid/ })).toBeInTheDocument();
    expect(screen.getByText("cielo claro")).toBeInTheDocument();
    expect(screen.getByLabelText(/Temperatura actual: 18 grados Celsius/)).toBeInTheDocument();
    expect(screen.getByText("Humedad")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("value", "64");
    expect(screen.getByText("Despejado")).toBeInTheDocument();
  });

  it("omits the country when the provider does not return one", () => {
    render(<WeatherCard weather={{ ...weather, country: "" }} />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(/^Madrid$/);
  });
});
