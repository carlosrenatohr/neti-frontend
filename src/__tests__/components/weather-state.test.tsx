import { render, screen } from "@testing-library/react";
import { WeatherState } from "@/components/weather/weather-state";

describe("WeatherState", () => {
  it("invites the user to search in the idle state", () => {
    render(<WeatherState variant="idle" />);

    expect(
      screen.getByRole("heading", { name: /El cielo aún está en blanco/ }),
    ).toBeInTheDocument();
  });

  it("announces the loading state", () => {
    render(<WeatherState variant="loading" />);

    expect(screen.getByText("Consultando el clima…")).toBeInTheDocument();
  });

  it("shows an accessible error with recovery guidance", () => {
    render(<WeatherState variant="error" message="No encontramos esa ciudad." />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("No encontramos esa ciudad.");
    expect(alert).toHaveTextContent("Prueba con otra ciudad");
  });
});
