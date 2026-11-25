"use client";

import { useId, useState } from "react";
import { useCitySuggestions } from "@/features/weather/hooks/use-city-suggestions";
import type { CitySuggestion } from "@/features/weather/types/weather.types";
import { formatCountry } from "@/features/weather/utils/weather.utils";

interface WeatherSearchProps {
  onSearch: (city: string) => void;
  isLoading: boolean;
  hasError: boolean;
}

const MIN_QUERY_LENGTH = 2;

export function WeatherSearch({ onSearch, isLoading, hasError }: WeatherSearchProps) {
  const inputId = useId();
  const listboxId = `${inputId}-suggestions`;
  const [city, setCity] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { cities, status } = useCitySuggestions(city, isOpen);

  const showList = isOpen && city.trim().length >= MIN_QUERY_LENGTH;
  const activeOption = activeIndex >= 0 ? cities[activeIndex] : undefined;

  function closeList() {
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function selectSuggestion(suggestion: CitySuggestion) {
    // -- the country keeps same-name cities from resolving to another place --
    const value = `${suggestion.name}, ${suggestion.country}`;
    setCity(value);
    closeList();
    onSearch(value);
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setCity(event.target.value);
    setIsOpen(true);
    setActiveIndex(-1);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    if (activeOption) {
      selectSuggestion(activeOption);
      return;
    }

    closeList();
    onSearch(city);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (!showList) {
        setIsOpen(true);
        return;
      }

      if (cities.length > 0) {
        setActiveIndex((current) => (current + 1) % cities.length);
      }

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      if (!showList || cities.length === 0) {
        return;
      }

      setActiveIndex((current) => (current <= 0 ? cities.length - 1 : current - 1));
      return;
    }

    if (event.key === "Escape") {
      closeList();
    }
  }

  function statusMessage() {
    if (status === "loading") {
      return "Buscando ciudades…";
    }

    if (status === "error") {
      return "No pudimos cargar las sugerencias.";
    }

    return "Sin coincidencias. Revisa el nombre o elige otra ciudad.";
  }

  return (
    <form className="search" onSubmit={handleSubmit} noValidate>
      <div className="search__heading">
        <label className="search__label" htmlFor={inputId}>
          Ciudad
        </label>
        <span
          className={`search__hint${hasError ? " search__hint--error" : ""}`}
          id={`${inputId}-hint`}
          role={hasError ? "status" : undefined}
        >
          {hasError
            ? "Revisa la ciudad o elige una sugerencia"
            : "Elige una sugerencia o presiona Enter"}
        </span>
      </div>

      <div className="search__row">
        <div className="search__field">
          <input
            id={inputId}
            className="search__input"
            type="text"
            name="city"
            role="combobox"
            value={city}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={closeList}
            placeholder="Managua, Nicaragua"
            autoComplete="off"
            enterKeyHint="search"
            maxLength={80}
            aria-invalid={hasError}
            aria-describedby={`${inputId}-hint`}
            aria-autocomplete="list"
            aria-expanded={showList}
            aria-controls={showList ? listboxId : undefined}
            aria-activedescendant={activeOption ? `${inputId}-option-${activeIndex}` : undefined}
          />

          {showList ? (
            <div className="search__menu">
              {cities.length > 0 ? (
                <ul
                  className="search__list"
                  id={listboxId}
                  role="listbox"
                  aria-label="Ciudades sugeridas"
                >
                  {cities.map((suggestion, index) => (
                    <li
                      key={suggestion.id}
                      id={`${inputId}-option-${index}`}
                      className="search__option"
                      role="option"
                      aria-selected={index === activeIndex}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => selectSuggestion(suggestion)}
                    >
                      <span className="search__option-name">{suggestion.name}</span>
                      <span className="search__option-meta">
                        {[suggestion.state, formatCountry(suggestion.country)]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="search__empty" role="status">
                  {statusMessage()}
                </p>
              )}
            </div>
          ) : null}
        </div>

        <button className="search__button" type="submit" disabled={isLoading} aria-busy={isLoading}>
          <span>{isLoading ? "Consultando…" : "Consultar"}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </form>
  );
}
