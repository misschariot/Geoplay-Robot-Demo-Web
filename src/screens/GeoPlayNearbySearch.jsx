function GeoPlayNearbySearch() {
  return (
    <div
      className="geoplay-earth-nearby-search"
      aria-live="polite"
      aria-label="Searching nearby for casinos with Geoplay games"
    >
      <div className="geoplay-earth-nearby-search-card">
        <div className="geoplay-earth-nearby-search-title">
          SEARCHING NEARBY
        </div>

        <div className="geoplay-earth-nearby-search-message">
          Looking for casinos with Geoplay games...
        </div>

        <div
          className="geoplay-earth-nearby-search-indicator"
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

export default GeoPlayNearbySearch;
