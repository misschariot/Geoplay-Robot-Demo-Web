import { useEffect, useRef, useState } from "react";
import { Map, Marker, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import "./GeoPlayMap.css";
import GeoPlayNearbySearch from "./GeoPlayNearbySearch";
import GeoPlayLocationSearch from "./GeoPlayLocationSearch";
import GeoPlayRobotDialogue from "./GeoPlayRobotDialogue";
import GeoPlayLocationActions from "./GeoPlayLocationActions";

setWorkerUrl(workerUrl);

function GeoPlayMap({ startFtue = false }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const rotationFrameRef = useRef(null);
  const locationMarkerRef = useRef(null);
  const locationWatchIdRef = useRef(null);
  const locationWatchTimeoutRef = useRef(null);
  const locationStatusDismissTimeoutRef = useRef(null);
  const nearbySearchTimerRef = useRef(null);
  const isFlyingToLocationRef = useRef(false);

  const [ftuePhase, setFtuePhase] = useState("earth");
  const [locationStatus, setLocationStatus] = useState("idle");

  function stopLocationWatch() {
    if (
      locationWatchIdRef.current !== null &&
      navigator.geolocation
    ) {
      navigator.geolocation.clearWatch(locationWatchIdRef.current);
      locationWatchIdRef.current = null;
    }

    if (locationWatchTimeoutRef.current !== null) {
      window.clearTimeout(locationWatchTimeoutRef.current);
      locationWatchTimeoutRef.current = null;
    }

    if (locationStatusDismissTimeoutRef.current !== null) {
      window.clearTimeout(locationStatusDismissTimeoutRef.current);
      locationStatusDismissTimeoutRef.current = null;
    }

    if (nearbySearchTimerRef.current !== null) {
      window.clearTimeout(nearbySearchTimerRef.current);
      nearbySearchTimerRef.current = null;
    }
  }

  function handleAllowLocation() {
    if (!navigator.geolocation) {
      console.error("GeoPlay location check: browser geolocation is not supported.");
      setLocationStatus("unsupported");
      return;
    }

    // Show the location status while we request permission and collect
    // the best available location reading.
    if (locationStatusDismissTimeoutRef.current !== null) {
      window.clearTimeout(locationStatusDismissTimeoutRef.current);
      locationStatusDismissTimeoutRef.current = null;
    }

    setLocationStatus("requesting");

    const locationReadings = [];
    let bestPosition = null;

    const finishLocationLookup = () => {
      stopLocationWatch();

      if (!bestPosition) {
        console.error("GeoPlay location check: no usable location reading was received.");
        setLocationStatus("error");
        return;
      }

      const { latitude, longitude, accuracy } = bestPosition.coords;

      console.log("GeoPlay best location selected:", {
        latitude,
        longitude,
        accuracyMeters: accuracy,
        readingsCollected: locationReadings.length,
      });

      console.table(
        locationReadings.map((reading, index) => ({
          reading: index + 1,
          latitude: reading.latitude,
          longitude: reading.longitude,
          accuracyMeters: reading.accuracy,
        }))
      );

      const earthMap = map.current;

      if (!earthMap) {
        console.error("GeoPlay location received, but the Earth map is not ready.");
        setLocationStatus("error");
        return;
      }

      if (rotationFrameRef.current !== null) {
        cancelAnimationFrame(rotationFrameRef.current);
        rotationFrameRef.current = null;
      }

      isFlyingToLocationRef.current = true;
      setLocationStatus("flying");

      /*
        The location is now known, so the search card should leave as the
        Earth begins its camera flight. Keep it mounted just long enough
        for the fade-out animation to finish.
      */
      locationStatusDismissTimeoutRef.current = window.setTimeout(() => {
        locationStatusDismissTimeoutRef.current = null;
        if (isFlyingToLocationRef.current) {
          setLocationStatus("flight");
        }
      }, 500);

      console.log("GeoPlay camera flight starting from best reading:", {
        latitude,
        longitude,
        accuracyMeters: accuracy,
      });

      earthMap.flyTo({
        center: [longitude, latitude],
        // House-level view for testing the returned coordinates.
        zoom: 17.5,
        curve: 1.0,
        // Slightly quicker so the location reveal keeps momentum without
        // feeling abrupt.
        speed: 1.2,
        essential: true,
      });

      earthMap.once("moveend", () => {
        isFlyingToLocationRef.current = false;

        if (locationStatusDismissTimeoutRef.current !== null) {
          window.clearTimeout(locationStatusDismissTimeoutRef.current);
          locationStatusDismissTimeoutRef.current = null;
        }

        if (locationMarkerRef.current) {
          locationMarkerRef.current.remove();
          locationMarkerRef.current = null;
        }

        const markerElement = document.createElement("div");
        markerElement.className = "geoplay-earth-location-marker";
        markerElement.setAttribute("aria-label", "Your location");
        markerElement.setAttribute("role", "img");

        locationMarkerRef.current = new Marker({
          element: markerElement,
          anchor: "center",
        })
          .setLngLat([longitude, latitude])
          .addTo(earthMap);

        /*
          Let the status card finish its exit animation before revealing
          the located state and returning the robot.
        */
        locationStatusDismissTimeoutRef.current = window.setTimeout(() => {
          locationStatusDismissTimeoutRef.current = null;
          setLocationStatus("located");

          /*
            Give the player a moment to enjoy the location reveal, then
            naturally continue into the simulated nearby-property search.
          */
          nearbySearchTimerRef.current = window.setTimeout(() => {
            nearbySearchTimerRef.current = null;
            setLocationStatus("searching");
          }, 2400);
        }, 450);

        console.log("GeoPlay camera flight complete:", {
          latitude,
          longitude,
          accuracyMeters: accuracy,
        });
      });
    };

    locationWatchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        const reading = {
          latitude,
          longitude,
          accuracy,
          timestamp: position.timestamp,
        };

        locationReadings.push(reading);

        if (
          !bestPosition ||
          accuracy < bestPosition.coords.accuracy
        ) {
          bestPosition = position;
        }

        console.log("GeoPlay location reading:", {
          reading: locationReadings.length,
          latitude,
          longitude,
          accuracyMeters: accuracy,
        });

        /*
          If the browser gives us a genuinely strong reading, we can
          stop early. Otherwise, keep collecting for a few seconds so
          the OS/browser has an opportunity to improve the position.
        */
        if (accuracy <= 50) {
          finishLocationLookup();
        }
      },
      (error) => {
        console.error("GeoPlay location request failed:", error);

        stopLocationWatch();

        setLocationStatus(
          error.code === error.PERMISSION_DENIED
            ? "denied"
            : "error"
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );

    /*
      Give the browser/OS up to 8 seconds to improve the location.
      If a high-confidence reading arrives sooner, finishLocationLookup()
      ends the watch immediately.
    */
    locationWatchTimeoutRef.current = window.setTimeout(() => {
      finishLocationLookup();
    }, 8000);
  }

  useEffect(() => {
    if (!startFtue) return;

    const robotTimer = window.setTimeout(() => {
      setFtuePhase("robot");
    }, 900);

    const dialogueTimer = window.setTimeout(() => {
      setFtuePhase("dialogue");
    }, 2250);

    const actionsTimer = window.setTimeout(() => {
      setFtuePhase("actions");
    }, 3200);

    return () => {
      window.clearTimeout(robotTimer);
      window.clearTimeout(dialogueTimer);
      window.clearTimeout(actionsTimer);
    };
  }, [startFtue]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const earthMap = new Map({
      container: mapContainer.current,
      style: {
        version: 8,
        projection: { type: "globe" },
        sources: {
          satellite: {
            type: "raster",
            tiles: [
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            ],
            tileSize: 256,
            minzoom: 0,
            maxzoom: 19,
            attribution:
              "Sources: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
          },
        },
        layers: [
          {
            id: "satellite",
            type: "raster",
            source: "satellite",
            paint: {
              "raster-opacity": 1,
              "raster-brightness-min": 0,
              "raster-brightness-max": 1,
              "raster-contrast": 0.05,
              "raster-saturation": 0.05,
            },
          },
        ],
        sky: {
          "atmosphere-blend": [
            "interpolate", ["linear"], ["zoom"], 0, 1, 5, 1, 7, 0,
          ],
          "sky-color": "#02050A",
          "sky-horizon-blend": [
            "interpolate", ["linear"], ["zoom"], 0, 0.15, 2, 0.08, 5, 0,
          ],
          "horizon-color": "#07111B",
          "horizon-fog-blend": [
            "interpolate", ["linear"], ["zoom"], 0, 0.8, 2, 0.5, 5, 0,
          ],
        },
        light: {
          anchor: "map",
          position: [1.5, 90, 80],
          color: "#FFF4DC",
          intensity: 0.45,
        },
      },
      center: [0, 15],
      zoom: 1.1,
      attributionControl: true,
      interactive: false,
      maxPitch: 85,
      minZoom: 0,
      maxZoom: 19,
    });

    map.current = earthMap;

    const setResponsiveGlobeView = () => {
      const width = window.innerWidth;

      if (width <= 600) {
        earthMap.setZoom(1.30);
      } else if (width <= 1024) {
        earthMap.setZoom(2.25);
      } else {
        earthMap.setZoom(2.65);
      }

      earthMap.resize();
    };

    setResponsiveGlobeView();
    window.addEventListener("resize", setResponsiveGlobeView);

    let lastTime = performance.now();

    const rotateEarth = (time) => {
      if (isFlyingToLocationRef.current) {
        rotationFrameRef.current = null;
        return;
      }

      const deltaSeconds = (time - lastTime) / 1000;
      lastTime = time;

      const center = earthMap.getCenter();
      center.lng += deltaSeconds * 12;
      earthMap.setCenter(center);

      rotationFrameRef.current = requestAnimationFrame(rotateEarth);
    };

    rotationFrameRef.current = requestAnimationFrame(rotateEarth);

    return () => {
      stopLocationWatch();

      if (nearbySearchTimerRef.current !== null) {
        window.clearTimeout(nearbySearchTimerRef.current);
        nearbySearchTimerRef.current = null;
      }

      if (locationStatusDismissTimeoutRef.current !== null) {
        window.clearTimeout(locationStatusDismissTimeoutRef.current);
        locationStatusDismissTimeoutRef.current = null;
      }

      if (nearbySearchTimerRef.current !== null) {
        window.clearTimeout(nearbySearchTimerRef.current);
        nearbySearchTimerRef.current = null;
      }

      if (rotationFrameRef.current !== null) {
        cancelAnimationFrame(rotationFrameRef.current);
        rotationFrameRef.current = null;
      }

      window.removeEventListener("resize", setResponsiveGlobeView);

      if (locationMarkerRef.current) {
        locationMarkerRef.current.remove();
        locationMarkerRef.current = null;
      }

      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const isLocationFlightActive =
    locationStatus === "requesting" ||
    locationStatus === "flying" ||
    locationStatus === "flight";

  const isLocationStatusFading =
    locationStatus === "flying" || locationStatus === "flight";

  const isNearbySearchActive = locationStatus === "searching";

  useEffect(() => {
    if (!locationMarkerRef.current) return;

    const markerElement = locationMarkerRef.current.getElement();
    markerElement.classList.toggle("is-searching", isNearbySearchActive);
  }, [isNearbySearchActive]);

  return (
    <div className="geoplay-earth">
      <div ref={mapContainer} className="geoplay-earth-container" />

      {isLocationFlightActive && (
        <GeoPlayLocationSearch isFading={isLocationStatusFading} />
      )}

      {isNearbySearchActive && <GeoPlayNearbySearch />}

      <div
        className={`geoplay-earth-ftue-layer ${
          locationStatus === "located" || locationStatus === "searching"
            ? "is-location-result"
            : ""
        }`}
        aria-hidden={isLocationFlightActive}
      >
        {ftuePhase !== "earth" && !isLocationFlightActive && (
          <>
            <GeoPlayRobotDialogue
              ftuePhase={ftuePhase}
              locationStatus={locationStatus}
            />

            <GeoPlayLocationActions
              ftuePhase={ftuePhase}
              locationStatus={locationStatus}
              onAllowLocation={handleAllowLocation}
              onNotNow={() => setFtuePhase("dialogue")}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default GeoPlayMap;
