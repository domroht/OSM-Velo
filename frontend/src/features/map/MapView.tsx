import { useEffect, useRef } from "react";
import {
  Map as MapLibreMap,
  NavigationControl,
  AttributionControl,
  setWorkerUrl,
} from "maplibre-gl";

import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

import "maplibre-gl/dist/maplibre-gl.css";
import "./MapView.css";

setWorkerUrl(workerUrl);

type MapViewProps = {
  onMapReady?: (map: MapLibreMap) => void;
};

function MapView({ onMapReady }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new MapLibreMap({
      container: mapContainer.current,

      style: {
        version: 8,

        sources: {
          osm: {
            type: "raster",
            tiles: [
              "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            maxzoom: 19,
            attribution: "© OpenStreetMap contributors",
          },
        },

        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
        ],
      },

      center: [10.2039, 56.1629],
      zoom: 12,

      cancelPendingTileRequestsWhileZooming: false,
    });

    map.addControl(
      new NavigationControl(),
      "top-right",
    );

    map.addControl(
      new AttributionControl(),
      "bottom-right",
    );

    onMapReady?.(map);

    return () => map.remove();
  }, [onMapReady]);

  return <div ref={mapContainer} className="map-view" />;
}

export default MapView;