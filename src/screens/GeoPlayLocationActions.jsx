import "./GeoPlayLocationActions.css";

function GeoPlayLocationActions({
  ftuePhase,
  locationStatus,
  onAllowLocation,
  onNotNow,
}) {
  const isVisible =
    ftuePhase === "actions" &&
    locationStatus !== "locating" &&
    locationStatus !== "located" &&
    locationStatus !== "searching";

  if (!isVisible) return null;

  return (
    <div className="geoplay-earth-location-actions is-visible">
      <button
        className="geoplay-earth-allow-button"
        onClick={onAllowLocation}
      >
        ALLOW LOCATION
      </button>

      <button
        className="geoplay-earth-deny-button"
        onClick={onNotNow}
      >
        DENY
      </button>
    </div>
  );
}

export default GeoPlayLocationActions;
