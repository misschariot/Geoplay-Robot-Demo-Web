import "./GeoPlayLocationActions.css";
import GeoPlayButton from "../components/GeoPlayButton";

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
          <GeoPlayButton
            type="button"
            size="medium"
            onClick={onTryAgain}
          >
            TRY AGAIN
          </GeoPlayButton>

          <GeoPlayButton
            type="button"
            size="medium"
            variant="secondary"
            onClick={onExploreGeoplay}
          >
            EXPLORE GEOPLAY
          </GeoPlayButton>
        </>
      ) : (
        <>
          <GeoPlayButton
            type="button"
            size="medium"
            onClick={onAllowLocation}
          >
            ALLOW LOCATION
          </GeoPlayButton>

          <GeoPlayButton
            type="button"
            size="medium"
            variant="secondary"
            onClick={onNotNow}
          >
            DENY
          </GeoPlayButton>
        </>
      )}
    </div>
  );
}

export default GeoPlayLocationActions;
