function GeoPlayRobotDialogue({
  ftuePhase,
  locationStatus,
}) {
  const isLocationResult =
    locationStatus === "located" || locationStatus === "searching";

  const isDialogueVisible =
    ftuePhase === "dialogue" ||
    ftuePhase === "actions" ||
    locationStatus === "located" ||
    locationStatus === "searching";

  const dialogueText =
    locationStatus === "searching"
      ? "Now let me see what’s nearby."
      : locationStatus === "located"
        ? "There you are!"
        : "Before we find casinos that serve Geoplay games, I need to check your location.";

  return (
    <div
      className={`geoplay-earth-guide-unit ${
        isLocationResult ? "is-location-result" : ""
      } ${
        locationStatus === "searching" ? "is-nearby-searching" : ""
      }`}
    >
      <div className="geoplay-earth-guide-content">
        <div
          className={`geoplay-earth-dialogue ${
            isDialogueVisible ? "is-visible" : ""
          } ${
            isLocationResult ? "is-location-result" : ""
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
