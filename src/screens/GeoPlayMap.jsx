import { useEffect, useRef, useState } from "react";
import { Map, Marker, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import "./GeoPlayMap.css";
import GeoPlayNearbySearch from "./GeoPlayNearbySearch";
import GeoPlayLocationSearch from "./GeoPlayLocationSearch";
import GeoPlayRobotDialogue from "./GeoPlayRobotDialogue";
import GeoPlayLocationActions from "./GeoPlayLocationActions";
import GeoPlayCasinoSheet from "./GeoPlayCasinoSheet";
import geoplayCasinos from "../data/geoplayCasinos";

setWorkerUrl(workerUrl);

const NEARBY_SEARCH_RADIUS_MILES = 100;

function calculateDistanceMiles(
  latitude1,
  longitude1,
  latitude2,
  longitude2
) {
  const earthRadiusMiles = 3958.8;

  const latitudeDifference =
    ((latitude2 - latitude1) * Math.PI) / 180;

  const longitudeDifference =
    ((longitude2 - longitude1) * Math.PI) / 180;

  const latitude1Radians =
    (latitude1 * Math.PI) / 180;

  const latitude2Radians =
    (latitude2 * Math.PI) / 180;

  const a =
    Math.sin(latitudeDifference / 2) *
      Math.sin(latitudeDifference / 2) +
    Math.cos(latitude1Radians) *
      Math.cos(latitude2Radians) *
      Math.sin(longitudeDifference / 2) *
      Math.sin(longitudeDifference / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return earthRadiusMiles * c;
}

function findNearbyGeoplayCasinos(latitude, longitude) {
  return geoplayCasinos
    .map((casino) => {
      const distanceMiles = calculateDistanceMiles(
        latitude,
        longitude,
        casino.latitude,
        casino.longitude
      );

      return {
        ...casino,
        distanceMiles,
      };
    })
    .filter(
      (casino) =>
        casino.distanceMiles <=
        NEARBY_SEARCH_RADIUS_MILES
    )
    .sort(
      (casinoA, casinoB) =>
        casinoA.distanceMiles -
        casinoB.distanceMiles
    );
}

function GeoPlayMap({ startFtue = false }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const rotationFrameRef = useRef(null);
  const locationMarkerRef = useRef(null);
  const casinoMarkerRefs = useRef([]);
  const locationWatchIdRef = useRef(null);
  const locationWatchTimeoutRef = useRef(null);
  const locationStatusDismissTimeoutRef = useRef(null);
  const nearbySearchTimerRef = useRef(null);
  const nearbyCasinosRef = useRef([]);
  const nearbyCameraTimerRef = useRef(null);
  const isFlyingToLocationRef = useRef(false);

  const [ftuePhase, setFtuePhase] = useState("earth");
  const [locationStatus, setLocationStatus] =
    useState("idle");
  const [playerLocation, setPlayerLocation] =
    useState(null);
  const [selectedCasino, setSelectedCasino] =
    useState(null);

  function clearCasinoMarkers() {
    casinoMarkerRefs.current.forEach(
      (marker) => {
        marker.remove();
      }
    );

    casinoMarkerRefs.current = [];
  }

  function handleCasinoMarkerTap(casino) {
    setSelectedCasino(casino);

    if (map.current) {
      map.current.easeTo({
        center: [
          casino.longitude,
          casino.latitude,
        ],
        duration: 900,
        essential: true,
      });
    }

    console.log(
      "GeoPlay casino selected:",
      {
        name: casino.name,
        distanceMiles: Number(
          casino.distanceMiles.toFixed(1)
        ),
      }
    );
  }

  function closeCasinoPanel() {
    setSelectedCasino(null);
  }

  function stopLocationWatch() {
    if (
      locationWatchIdRef.current !== null &&
      navigator.geolocation
    ) {
      navigator.geolocation.clearWatch(
        locationWatchIdRef.current
      );

      locationWatchIdRef.current = null;
    }

    if (
      locationWatchTimeoutRef.current !==
      null
    ) {
      window.clearTimeout(
        locationWatchTimeoutRef.current
      );

      locationWatchTimeoutRef.current = null;
    }

    if (
      locationStatusDismissTimeoutRef.current !==
      null
    ) {
      window.clearTimeout(
        locationStatusDismissTimeoutRef.current
      );

      locationStatusDismissTimeoutRef.current =
        null;
    }

    if (
      nearbySearchTimerRef.current !== null
    ) {
      window.clearTimeout(
        nearbySearchTimerRef.current
      );

      nearbySearchTimerRef.current = null;
    }

    if (
      nearbyCameraTimerRef.current !==
      null
    ) {
      window.clearTimeout(
        nearbyCameraTimerRef.current
      );

      nearbyCameraTimerRef.current = null;
    }
  }

  function handleAllowLocation() {
    if (!navigator.geolocation) {
      console.error(
        "GeoPlay location check: browser geolocation is not supported."
      );

      setLocationStatus("unsupported");
      return;
    }

    if (
      locationStatusDismissTimeoutRef.current !==
      null
    ) {
      window.clearTimeout(
        locationStatusDismissTimeoutRef.current
      );

      locationStatusDismissTimeoutRef.current =
        null;
    }

    setLocationStatus("requesting");

    const locationReadings = [];
    let bestPosition = null;

    const finishLocationLookup = () => {
      stopLocationWatch();

      if (!bestPosition) {
        console.error(
          "GeoPlay location check: no usable location reading was received."
        );

        setLocationStatus("error");
        return;
      }

      const {
        latitude,
        longitude,
        accuracy,
      } = bestPosition.coords;

      setPlayerLocation({
        latitude,
        longitude,
        accuracy,
      });

      console.log(
        "GeoPlay best location selected:",
        {
          latitude,
          longitude,
          accuracyMeters: accuracy,
          readingsCollected:
            locationReadings.length,
        }
      );

      console.table(
        locationReadings.map(
          (reading, index) => ({
            reading: index + 1,
            latitude: reading.latitude,
            longitude: reading.longitude,
            accuracyMeters:
              reading.accuracy,
          })
        )
      );

      const earthMap = map.current;

      if (!earthMap) {
        console.error(
          "GeoPlay location received, but the Earth map is not ready."
        );

        setLocationStatus("error");
        return;
      }

      if (
        rotationFrameRef.current !== null
      ) {
        cancelAnimationFrame(
          rotationFrameRef.current
        );

        rotationFrameRef.current = null;
      }

      isFlyingToLocationRef.current = true;
      setLocationStatus("flying");

      locationStatusDismissTimeoutRef.current =
        window.setTimeout(() => {
          locationStatusDismissTimeoutRef.current =
            null;

          if (
            isFlyingToLocationRef.current
          ) {
            setLocationStatus("flight");
          }
        }, 500);

      console.log(
        "GeoPlay camera flight starting from best reading:",
        {
          latitude,
          longitude,
          accuracyMeters: accuracy,
        }
      );

      earthMap.flyTo({
        center: [longitude, latitude],
        zoom: 17.5,
        curve: 1.0,
        speed: 1.2,
        essential: true,
      });

      earthMap.once("moveend", () => {
        isFlyingToLocationRef.current = false;

        if (
          locationStatusDismissTimeoutRef.current !==
          null
        ) {
          window.clearTimeout(
            locationStatusDismissTimeoutRef.current
          );

          locationStatusDismissTimeoutRef.current =
            null;
        }

        if (
          locationMarkerRef.current
        ) {
          locationMarkerRef.current.remove();
          locationMarkerRef.current = null;
        }

        clearCasinoMarkers();

        const markerElement =
          document.createElement("div");

        markerElement.className =
          "geoplay-earth-location-marker";

        markerElement.setAttribute(
          "aria-label",
          "Your location"
        );

        markerElement.setAttribute(
          "role",
          "img"
        );

        locationMarkerRef.current =
          new Marker({
            element: markerElement,
            anchor: "center",
          })
            .setLngLat([
              longitude,
              latitude,
            ])
            .addTo(earthMap);

        locationStatusDismissTimeoutRef.current =
          window.setTimeout(() => {
            locationStatusDismissTimeoutRef.current =
              null;

            setLocationStatus("located");

            nearbySearchTimerRef.current =
              window.setTimeout(() => {
                nearbySearchTimerRef.current =
                  null;

                setLocationStatus(
                  "searching"
                );
              }, 2400);
          }, 450);

        console.log(
          "GeoPlay camera flight complete:",
          {
            latitude,
            longitude,
            accuracyMeters: accuracy,
          }
        );
      });
    };

    locationWatchIdRef.current =
      navigator.geolocation.watchPosition(
        (position) => {
          const {
            latitude,
            longitude,
            accuracy,
          } = position.coords;

          const reading = {
            latitude,
            longitude,
            accuracy,
            timestamp:
              position.timestamp,
          };

          locationReadings.push(reading);

          if (
            !bestPosition ||
            accuracy <
              bestPosition.coords.accuracy
          ) {
            bestPosition = position;
          }

          console.log(
            "GeoPlay location reading:",
            {
              reading:
                locationReadings.length,
              latitude,
              longitude,
              accuracyMeters:
                accuracy,
            }
          );

          if (accuracy <= 50) {
            finishLocationLookup();
          }
        },
        (error) => {
          console.error(
            "GeoPlay location request failed:",
            error
          );

          stopLocationWatch();

          setLocationStatus(
            error.code ===
              error.PERMISSION_DENIED
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

    locationWatchTimeoutRef.current =
      window.setTimeout(() => {
        finishLocationLookup();
      }, 8000);
  }

  useEffect(() => {
    if (!startFtue) return;

    const robotTimer =
      window.setTimeout(() => {
        setFtuePhase("robot");
      }, 900);

    const dialogueTimer =
      window.setTimeout(() => {
        setFtuePhase("dialogue");
      }, 2250);

    const actionsTimer =
      window.setTimeout(() => {
        setFtuePhase("actions");
      }, 3200);

    return () => {
      window.clearTimeout(robotTimer);
      window.clearTimeout(dialogueTimer);
      window.clearTimeout(actionsTimer);
    };
  }, [startFtue]);

  useEffect(() => {
    if (
      !mapContainer.current ||
      map.current
    ) {
      return;
    }

    const earthMap = new Map({
      container:
        mapContainer.current,

      style: {
        version: 8,

        projection: {
          type: "globe",
        },

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
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            1,
            5,
            1,
            7,
            0,
          ],

          "sky-color": "#02050A",

          "sky-horizon-blend": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            0.15,
            2,
            0.08,
            5,
            0,
          ],

          "horizon-color": "#07111B",

          "horizon-fog-blend": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            0.8,
            2,
            0.5,
            5,
            0,
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

    const setResponsiveGlobeView =
      () => {
        const width =
          window.innerWidth;

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

    window.addEventListener(
      "resize",
      setResponsiveGlobeView
    );

    let lastTime =
      performance.now();

    const rotateEarth = (time) => {
      if (
        isFlyingToLocationRef.current
      ) {
        rotationFrameRef.current =
          null;

        return;
      }

      const deltaSeconds =
        (time - lastTime) / 1000;

      lastTime = time;

      const center =
        earthMap.getCenter();

      center.lng +=
        deltaSeconds * 12;

      earthMap.setCenter(center);

      rotationFrameRef.current =
        requestAnimationFrame(
          rotateEarth
        );
    };

    rotationFrameRef.current =
      requestAnimationFrame(
        rotateEarth
      );

    return () => {
      stopLocationWatch();

      clearCasinoMarkers();

      if (
        rotationFrameRef.current !==
        null
      ) {
        cancelAnimationFrame(
          rotationFrameRef.current
        );

        rotationFrameRef.current =
          null;
      }

      window.removeEventListener(
        "resize",
        setResponsiveGlobeView
      );

      if (
        locationMarkerRef.current
      ) {
        locationMarkerRef.current.remove();
        locationMarkerRef.current =
          null;
      }

      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (
      locationStatus !== "searching" ||
      !playerLocation
    ) {
      return;
    }

    const earthMap = map.current;

    if (!earthMap) {
      return;
    }

    const results =
      findNearbyGeoplayCasinos(
        playerLocation.latitude,
        playerLocation.longitude
      );

    nearbyCasinosRef.current =
      results;

    console.log(
      "GeoPlay nearby casino search complete:",
      {
        playerLatitude:
          playerLocation.latitude,

        playerLongitude:
          playerLocation.longitude,

        searchRadiusMiles:
          NEARBY_SEARCH_RADIUS_MILES,

        casinosFound:
          results.length,
      }
    );

    console.table(
      results.map((casino) => ({
        name: casino.name,

        distanceMiles:
          Number(
            casino.distanceMiles.toFixed(
              1
            )
          ),

        identityVerified:
          casino.identityVerified,
      }))
    );

    /*
      Give the SEARCHING NEARBY state a short moment
      before beginning the regional camera reveal.
    */
    nearbyCameraTimerRef.current =
      window.setTimeout(() => {
        nearbyCameraTimerRef.current =
          null;

        if (!map.current) {
          return;
        }

        const currentMap = map.current;

        clearCasinoMarkers();

        /*
          Include the player's location in the bounds
          so the camera always keeps the player visible.
        */
        const coordinates = [
          [
            playerLocation.longitude,
            playerLocation.latitude,
          ],
        ];

        results.forEach((casino) => {
          coordinates.push([
            casino.longitude,
            casino.latitude,
          ]);
        });

        if (coordinates.length === 1) {
          currentMap.flyTo({
            center: coordinates[0],
            zoom: 10,
            duration: 1800,
            essential: true,
          });
        } else {
          let minLongitude =
            coordinates[0][0];
          let maxLongitude =
            coordinates[0][0];
          let minLatitude =
            coordinates[0][1];
          let maxLatitude =
            coordinates[0][1];

          coordinates.forEach(
            ([longitude, latitude]) => {
              minLongitude =
                Math.min(
                  minLongitude,
                  longitude
                );

              maxLongitude =
                Math.max(
                  maxLongitude,
                  longitude
                );

              minLatitude =
                Math.min(
                  minLatitude,
                  latitude
                );

              maxLatitude =
                Math.max(
                  maxLatitude,
                  latitude
                );
            }
          );

          currentMap.fitBounds(
            [
              [
                minLongitude,
                minLatitude,
              ],
              [
                maxLongitude,
                maxLatitude,
              ],
            ],
            {
              padding: {
                top: 150,
                right: 90,
                bottom: 110,
                left: 90,
              },
              maxZoom: 9.5,
              duration: 2200,
              essential: true,
            }
          );
        }

        /*
          All nearby casino markers appear together.
        */
        results.forEach((casino) => {
          const casinoMarkerElement =
            document.createElement("div");

          casinoMarkerElement.className =
            "geoplay-earth-casino-marker";

          casinoMarkerElement.dataset.casinoId =
            casino.id;

          casinoMarkerElement.setAttribute(
            "aria-label",
            casino.name
          );

          casinoMarkerElement.setAttribute(
            "role",
            "button"
          );

          casinoMarkerElement.addEventListener(
            "click",
            () => {
              handleCasinoMarkerTap(casino);
            }
          );

          const casinoMarker =
            new Marker({
              element:
                casinoMarkerElement,
              anchor: "center",
            })
              .setLngLat([
                casino.longitude,
                casino.latitude,
              ])
              .addTo(currentMap);

          casinoMarkerRefs.current.push(
            casinoMarker
          );
        });

        console.log(
          "GeoPlay casino markers revealed:",
          results.map((casino) => ({
            name: casino.name,
            distanceMiles:
              Number(
                casino.distanceMiles.toFixed(
                  1
                )
              ),
          }))
        );
      }, 900);

    return () => {
      if (
        nearbyCameraTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          nearbyCameraTimerRef.current
        );

        nearbyCameraTimerRef.current =
          null;
      }
    };
  }, [
    locationStatus,
    playerLocation,
  ]);

  useEffect(() => {
    casinoMarkerRefs.current.forEach(
      (marker) => {
        const markerElement =
          marker.getElement();

        markerElement.classList.toggle(
          "is-selected",
          selectedCasino?.id ===
            markerElement.dataset.casinoId
        );
      }
    );
  }, [selectedCasino]);

  const isLocationFlightActive =
    locationStatus === "requesting" ||
    locationStatus === "flying" ||
    locationStatus === "flight";

  const isLocationStatusFading =
    locationStatus === "flying" ||
    locationStatus === "flight";

  const isNearbySearchActive =
    locationStatus === "searching";

  useEffect(() => {
    if (
      !locationMarkerRef.current
    ) {
      return;
    }

    const markerElement =
      locationMarkerRef.current.getElement();

    markerElement.classList.toggle(
      "is-searching",
      isNearbySearchActive
    );
  }, [isNearbySearchActive]);



  return (
    <div className="geoplay-earth">
      <div
        ref={mapContainer}
        className="geoplay-earth-container"
      />

      {isLocationFlightActive && (
        <GeoPlayLocationSearch
          isFading={
            isLocationStatusFading
          }
        />
      )}

      {isNearbySearchActive &&
        !selectedCasino && (
          <GeoPlayNearbySearch />
        )}

      <div
        className={`geoplay-earth-ftue-layer ${
          locationStatus === "located" ||
          locationStatus === "searching"
            ? "is-location-result"
            : ""
        } ${
          selectedCasino
            ? "is-casino-selected"
            : ""
        }`}
        aria-hidden={
          isLocationFlightActive ||
          Boolean(selectedCasino)
        }
      >
        {ftuePhase !== "earth" &&
          !isLocationFlightActive &&
          !selectedCasino && (
            <>
              <GeoPlayRobotDialogue
                ftuePhase={ftuePhase}
                locationStatus={
                  locationStatus
                }
              />

              <GeoPlayLocationActions
                ftuePhase={ftuePhase}
                locationStatus={
                  locationStatus
                }
                onAllowLocation={
                  handleAllowLocation
                }
                onNotNow={() =>
                  setFtuePhase(
                    "dialogue"
                  )
                }
              />
            </>
          )}
      </div>

      {selectedCasino && (
        <GeoPlayCasinoSheet
          casino={selectedCasino}
          onClose={closeCasinoPanel}
        />
      )}
    </div>
  );
}

export default GeoPlayMap;