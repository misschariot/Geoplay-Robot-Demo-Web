function GeoPlayLocationSearch({ isFading = false }) {
  return (
    <div
      className={`geoplay-earth-location-status ${
        isFading ? "is-fading" : ""
      }`}
      aria-live="polite"
      aria-label="Finding your location"
    >
      <div className="geoplay-earth-location-status-card">
        <img
          className="geoplay-earth-location-logo"
          src="/geoplay-logo.png"
          alt="Geoplay"
        />

        <div className="geoplay-earth-location-status-title">
          FINDING YOUR LOCATION
        </div>

        <div className="geoplay-earth-location-status-message">
          This may take a moment...
        </div>

        <div
          className="geoplay-earth-location-status-indicator"
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

export default GeoPlayLocationSearch;
