import { useEffect, useRef, useState } from "react";

function GeoPlayRobotDialogue({
  ftuePhase,
  locationStatus,
  isNearbySearchActive,
  isNearbySearchResultReady,
  isGoingToCasino,
  isNearbyResultDialogueFading,
  isFtueComplete,
  isFtueVerificationDialogue,
  isFtueWrapUpDialogue,
  onExploreGeoplay,
}) {
  const [isWrapUpDialogueVisible, setIsWrapUpDialogueVisible] =
    useState(false);
  const [isWrapUpButtonVisible, setIsWrapUpButtonVisible] =
    useState(false);
  const wrapUpRobotRef = useRef(null);

  useEffect(() => {
    if (!isFtueWrapUpDialogue) {
      setIsWrapUpDialogueVisible(false);
      setIsWrapUpButtonVisible(false);
      return;
    }

    const robotElement = wrapUpRobotRef.current;

    if (!robotElement) {
      return;
    }

    const handleRobotEntranceComplete = (event) => {
      if (
        event.animationName !==
        "geoplayEarthRobotEnter"
      ) {
        return;
      }

      /*
        Do not use a guessed timeout here. The final dialogue is
        revealed from the actual completion of the robot's entrance
        animation, so it cannot appear while the robot is still moving.
      */
      setIsWrapUpDialogueVisible(true);
    };

    robotElement.addEventListener(
      "animationend",
      handleRobotEntranceComplete
    );

    /*
      The final dialogue takes 650ms to enter. Reveal the Home CTA
      immediately after that entrance has completed.
    */
    const buttonTimer = window.setTimeout(() => {
      setIsWrapUpButtonVisible(true);
    }, 2050);

    return () => {
      robotElement.removeEventListener(
        "animationend",
        handleRobotEntranceComplete
      );
      window.clearTimeout(buttonTimer);
    };
  }, [isFtueWrapUpDialogue]);

  const isLocationResult =
    locationStatus === "located" || locationStatus === "searching";

  const isDialogueVisible =
    (isFtueWrapUpDialogue && isWrapUpDialogueVisible) ||
    isFtueVerificationDialogue ||
    (
      !isFtueComplete &&
      (
        ftuePhase === "dialogue" ||
        ftuePhase === "actions" ||
        locationStatus === "located" ||
        locationStatus === "searching" ||
        locationStatus === "denied"
      )
    );

  const dialogueText =
    isFtueWrapUpDialogue
      ? "And that’s it! You’re all set to explore Geoplay."
      : isFtueVerificationDialogue
      ? "One more thing! You’ll need to be verified at each location before you can play."
      : isGoingToCasino
        ? "Let’s go to a casino!"
      : isNearbySearchResultReady
        ? "You can play geoplay games at these locations!"
        : locationStatus === "searching"
        ? "Now let me see what’s nearby."
        : locationStatus === "located"
          ? "There you are!"
          : locationStatus === "denied"
            ? "No problem. What would you like to do next?"
            : "Before we find casinos serving geoplay games, I need to check your location.";

  return (
    <div
      className={`geoplay-earth-guide-unit ${
        isLocationResult ? "is-location-result" : ""
      } ${
        isNearbySearchActive
          ? "is-nearby-searching"
          : ""
      } ${
        isNearbySearchResultReady
          ? "is-nearby-search-complete"
          : ""
      } ${
        isFtueVerificationDialogue
          ? "is-ftue-verification"
          : ""
      } ${
        isFtueWrapUpDialogue
          ? "is-ftue-wrap-up"
          : ""
      }`}
    >
      <div
        className="geoplay-earth-guide-content"
      >
        <div
          className={`geoplay-earth-dialogue ${
            isDialogueVisible ? "is-visible" : ""
          } ${
            isLocationResult ? "is-location-result" : ""
          } ${
            isNearbyResultDialogueFading
              ? "is-nearby-result-fading"
              : ""
          }`}
        >
          {dialogueText}
        </div>

        <img
          ref={wrapUpRobotRef}
          className="geoplay-earth-robot-image is-visible"
          src="/robots/geoplay-robot-waving.png"
          alt=""
        />

      </div>

      {isFtueWrapUpDialogue && isWrapUpButtonVisible && (
        <div className="geoplay-earth-wrap-up-actions">
          <button
            className="geoplay-earth-allow-button"
            onClick={onExploreGeoplay}
          >
            EXPLORE GEOPLAY
          </button>
        </div>
      )}
    </div>
  );
}

export default GeoPlayRobotDialogue;
