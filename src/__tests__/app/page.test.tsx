import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

jest.mock("@/components/weather/weather-experience", () => ({
  WeatherExperience: () => <div>Weather experience</div>,
}));

describe("Home", () => {
  it("composes the weather experience", () => {
    render(<Home />);

    expect(screen.getByText("Weather experience")).toBeInTheDocument();
  });
});
