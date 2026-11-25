import {
  formatHumidity,
  formatTemperature,
  formatWind,
} from "@/features/weather/utils/weather.utils";

interface WeatherDetailsProps {
  humidity: number;
  feelsLike: number;
  windSpeed: number;
}

export function WeatherDetails({ humidity, feelsLike, windSpeed }: WeatherDetailsProps) {
  return (
    <dl className="details">
      <div className="details__item details__item--humidity">
        <dt>Humedad</dt>
        <dd>
          {formatHumidity(humidity)}
          <progress className="details__meter" value={humidity} max={100}>
            {formatHumidity(humidity)}
          </progress>
        </dd>
      </div>
      <div className="details__item">
        <dt>Sensación</dt>
        <dd>{formatTemperature(feelsLike)}</dd>
      </div>
      <div className="details__item">
        <dt>Viento</dt>
        <dd>{formatWind(windSpeed)}</dd>
      </div>
    </dl>
  );
}
