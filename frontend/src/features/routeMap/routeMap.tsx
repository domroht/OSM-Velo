import { useEffect, useRef, useState } from "react";
import {
  Marker,
  type GeoJSONSource,
  type Map as MapLibreMap,
  type MapMouseEvent,
} from "maplibre-gl";

import "./routeMap.css";

type Point = {
  lng: number;
  lat: number;
};

type MapRouteProps = {
  map: MapLibreMap | null;
  onClose: () => void;
};

type SearchResult = {
  lat: string;
  lon: string;
  display_name: string;
};

function createMapMarker(
  map: MapLibreMap,
  point: Point,
  type: "start" | "end",
) {
  const element = document.createElement("div");

  element.style.width = "16px";
  element.style.height = "16px";
  element.style.borderRadius = "50%";
  element.style.background = type === "start" ? "#16a34a" : "#dc2626";
  element.style.border = "3px solid white";
  element.style.boxShadow = "0 1px 4px rgba(0,0,0,0.4)";

  return new Marker({
    element,
    anchor: "center",
  })
    .setLngLat([point.lng, point.lat])
    .addTo(map);
}

function MapRoutePlanner({
  map,
  onClose,
}: MapRouteProps) {

  const [activeField, setActiveField] = useState<"start" | "end">("start");

  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [endPoint, setEndPoint] = useState<Point | null>(null);

  const [startQuery, setStartQuery] = useState("");
  const [endQuery, setEndQuery] = useState("");

  const [startResults, setStartResults] = useState<SearchResult[]>([]);
  const [endResults, setEndResults] = useState<SearchResult[]>([]);

  const [distance, setDistance] = useState<number | null>(null);

  const [loadingRoute, setLoadingRoute] = useState(false);

  const startMarkerRef = useRef<Marker | null>(null);
  const endMarkerRef = useRef<Marker | null>(null);

  useEffect(() => {
    if (!map) return;

    startMarkerRef.current?.remove();
    startMarkerRef.current = null;

    if (!startPoint) return;

    startMarkerRef.current = createMapMarker(
      map,
      startPoint,
      "start",
    );

    return () => {
      startMarkerRef.current?.remove();
      startMarkerRef.current = null;
    };
  }, [map, startPoint]);

  useEffect(() => {
    if (!map) return;

    endMarkerRef.current?.remove();
    endMarkerRef.current = null;

    if (!endPoint) return;

    endMarkerRef.current = createMapMarker(
      map,
      endPoint,
      "end",
    );

    return () => {
      endMarkerRef.current?.remove();
      endMarkerRef.current = null;
    };
  }, [map, endPoint]);

  useEffect(() => {
    if (!map) {
      return;
    }

    function handleMapClick(event: MapMouseEvent) {
      const point: Point = {
        lng: event.lngLat.lng,
        lat: event.lngLat.lat,
      };

      console.log(
        "Route planner map click:",
        point,
        "active field:",
        activeField,
      );

      if (activeField === "start") {
        setStartPoint(point);
        setStartQuery(
          `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`,
        );
      } else {
        setEndPoint(point);
        setEndQuery(
          `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`,
        );
      }
    }

    map.on("click", handleMapClick);

    return () => {
      map.off("click", handleMapClick);
    };
  }, [map, activeField]);

  useEffect(() => {
    if (!startQuery.trim()) {
      setStartResults([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
            startQuery,
          )}&limit=5`,
        );

        if (!response.ok) {
          return;
        }

        const results =
          (await response.json()) as SearchResult[];

        setStartResults(results);
      } catch (error) {
        console.error("Start search failed:", error);
      }
    }, 400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [startQuery]);

  useEffect(() => {
    if (!endQuery.trim()) {
      setEndResults([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
            endQuery,
          )}&limit=5`,
        );

        if (!response.ok) {
          return;
        }

        const results =
          (await response.json()) as SearchResult[];

        setEndResults(results);
      } catch (error) {
        console.error("End search failed:", error);
      }
    }, 400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [endQuery]);

  function selectStartResult(result: SearchResult) {
    const point: Point = {
      lng: Number(result.lon),
      lat: Number(result.lat),
    };

    setStartPoint(point);
    setStartQuery(result.display_name);
    setStartResults([]);

    map?.flyTo({
      center: [point.lng, point.lat],
      zoom: 10,
      duration: 1000,
    });
  }

  function selectEndResult(result: SearchResult) {
    const point: Point = {
      lng: Number(result.lon),
      lat: Number(result.lat),
    };

    setEndPoint(point);
    setEndQuery(result.display_name);
    setEndResults([]);

    map?.flyTo({
      center: [point.lng, point.lat],
      zoom: 1,
      duration: 1000,
    });
  }



  async function calculateRoute() {
    if (!map || !startPoint || !endPoint) return;

    setLoadingRoute(true);

    try {
      const coordinates = `${startPoint.lng},${startPoint.lat};${endPoint.lng},${endPoint.lat}`;

      const response = await fetch(`https://routing.openstreetmap.de/routed-bike/route/v1/driving/${coordinates}?overview=full&geometries=geojson`);

      if (!response.ok) throw new Error(`Routing request failed: ${response.status}`);

      const data = await response.json();

      if (!data.routes?.length) throw new Error("No route found");

      const route = data.routes[0];

      setDistance(route.distance);

      const sourceId = "planned-route";

      if (map.getSource(sourceId)) {
        const source = map.getSource(
          sourceId,
        ) as GeoJSONSource;

        source.setData({
          type: "Feature",
          properties: {},
          geometry: route.geometry,
        });
      } else {
        map.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: route.geometry,
          },
        });

        map.addLayer({
          id: "planned-route-line",
          type: "line",
          source: sourceId,
          paint: {
            "line-color": "#1f3f82",
            "line-width": 5,
            "line-opacity": 0.85,
          },
        });
      }
    } catch (error) {
      console.error("Route calculation failed:", error);
      setDistance(null);
    } finally {
      setLoadingRoute(false);
    }
  }

  function clearRoute() {
    if (!map) return;

    if (map.getLayer("planned-route-line")) map.removeLayer("planned-route-line");

    if (map.getSource("planned-route")) map.removeSource("planned-route");

    setDistance(null);
  }

  function clearAll() {
    clearRoute();

    setStartPoint(null);
    setEndPoint(null);

    setStartQuery("");
    setEndQuery("");

    setStartResults([]);
    setEndResults([]);

    setActiveField("start");
  }

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, [map]);

  return (
    <div className="map-route">
      <div className="map-route-header">

          <h3>Plan route</h3>

      </div>

      <div className="map-route-fields">
        <div className="map-route-field">
          <label htmlFor="route-start">
            Start
          </label>

          <input
            id="route-start"
            value={startQuery}
            onChange={(event) => {
              setStartQuery(event.target.value);
              setActiveField("start");
            }}
            onFocus={() => {
              setActiveField("start");
            }}
            placeholder="Start location"
          />

          {startResults.length > 0 && (
            <div className="map-route-results">
              {startResults.map((result, index) => (
                <button
                  type="button"
                  key={`${result.lat}-${result.lon}-${index}`}
                  onClick={() =>
                    selectStartResult(result)
                  }
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="map-route-field">
          <label htmlFor="route-end">
            Destination
          </label>

          <input
            id="route-end"
            value={endQuery}
            onChange={(event) => {
              setEndQuery(event.target.value);
              setActiveField("end");
            }}
            onFocus={() => {
              setActiveField("end");
            }}
            placeholder="Destination"
          />

          {endResults.length > 0 && (
            <div className="map-route-results">
              {endResults.map((result, index) => (
                <button
                  type="button"
                  key={`${result.lat}-${result.lon}-${index}`}
                  onClick={() =>
                    selectEndResult(result)
                  }
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {distance !== null && (
        <div className="map-route-distance">
          Distance:{" "}
          {(distance / 1000).toFixed(1)} km
        </div>
      )}

      <div className="map-route-actions">
        <button
          type="button"
          onClick={calculateRoute}
          disabled={
            !startPoint ||
            !endPoint ||
            loadingRoute
          }
        >
          {loadingRoute
            ? "Calculating..."
            : "Calculate route"}
        </button>

        <button
          type="button"
          onClick={clearAll}
        >
          Clear
        </button>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close route planner"
        >
          Cancel
        </button>
        
      </div>
    </div>
  );
}

export default MapRoutePlanner;