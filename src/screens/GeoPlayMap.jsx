import { useEffect, useRef } from "react";
import { Map, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import "./GeoPlayMap.css";

setWorkerUrl(workerUrl);

function GeoPlayMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) {
      return;
    }

    const earthMap = new Map({
      container: mapContainer.current,

      style: {
        version: 8,

        projection: {
          type: "globe",
        },

        sources: {
          satellite: {
            type: "raster",
            tiles: [
              "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg",
            ],
            tileSize: 256,
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

          /*
           * This establishes the visual direction of the
           * illuminated hemisphere.
           *
           * We are intentionally keeping this fixed for
           * the prototype. Later we can replace this with
           * a calculated Sun position.
           */
          position: [1.5, 90, 80],

          color: "#FFF4DC",
          intensity: 0.45,
        },
      },

      center: [0, 15],
      // The starting zoom is set responsively below so the Earth
      // stays large and clearly visible across desktop, tablet/iPad,
      // and phone browsers.
      zoom: 1.1,

      attributionControl: true,

      // Keep interaction enabled while we evaluate the globe.
      interactive: true,

      // Make the globe feel like a planet rather than a map.
      maxPitch: 85,
      minZoom: 0,
      maxZoom: 8,
    });

    map.current = earthMap;

    const setResponsiveGlobeView = () => {
      const width = window.innerWidth;

      if (width <= 600) {
        // Phone
        earthMap.setZoom(1.05);
      } else if (width <= 1024) {
        // Tablet / iPad
        earthMap.setZoom(1.12);
      } else {
        // Desktop
        earthMap.setZoom(1.18);
      }

      earthMap.resize();
    };

    setResponsiveGlobeView();
    window.addEventListener("resize", setResponsiveGlobeView);

    return () => {
      window.removeEventListener("resize", setResponsiveGlobeView);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className="geoplay-earth">
      <div
        ref={mapContainer}
        className="geoplay-earth-container"
      />
    </div>
  );
}

export default GeoPlayMap;