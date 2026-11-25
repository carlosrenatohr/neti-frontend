"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { WeatherCard } from "@/components/weather/weather-card";
import { WeatherSearch } from "@/components/weather/weather-search";
import { WeatherState } from "@/components/weather/weather-state";
import { useWeather } from "@/features/weather/hooks/use-weather";

export function WeatherExperience() {
  const { weather, error, status, search } = useWeather();
  const condition = weather?.condition ?? "idle";

  return (
    <div className="app-shell" data-condition={condition}>
      <a className="skip-link" href="#weather-main">
        Saltar al contenido
      </a>

      <div className="atmosphere" aria-hidden="true">
        <span className="atmosphere__orb" />
      </div>

      <header className="topbar">
        <Link className="brand" href="/" aria-label="Atmos, inicio">
          <span className="brand__mark" aria-hidden="true">
            <span />
          </span>
          <span className="brand__name">Atmos</span>
        </Link>
        <div className="topbar__actions">
          <p className="topbar__note">Clima en vivo · OpenWeather</p>
          <ThemeToggle />
        </div>
      </header>

      <main className="page" id="weather-main" tabIndex={-1}>
        <section className="intro" aria-labelledby="weather-title">
          <p className="eyebrow">Observatorio de bolsillo</p>
          <h1 className="intro__title" id="weather-title">
            El cielo,
            <br />
            <em>ahora.</em>
          </h1>
          <p className="intro__copy">
            Una lectura directa del clima en cualquier ciudad. Sin adornos y sin pronósticos: solo
            lo que está pasando allá arriba.
          </p>
          <WeatherSearch
            onSearch={search}
            isLoading={status === "loading"}
            hasError={Boolean(error)}
          />
        </section>

        <section className="stage" aria-live="polite" aria-busy={status === "loading"}>
          {status === "success" && weather ? <WeatherCard weather={weather} /> : null}
          {status === "loading" ? <WeatherState variant="loading" /> : null}
          {status === "error" && error ? <WeatherState variant="error" message={error} /> : null}
          {status === "idle" ? <WeatherState variant="idle" /> : null}
        </section>
      </main>

      <footer className="footer">
        <p>Atmos · una lectura del clima</p>
        <p className="footer__meta">Datos meteorológicos de OpenWeather</p>
      </footer>
    </div>
  );
}
