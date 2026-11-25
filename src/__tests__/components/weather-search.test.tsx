import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WeatherSearch } from "@/components/weather/weather-search";
import { useCitySuggestions } from "@/features/weather/hooks/use-city-suggestions";

jest.mock("@/features/weather/hooks/use-city-suggestions", () => ({
  useCitySuggestions: jest.fn(),
}));

const useCitySuggestionsMock = jest.mocked(useCitySuggestions);

const managua = {
  id: "12.13,-86.25",
  name: "Managua",
  country: "NI",
  lat: 12.1328,
  lon: -86.2504,
};

beforeEach(() => {
  useCitySuggestionsMock.mockReturnValue({ cities: [], status: "idle" });
});

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

  it("shows suggestions and selects one with the mouse", async () => {
    useCitySuggestionsMock.mockReturnValue({ cities: [managua], status: "success" });
    const user = userEvent.setup();
    const onSearch = jest.fn();
    render(<WeatherSearch onSearch={onSearch} isLoading={false} hasError={false} />);

    await user.type(screen.getByLabelText("Ciudad"), "Man");
    await user.click(screen.getByRole("option", { name: /Managua/ }));

    expect(onSearch).toHaveBeenCalledWith("Managua, NI");
    expect(screen.getByLabelText("Ciudad")).toHaveValue("Managua, NI");
  });

  it("selects the active suggestion with the keyboard", async () => {
    useCitySuggestionsMock.mockReturnValue({ cities: [managua], status: "success" });
    const user = userEvent.setup();
    const onSearch = jest.fn();
    render(<WeatherSearch onSearch={onSearch} isLoading={false} hasError={false} />);

    const input = screen.getByLabelText("Ciudad");
    await user.type(input, "Man");
    await user.keyboard("{ArrowDown}");

    expect(input).toHaveAttribute("aria-activedescendant", expect.stringContaining("option-0"));

    await user.keyboard("{Enter}");

    expect(onSearch).toHaveBeenCalledWith("Managua, NI");
  });

  it("wraps to the last suggestion with ArrowUp", async () => {
    const lima = { ...managua, id: "-12.05,-77.04", name: "Lima", country: "PE" };
    useCitySuggestionsMock.mockReturnValue({ cities: [managua, lima], status: "success" });
    const user = userEvent.setup();
    render(<WeatherSearch onSearch={jest.fn()} isLoading={false} hasError={false} />);

    const input = screen.getByLabelText("Ciudad");
    await user.type(input, "Ma");
    await user.keyboard("{ArrowUp}");

    expect(input).toHaveAttribute("aria-activedescendant", expect.stringContaining("option-1"));
  });

  it("closes the list with Escape", async () => {
    useCitySuggestionsMock.mockReturnValue({ cities: [managua], status: "success" });
    const user = userEvent.setup();
    render(<WeatherSearch onSearch={jest.fn()} isLoading={false} hasError={false} />);

    await user.type(screen.getByLabelText("Ciudad"), "Man");
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("explains when there are no matches", async () => {
    useCitySuggestionsMock.mockReturnValue({ cities: [], status: "success" });
    const user = userEvent.setup();
    render(<WeatherSearch onSearch={jest.fn()} isLoading={false} hasError={false} />);

    await user.type(screen.getByLabelText("Ciudad"), "Atlantis");

    expect(screen.getByRole("status")).toHaveTextContent("Sin coincidencias");
  });

  it("reports a suggestions failure without blocking the form", async () => {
    useCitySuggestionsMock.mockReturnValue({ cities: [], status: "error" });
    const user = userEvent.setup();
    const onSearch = jest.fn();
    render(<WeatherSearch onSearch={onSearch} isLoading={false} hasError={false} />);

    await user.type(screen.getByLabelText("Ciudad"), "Managua");
    expect(screen.getByRole("status")).toHaveTextContent("No pudimos cargar las sugerencias");

    await user.keyboard("{Enter}");
    expect(onSearch).toHaveBeenCalledWith("Managua");
  });
});
