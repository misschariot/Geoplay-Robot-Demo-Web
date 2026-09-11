import "./RobotHead.css";

import { useEffect, useState } from "react";

function RobotHead({ onPanelOpen, onPanelClose }) {
  const [robotState, setRobotState] = useState("idle");

  useEffect(() => {
    if (robotState === "awake") {
      const timer = window.setTimeout(() => {
        setRobotState("happy");
      }, 1200);

      return () => window.clearTimeout(timer);
    }

    if (robotState === "happy") {
      const timer = window.setTimeout(() => {
        setRobotState("open");
      }, 600);

      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [robotState, onPanelOpen]);

  const handleRobotClick = () => {
    if (robotState === "idle") {
      onPanelOpen?.();
      setRobotState("awake");
      return;
    }

    if (robotState === "open") {
      onPanelClose?.();
      setRobotState("idle");
    }
  };

  return (
    <button
      type="button"
      className={`global-bottom-nav-robot is-${robotState}`}
      onClick={handleRobotClick}
      aria-label={
        robotState === "open"
          ? "Close GeoPlay notifications"
          : "Open GeoPlay robot"
      }
    >
      <div className="global-bottom-nav-robot-aura" />

      <div className="global-bottom-nav-robot-images">
        <img
          className="global-bottom-nav-robot-image global-bottom-nav-robot-image-idle"
          src="/robots/robot-head/robot-head-idle.png"
          alt=""
        />

        <img
          className="global-bottom-nav-robot-image global-bottom-nav-robot-image-awake"
          src="/robots/robot-states/awake.png"
          alt=""
        />

        <img
          className="global-bottom-nav-robot-image global-bottom-nav-robot-image-happy"
          src="/robots/robot-states/happy.png"
          alt=""
        />

        <img
          className="global-bottom-nav-robot-image global-bottom-nav-robot-image-open"
          src="/robots/robot-states/open.png"
          alt=""
        />
      </div>
    </button>
  );
}

export default RobotHead;
