import "./GeoPlayLocationActions.css";

function GeoPlayLocationActions({
  ftuePhase,
  locationStatus,
  onAllowLocation,
  onNotNow,
  onTryAgain,
  onExploreGeoplay,
}) {
  const isVisible =
    ftuePhase === "actions" &&
    locationStatus !== "locating" &&
    locationStatus !== "located" &&
    locationStatus !== "searching";

  if (!isVisible) return null;

  const isDenied = locationStatus === "denied";

  return (
    <div className="geoplay-earth-location-actions is-visible">
      {isDenied ? (
        <>
          <button
            className="geoplay-earth-allow-button"
            onClick={onTryAgain}
          >
            TRY AGAIN
          </button>

          <button
            className="geoplay-earth-deny-button"
            onClick={onExploreGeoplay}
          >
            EXPLORE GEOPLAY
          </button>
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}

export default GeoPlayLocationActions;
