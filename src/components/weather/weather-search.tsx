"use client";

import { useId, useState } from "react";

interface WeatherSearchProps {
  onSearch: (city: string) => void;
  isLoading: boolean;
  hasError: boolean;
}

export function WeatherSearch({ onSearch, isLoading, hasError }: WeatherSearchProps) {
  const inputId = useId();
  const [city, setCity] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    onSearch(city);
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
          {hasError ? "Revisa la ciudad o prueba con otra" : "Enter para consultar"}
        </span>
      </div>

      <div className="search__row">
        <input
          id={inputId}
          className="search__input"
          type="text"
          name="city"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="Madrid, Bogotá, Tokio…"
          autoComplete="off"
          enterKeyHint="search"
          maxLength={80}
          aria-invalid={hasError}
          aria-describedby={`${inputId}-hint`}
        />
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
