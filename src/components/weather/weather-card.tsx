import { WeatherDetails } from "@/components/weather/weather-details";
import { WeatherIcon } from "@/components/weather/weather-icon";
import type { Weather } from "@/features/weather/types/weather.types";
import {
  CONDITION_LABELS,
  formatObservedTime,
  formatTemperature,
} from "@/features/weather/utils/weather.utils";

interface WeatherCardProps {
  weather: Weather;
}

export function WeatherCard({ weather }: WeatherCardProps) {
  return (
    <article className="weather-card" data-condition={weather.condition}>
      <div className="weather-card__top">
        <div className="weather-card__identity">
          <p className="eyebrow">Lectura actual · {formatObservedTime(weather.observedAt)}</p>
          <h2 className="weather-card__city">
            {weather.city}
            {weather.country ? (
              <span className="weather-card__country">{weather.country}</span>
            ) : null}
          </h2>
          <p className="weather-card__description">{weather.description}</p>
        </div>
        <WeatherIcon condition={weather.condition} />
      </div>

      <div className="weather-card__reading">
        <p
          className="weather-card__temperature"
          aria-label={`Temperatura actual: ${Math.round(weather.temperature)} grados Celsius`}
        >
          <span>{Math.round(weather.temperature)}</span>
          <sup>°</sup>
        </p>
        <p className="weather-card__condition">{CONDITION_LABELS[weather.condition]}</p>
      </div>

      <WeatherDetails
        humidity={weather.humidity}
        feelsLike={weather.feelsLike}
        windSpeed={weather.windSpeed}
      />

      <p className="weather-card__source">
        Datos de OpenWeather · {formatTemperature(weather.feelsLike)} de sensación térmica
      </p>
    </article>
  );
}
