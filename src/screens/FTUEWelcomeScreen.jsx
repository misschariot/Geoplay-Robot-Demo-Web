import { useEffect, useState } from "react";
import "./FTUEWelcomeScreen.css";

const stars = [
  { x: 5, y: 9, size: 2.3, delay: 0.8, duration: 7.8, opacity: 0.9 },
  { x: 24, y: 12, size: 1.7, delay: 5.4, duration: 8.6, opacity: 0.82 },
  { x: 47, y: 7, size: 2.2, delay: 4.6, duration: 7.2, opacity: 0.92 },
  { x: 74, y: 10, size: 1.8, delay: 6.2, duration: 8.4, opacity: 0.84 },
  { x: 19, y: 58, size: 2.1, delay: 7.1, duration: 7.6, opacity: 0.86 },
  { x: 69, y: 76, size: 1.9, delay: 3.8, duration: 8.1, opacity: 0.82 },
  { x: 95, y: 68, size: 2.2, delay: 1.9, duration: 8.8, opacity: 0.88 },
  { x: 27, y: 91, size: 1.8, delay: 2.2, duration: 7.9, opacity: 0.8 },

  { x: 14, y: 24, size: 1.3, delay: 3.1, duration: 8.4, opacity: 0.68 },
  { x: 34, y: 31, size: 1.1, delay: 1.7, duration: 9.1, opacity: 0.62 },
  { x: 61, y: 18, size: 1.4, delay: 2.4, duration: 8.8, opacity: 0.7 },
  { x: 91, y: 27, size: 1.2, delay: 1.1, duration: 9.4, opacity: 0.64 },

  { x: 8, y: 43, size: 1.1, delay: 4.2, duration: 8.1, opacity: 0.6 },
  { x: 31, y: 47, size: 1.3, delay: 2.8, duration: 9.7, opacity: 0.64 },
  { x: 43, y: 72, size: 1.5, delay: 5.7, duration: 7.5, opacity: 0.7 },
  { x: 57, y: 55, size: 1.1, delay: 0.5, duration: 8.9, opacity: 0.58 },
  { x: 82, y: 49, size: 1.2, delay: 6.8, duration: 9.2, opacity: 0.62 },

  { x: 4, y: 83, size: 1.2, delay: 5.1, duration: 8.6, opacity: 0.6 },
  { x: 52, y: 88, size: 1.1, delay: 7.4, duration: 9.5, opacity: 0.56 },
  { x: 77, y: 92, size: 1.3, delay: 4.9, duration: 6.8, opacity: 0.62 },
  { x: 97, y: 89, size: 1.1, delay: 0.9, duration: 8.3, opacity: 0.58 },

  { x: 12, y: 69, size: 0.9, delay: 6.5, duration: 10.2, opacity: 0.5 },
  { x: 37, y: 15, size: 0.9, delay: 3.6, duration: 9.8, opacity: 0.48 },
  { x: 55, y: 35, size: 1.0, delay: 8.1, duration: 10.5, opacity: 0.5 },
  { x: 72, y: 38, size: 0.9, delay: 1.4, duration: 9.6, opacity: 0.52 },
  { x: 87, y: 16, size: 1.0, delay: 5.8, duration: 10.8, opacity: 0.5 },
  { x: 16, y: 37, size: 0.9, delay: 7.7, duration: 9.9, opacity: 0.48 },
  { x: 63, y: 91, size: 0.9, delay: 2.9, duration: 10.1, opacity: 0.5 },
  { x: 88, y: 61, size: 1.0, delay: 4.4, duration: 9.3, opacity: 0.52 },
];

function FTUEWelcomeScreen() {
  const [robotPhase, setRobotPhase] = useState("flying");

  useEffect(() => {
    // Existing flight:
    // 700ms delay + 5000ms flight = 5700ms
    const transitionTimer = setTimeout(() => {
      setRobotPhase("transitioning");
    }, 5700);

    return () => {
      clearTimeout(transitionTimer);
    };
  }, []);

  useEffect(() => {
    // The waving robot finishes its 900ms slide-up
    // after the existing 320ms delay.
    //
    // 320ms delay + 900ms animation = 1220ms
    //
    // Once that is complete, switch to the dedicated
    // hovering phase so the floating animation takes
    // over cleanly without competing with the slide.
    if (robotPhase !== "transitioning") {
      return;
    }

    const hoverTimer = setTimeout(() => {
      setRobotPhase("hovering");
    }, 1220);

    return () => {
      clearTimeout(hoverTimer);
    };
  }, [robotPhase]);

  useEffect(() => {
    // Give the robot a short hover before it smoothly backs away.
    if (robotPhase !== "hovering") {
      return;
    }

    const backingTimer = setTimeout(() => {
      setRobotPhase("backing");
    }, 1800);

    return () => {
      clearTimeout(backingTimer);
    };
  }, [robotPhase]);

  useEffect(() => {
    // The backing-away animation lasts 1100ms.
    // Once complete, lock the robot into its final
    // centered resting position.
    if (robotPhase !== "backing") {
      return;
    }

    const centeredTimer = setTimeout(() => {
      setRobotPhase("centered");
    }, 1100);

    return () => {
      clearTimeout(centeredTimer);
    };
  }, [robotPhase]);

  return (
    <main
      className={`ftue-welcome-screen ftue-robot-phase-${robotPhase}`}
    >
      <div className="ftue-welcome-background">

        <div className="ftue-star-field" aria-hidden="true">
          {stars.map((star, index) => (
            <span
              key={index}
              className="ftue-star"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`,
              }}
            />
          ))}
        </div>

        <img
          className="ftue-space-ship ftue-space-ship-forward"
          src="/ships/geoplay-space-ship.png"
          alt=""
          aria-hidden="true"
        />

        <img
          className="ftue-space-ship ftue-space-ship-return"
          src="/ships/geoplay-space-ship.png"
          alt=""
          aria-hidden="true"
        />
      </div>

      {/* Robot thruster effect
          Exists ONLY during the initial flight/POW portion. */}
      {(robotPhase === "flying" || robotPhase === "transitioning") && (
        <span
          className="ftue-robot-thruster"
          aria-hidden="true"
        >
          <span className="ftue-robot-thruster-halo" />
          <span className="ftue-robot-thruster-core" />
          <span className="ftue-robot-thruster-flare" />
        </span>
      )}

      {/* Flying robot
          Exists ONLY during the initial flight and immediate POW.
          Once POW completes, this element is removed from the DOM. */}
      {(robotPhase === "flying" || robotPhase === "transitioning") && (
        <img
          className="ftue-robot-flying"
          src="/robots/geoplay-robot-flying.png"
          alt=""
          aria-hidden="true"
        />
      )}

      {/* Propulsion particles
          Exists ONLY during the initial flight/POW portion. */}
      {(robotPhase === "flying" || robotPhase === "transitioning") && (
        <span
          className="ftue-robot-particles"
          aria-hidden="true"
        >
          <span className="ftue-robot-particle ftue-robot-particle-1" />
          <span className="ftue-robot-particle ftue-robot-particle-2" />
          <span className="ftue-robot-particle ftue-robot-particle-3" />
          <span className="ftue-robot-particle ftue-robot-particle-4" />
          <span className="ftue-robot-particle ftue-robot-particle-5" />
          <span className="ftue-robot-particle ftue-robot-particle-6" />
          <span className="ftue-robot-particle ftue-robot-particle-7" />
          <span className="ftue-robot-particle ftue-robot-particle-8" />
          <span className="ftue-robot-particle ftue-robot-particle-9" />
          <span className="ftue-robot-particle ftue-robot-particle-10" />
          <span className="ftue-robot-particle ftue-robot-particle-11" />
          <span className="ftue-robot-particle ftue-robot-particle-12" />
          <span className="ftue-robot-particle ftue-robot-particle-13" />
          <span className="ftue-robot-particle ftue-robot-particle-14" />
        </span>
      )}

      {/* Large futuristic arrival POW */}
      <span
        className="ftue-robot-arrival-flash"
        aria-hidden="true"
      />

      {/* Waving robot stage
          The stage owns the existing waving/back-away/centered
          transforms so the robot and its particles move together. */}
      <span className="ftue-robot-waving-stage" aria-hidden="true">

        {/* Waving robot particles
            Separate system for the upright waving robot. */}
        <span className="ftue-waving-robot-particles">
          <span className="ftue-waving-robot-particle ftue-waving-robot-particle-1" />
          <span className="ftue-waving-robot-particle ftue-waving-robot-particle-2" />
          <span className="ftue-waving-robot-particle ftue-waving-robot-particle-3" />
          <span className="ftue-waving-robot-particle ftue-waving-robot-particle-4" />
          <span className="ftue-waving-robot-particle ftue-waving-robot-particle-5" />
          <span className="ftue-waving-robot-particle ftue-waving-robot-particle-6" />
          <span className="ftue-waving-robot-particle ftue-waving-robot-particle-7" />
          <span className="ftue-waving-robot-particle ftue-waving-robot-particle-8" />
          <span className="ftue-waving-robot-particle ftue-waving-robot-particle-9" />
          <span className="ftue-waving-robot-particle ftue-waving-robot-particle-10" />
          <span className="ftue-waving-robot-particle ftue-waving-robot-particle-11" />
          <span className="ftue-waving-robot-particle ftue-waving-robot-particle-12" />
          <span className="ftue-waving-robot-particle ftue-waving-robot-particle-13" />
          <span className="ftue-waving-robot-particle ftue-waving-robot-particle-14" />
        </span>

        {/* Waving robot */}
        <img
          className="ftue-robot-waving"
          src="/robots/geoplay-robot-waving.png"
          alt=""
        />
      </span>

      {/* Close-up greeting bubble
          Appears only after the waving robot has finished
          sliding into its close-up position.
          It disappears automatically when the backing phase begins. */}
    </main>
  );
}

export default FTUEWelcomeScreen;