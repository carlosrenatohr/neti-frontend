"use client";

import { useEffect, useState } from "react";
import { requestCitySuggestions } from "@/features/weather/services/city-client";
import type { CitySuggestion } from "@/features/weather/types/weather.types";

export type CitySuggestionsStatus = "idle" | "loading" | "success" | "error";

interface UseCitySuggestionsResult {
  cities: CitySuggestion[];
  status: CitySuggestionsStatus;
}

interface SuggestionsState {
  query: string;
  cities: CitySuggestion[];
  status: CitySuggestionsStatus;
}

const DEBOUNCE_MS = 280;
const MIN_QUERY_LENGTH = 2;

export function useCitySuggestions(query: string, enabled: boolean): UseCitySuggestionsResult {
  const trimmed = query.trim();
  const isActive = enabled && trimmed.length >= MIN_QUERY_LENGTH;
  const [state, setState] = useState<SuggestionsState>({
    query: "",
    cities: [],
    status: "idle",
  });

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setState({ query: trimmed, cities: [], status: "loading" });

      try {
        const cities = await requestCitySuggestions(trimmed, controller.signal);

        if (!controller.signal.aborted) {
          setState({ query: trimmed, cities, status: "success" });
        }
      } catch {
        if (!controller.signal.aborted) {
          setState({ query: trimmed, cities: [], status: "error" });
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, isActive]);

  if (!isActive) {
    return { cities: [], status: "idle" };
  }

  // -- ignore a result that belongs to a query the user already replaced --
  if (state.query !== trimmed) {
    return { cities: [], status: "loading" };
  }

  return { cities: state.cities, status: state.status };
}
