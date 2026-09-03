import "./SplashScreen.css";

function SplashScreen() {
  return (
    <main className="splash">
      <div className="ambient"></div>

      <div className="orbit"></div>

      <div className="particles" aria-hidden="true">
        <span className="particle"></span>
        <span className="particle"></span>
        <span className="particle"></span>
        <span className="particle"></span>
        <span className="particle"></span>
        <span className="particle"></span>
        <span className="particle"></span>
        <span className="particle"></span>
      </div>

      <div className="logo-wrap">
        <img
          className="logo"
          src="/geoplay-logo.png"
          alt="GeoPlay"
        />
      </div>

      <div className="floor-glow"></div>

      <div className="loading">
        <div className="loading-text">
          Your bet starts here
        </div>

        <div className="loading-bar"></div>
      </div>
    </main>
  );
}

export default SplashScreen;