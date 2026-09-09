function GeoPlayRobotDialogue({
  ftuePhase,
  locationStatus,
  isNearbySearchActive,
  isNearbySearchResultReady,
  isNearbyResultDialogueFading,
  isFtueComplete,
}) {
  const isLocationResult =
    locationStatus === "located" || locationStatus === "searching";

  const isDialogueVisible =
    !isFtueComplete &&
    (
      ftuePhase === "dialogue" ||
      ftuePhase === "actions" ||
      locationStatus === "located" ||
      locationStatus === "searching"
    );

  const dialogueText =
    isNearbySearchResultReady
      ? "You can play Geoplay games at these locations!"
      : locationStatus === "searching"
        ? "Now let me see what’s nearby."
        : locationStatus === "located"
          ? "There you are!"
          : "Before we find casinos that serve Geoplay games, I need to check your location.";

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
      }`}
    >
      <div
        key={
          isNearbySearchResultReady
            ? "nearby-search-result"
            : "default"
        }
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
          className="geoplay-earth-robot-image is-visible"
          src="/robots/geoplay-robot-waving.png"
          alt=""
        />
      </div>
    </div>
  );
}

export default GeoPlayRobotDialogue;
