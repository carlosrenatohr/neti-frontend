import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WeatherExperience } from "@/components/weather/weather-experience";
import { useWeather } from "@/features/weather/hooks/use-weather";
import type { Weather } from "@/features/weather/types/weather.types";

jest.mock("@/features/weather/hooks/use-weather", () => ({
  useWeather: jest.fn(),
}));

const useWeatherMock = jest.mocked(useWeather);

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

describe("WeatherExperience", () => {
  it("starts with an empty state", () => {
    useWeatherMock.mockReturnValue({
      weather: null,
      error: null,
      status: "idle",
      search: jest.fn(),
    });

    render(<WeatherExperience />);

    expect(
      screen.getByRole("heading", { name: /El cielo aún está en blanco/ }),
    ).toBeInTheDocument();
  });

  it("shows the weather after a successful search", () => {
    useWeatherMock.mockReturnValue({
      weather,
      error: null,
      status: "success",
      search: jest.fn(),
    });

    render(<WeatherExperience />);

    expect(screen.getByRole("heading", { level: 2, name: /Madrid/ })).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("value", "64");
  });

  it("shows loading feedback", () => {
    useWeatherMock.mockReturnValue({
      weather: null,
      error: null,
      status: "loading",
      search: jest.fn(),
    });

    render(<WeatherExperience />);

    expect(screen.getByText("Consultando el clima…")).toBeInTheDocument();
  });

  it("shows an accessible API error", () => {
    useWeatherMock.mockReturnValue({
      weather: null,
      error: "No encontramos esa ciudad.",
      status: "error",
      search: jest.fn(),
    });

    render(<WeatherExperience />);

    expect(screen.getByRole("alert")).toHaveTextContent("No encontramos esa ciudad.");
  });

  it("connects the search form to the weather hook", async () => {
    const user = userEvent.setup();
    const search = jest.fn();
    useWeatherMock.mockReturnValue({
      weather: null,
      error: null,
      status: "idle",
      search,
    });

    render(<WeatherExperience />);

    await user.type(screen.getByLabelText("Ciudad"), "Tokio{Enter}");

    expect(search).toHaveBeenCalledWith("Tokio");
  });
});
