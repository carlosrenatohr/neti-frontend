interface WeatherStateProps {
  variant: "idle" | "loading" | "error";
  message?: string;
}

export function WeatherState({ variant, message }: WeatherStateProps) {
  if (variant === "loading") {
    return (
      <div className="state state--loading" aria-busy="true">
        <p className="sr-only">Consultando el clima…</p>
        <div className="state__instrument" aria-hidden="true">
          <span className="state__crosshair" />
          <span className="state__sweep" />
        </div>
        <div className="state__body" aria-hidden="true">
          <span className="skeleton skeleton--label" />
          <span className="skeleton skeleton--title" />
          <span className="skeleton skeleton--line" />
          <span className="skeleton skeleton--line skeleton--short" />
        </div>
      </div>
    );
  }

  if (variant === "error") {
    return (
      <div className="state state--error" role="alert">
        <div className="state__signal" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="state__body">
          <p className="eyebrow">Lectura interrumpida</p>
          <h2>No llegó el parte.</h2>
          <p className="state__message">{message}</p>
          <p className="state__note">Prueba con otra ciudad o vuelve a intentarlo en un momento.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="state state--idle">
      <div className="state__instrument" aria-hidden="true">
        <span className="state__crosshair" />
        <span className="state__horizon" />
        <span className="state__dot" />
      </div>
      <div className="state__body">
        <p className="eyebrow">Sin lectura</p>
        <h2>El cielo aún está en blanco.</h2>
        <p className="state__message">
          Busca una ciudad para ver la temperatura, la humedad y el carácter del día.
        </p>
      </div>
    </div>
  );
}
