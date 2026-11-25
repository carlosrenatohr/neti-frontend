import type { WeatherCondition } from "@/features/weather/types/weather.types";

interface WeatherIconProps {
  condition: WeatherCondition;
}

export function WeatherIcon({ condition }: WeatherIconProps) {
  return (
    <svg
      className={`weather-icon weather-icon--${condition}`}
      viewBox="0 0 160 160"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <circle className="weather-icon__orbit" cx="80" cy="80" r="62" />
      <circle className="weather-icon__tick" cx="80" cy="80" r="49" />

      {condition === "clear" ? (
        <g className="weather-icon__sun">
          <circle className="weather-icon__sun-core" cx="80" cy="80" r="24" />
          <g className="weather-icon__rays">
            <path d="M80 38v-9" />
            <path d="M80 122v9" />
            <path d="M38 80h-9" />
            <path d="M122 80h9" />
            <path d="M50 50l-6-6" />
            <path d="M110 110l6 6" />
            <path d="M110 50l6-6" />
            <path d="M50 110l-6 6" />
          </g>
        </g>
      ) : null}

      {condition === "clouds" ? (
        <g className="weather-icon__cloud">
          <path d="M48 101h62a20 20 0 0 0 2-40 31 31 0 0 0-58-8 25 25 0 0 0-6 48Z" />
          <path className="weather-icon__cloud-line" d="M58 113h44" />
        </g>
      ) : null}

      {condition === "rain" || condition === "drizzle" || condition === "thunderstorm" ? (
        <g className={`weather-icon__cloud weather-icon__cloud--${condition}`}>
          <path d="M46 88h64a20 20 0 0 0 2-40 31 31 0 0 0-58-8 25 25 0 0 0-8 48Z" />
          {condition === "thunderstorm" ? (
            <path className="weather-icon__bolt" d="M82 94l-13 24h11l-4 19 20-27H84l6-16Z" />
          ) : (
            <g className="weather-icon__rain">
              <path d="M62 101l-5 15" />
              <path d="M82 101l-5 15" />
              <path d="M102 101l-5 15" />
            </g>
          )}
        </g>
      ) : null}

      {condition === "snow" ? (
        <g className="weather-icon__snow">
          <path d="M46 83h64a20 20 0 0 0 2-40 31 31 0 0 0-58-8 25 25 0 0 0-8 48Z" />
          <path d="M60 103v18M52 108l16 8M68 108l-16 8" />
          <path d="M100 103v18M92 108l16 8M108 108l-16 8" />
        </g>
      ) : null}

      {condition === "mist" || condition === "unknown" ? (
        <g className="weather-icon__mist">
          <path d="M43 69h74" />
          <path d="M51 84h66" />
          <path d="M38 99h56" />
          <path d="M85 114h34" />
        </g>
      ) : null}
    </svg>
  );
}
