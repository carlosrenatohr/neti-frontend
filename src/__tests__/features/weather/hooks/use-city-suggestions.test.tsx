import { act, renderHook } from "@testing-library/react";
import { useCitySuggestions } from "@/features/weather/hooks/use-city-suggestions";
import { requestCitySuggestions } from "@/features/weather/services/city-client";

jest.mock("@/features/weather/services/city-client", () => ({
  requestCitySuggestions: jest.fn(),
}));

const requestCitySuggestionsMock = jest.mocked(requestCitySuggestions);

const cities = [
  { id: "12.13,-86.25", name: "Managua", country: "NI", lat: 12.1328, lon: -86.2504 },
];

describe("useCitySuggestions", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    requestCitySuggestionsMock.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("stays idle for a query that is too short", () => {
    const { result } = renderHook(() => useCitySuggestions("M", true));

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(requestCitySuggestionsMock).not.toHaveBeenCalled();
    expect(result.current.status).toBe("idle");
    expect(result.current.cities).toEqual([]);
  });

  it("stays idle when disabled", () => {
    const { result } = renderHook(() => useCitySuggestions("Managua", false));

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(requestCitySuggestionsMock).not.toHaveBeenCalled();
    expect(result.current.status).toBe("idle");
  });

  it("debounces before requesting", () => {
    renderHook(() => useCitySuggestions("Man", true));

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(requestCitySuggestionsMock).not.toHaveBeenCalled();
  });

  it("loads suggestions after the debounce", async () => {
    requestCitySuggestionsMock.mockResolvedValueOnce(cities);
    const { result } = renderHook(() => useCitySuggestions("  Man  ", true));

    await act(async () => {
      await jest.runAllTimersAsync();
    });

    expect(requestCitySuggestionsMock).toHaveBeenCalledWith("Man", expect.any(AbortSignal));
    expect(result.current.status).toBe("success");
    expect(result.current.cities).toEqual(cities);
  });

  it("reports a failure and clears stale suggestions", async () => {
    requestCitySuggestionsMock.mockRejectedValueOnce(new Error("boom"));
    const { result } = renderHook(() => useCitySuggestions("Managua", true));

    await act(async () => {
      await jest.runAllTimersAsync();
    });

    expect(result.current.status).toBe("error");
    expect(result.current.cities).toEqual([]);
  });

  it("requests again when the query changes", async () => {
    requestCitySuggestionsMock.mockResolvedValue(cities);
    const { rerender } = renderHook(({ query }) => useCitySuggestions(query, true), {
      initialProps: { query: "Ma" },
    });

    await act(async () => {
      await jest.runAllTimersAsync();
    });

    rerender({ query: "Man" });

    await act(async () => {
      await jest.runAllTimersAsync();
    });

    expect(requestCitySuggestionsMock).toHaveBeenCalledTimes(2);
    expect(requestCitySuggestionsMock).toHaveBeenLastCalledWith("Man", expect.any(AbortSignal));
  });
});
