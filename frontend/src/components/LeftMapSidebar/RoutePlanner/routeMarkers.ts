import { Marker, type Map as MapLibreMap } from "maplibre-gl";
import type { Point } from "./routeTypes";

export function createMapMarker(
    map: MapLibreMap,
    point: Point,
    color: string,
): Marker {
    const element = document.createElement("div");

    Object.assign(element.style, {
        width: "16px",
        height: "16px",
        borderRadius: "50%",
        background: color,
        border: "3px solid white",
        boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
    });

    return new Marker({ element, anchor: "center" })
        .setLngLat([point.lng, point.lat])
        .addTo(map);
}

export function updateMapMarkerColor( marker: Marker, color: string, ): void { 
    marker.getElement().style.backgroundColor = color; 
}