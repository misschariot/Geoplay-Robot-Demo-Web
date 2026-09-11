import "./GlobalHeader.css";

function GlobalHeader() {
  return (
    <header className="global-header">
      {/* GeoPlay Brand */}
      <div className="global-header-brand">
        <img
          src="/logos/geoplay-logo-icon.png"
          alt="GeoPlay"
          className="global-header-logo"
        />
      </div>

      {/* Centered Player Balance */}
      <div className="global-header-wallet">
        <span className="global-header-balance">
          $1,000,000.00
        </span>

        <button
          type="button"
          className="global-header-add"
          aria-label="Add funds"
        >
          +
        </button>
      </div>

      {/* Player Profile */}
      <button
        type="button"
        className="global-header-profile"
        aria-label="Open profile"
      >
        <img
          src="/avatars/avatar-2.png"
          alt="Player profile"
          className="global-header-avatar"
        />
      </button>
    </header>
  );
}

export default GlobalHeader;
