import "./GlobalBottomNav.css";

import { useState } from "react";
import NotificationPanel from "./NotificationPanel";
import RobotHead from "./RobotHead";

function HomeIcon({ active }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`global-bottom-nav-icon ${active ? "is-active" : ""}`}
    >
      <path d="M3.5 10.5 12 3.5l8.5 7" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M9.5 20v-6h5v6" />
    </svg>
  );
}

function MapIcon({ active }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`global-bottom-nav-icon ${active ? "is-active" : ""}`}
    >
      <path d="M12 21s6.5-6.1 6.5-11A6.5 6.5 0 0 0 5.5 10c0 4.9 6.5 11 6.5 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  );
}

function GlobalBottomNav({ activeScreen = "home", onHome, onMap }) {
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  return (
    <nav className="global-bottom-nav" aria-label="Primary navigation">
      <NotificationPanel isOpen={isNotificationPanelOpen} />

      <div
        className="global-bottom-nav-connection global-bottom-nav-connection-left"
        aria-hidden="true"
      >
        <span className="global-bottom-nav-connection-track">
          <span className="global-bottom-nav-connection-trace" />
          <span className="global-bottom-nav-connection-pulse" />
          <span className="global-bottom-nav-connection-node global-bottom-nav-connection-node-outer" />
          <span className="global-bottom-nav-connection-node global-bottom-nav-connection-node-inner" />
        </span>
      </div>

      <div
        className="global-bottom-nav-connection global-bottom-nav-connection-right"
        aria-hidden="true"
      >
        <span className="global-bottom-nav-connection-track">
          <span className="global-bottom-nav-connection-trace" />
          <span className="global-bottom-nav-connection-pulse" />
          <span className="global-bottom-nav-connection-node global-bottom-nav-connection-node-outer" />
          <span className="global-bottom-nav-connection-node global-bottom-nav-connection-node-inner" />
        </span>
      </div>

      <div className="global-bottom-nav-panel">
        <button
          type="button"
          className={`global-bottom-nav-item ${
            activeScreen === "home" ? "is-active" : ""
          }`}
          onClick={onHome}
          aria-current={activeScreen === "home" ? "page" : undefined}
        >
          <HomeIcon active={activeScreen === "home"} />
          <span>HOME</span>
        </button>

        <button
          type="button"
          className={`global-bottom-nav-item ${
            activeScreen === "map" ? "is-active" : ""
          }`}
          onClick={onMap}
          aria-current={activeScreen === "map" ? "page" : undefined}
        >
          <MapIcon active={activeScreen === "map"} />
          <span>MAP</span>
        </button>
      </div>

      <RobotHead
        onPanelOpen={() => setIsNotificationPanelOpen(true)}
        onPanelClose={() => setIsNotificationPanelOpen(false)}
      />
    </nav>
  );
}

export default GlobalBottomNav;
