import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WeatherSearch } from "@/components/weather/weather-search";

describe("WeatherSearch", () => {
  it("submits the typed city with the button", async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();
    render(<WeatherSearch onSearch={onSearch} isLoading={false} hasError={false} />);

    await user.type(screen.getByLabelText("Ciudad"), "Madrid");
    await user.click(screen.getByRole("button", { name: /consultar/i }));

    expect(onSearch).toHaveBeenCalledWith("Madrid");
  });

  it("submits with Enter", async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();
    render(<WeatherSearch onSearch={onSearch} isLoading={false} hasError={false} />);

    await user.type(screen.getByLabelText("Ciudad"), "Bogotá{Enter}");

    expect(onSearch).toHaveBeenCalledWith("Bogotá");
  });

  it("forwards an empty value so the caller can validate it", async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();
    render(<WeatherSearch onSearch={onSearch} isLoading={false} hasError={false} />);

    await user.click(screen.getByRole("button", { name: /consultar/i }));

    expect(onSearch).toHaveBeenCalledWith("");
  });

  it("protects duplicate submissions while loading", async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();
    render(<WeatherSearch onSearch={onSearch} isLoading hasError={false} />);

    const button = screen.getByRole("button", { name: /consultando/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");

    await user.type(screen.getByLabelText("Ciudad"), "Madrid{Enter}");
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("marks the field as invalid when the last search failed", () => {
    render(<WeatherSearch onSearch={jest.fn()} isLoading={false} hasError />);

    expect(screen.getByLabelText("Ciudad")).toHaveAttribute("aria-invalid", "true");
  });
});
