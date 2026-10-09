import { useEffect, useRef } from "react";
import {
    Map as MapLibreMap,
    NavigationControl,
    setWorkerUrl,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "./MapView.css";

import { useSettings } from "../../context/SettingContext";

setWorkerUrl(workerUrl);

type MapViewProps = {
    onMapReady?: (map: MapLibreMap) => void;
};

function MapView({ onMapReady }: MapViewProps) {
    const { context } = useSettings();

    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MapLibreMap | null>(null);
    const navigationControlRef = useRef<NavigationControl | null>(null);
    const onMapReadyRef = useRef(onMapReady);

    // Keep the latest callback without recreating the map.
    useEffect(() => {
        onMapReadyRef.current = onMapReady;
    }, [onMapReady]);

    // Initialize the map only once.
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

        mapRef.current = map;
        onMapReadyRef.current?.(map);

        return () => {
            navigationControlRef.current = null;
            mapRef.current = null;
            map.remove();
        };
    }, []);

    // Update navigation controls without rebuilding the map.
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        if (context.showMapControls && !navigationControlRef.current) {
            const control = new NavigationControl();
            map.addControl(control, "bottom-right");
            navigationControlRef.current = control;
        } else if (
            !context.showMapControls &&
            navigationControlRef.current
        ) {
            map.removeControl(navigationControlRef.current);
            navigationControlRef.current = null;
        }
    }, [context.showMapControls]);

    return <div ref={mapContainer} className="map-view" />;
}

export default MapView;

