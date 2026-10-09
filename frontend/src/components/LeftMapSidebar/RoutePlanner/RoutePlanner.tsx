import { useEffect, useRef, useState } from "react";
import { Marker, type Map as MapLibreMap, MapMouseEvent, type GeoJSONSource,} from "maplibre-gl";
import "./RoutePlanner.css"

import { useSettings } from "../../../context/SettingContext";
import { formatDistance } from "../../../utils/units";

import type { Point, SearchResult, Destination } from "./routeTypes";
import { createMapMarker } from "./routeMarkers";
import { searchLocation, calculateRoute as requestRoute} from "./routeApi";


type MapRouteProps = {
    map: MapLibreMap | null;
    onClose: () => void;
};

function MapRoutePlanner({ map, onClose }: MapRouteProps) {
    const { context } = useSettings();

    const [activeField, setActiveField] = useState<"start" | number>("start");

    const [startPoint, setStartPoint] = useState<Point | null>(null);

    const [startQuery, setStartQuery] = useState("");

    const [startResults, setStartResults] = useState<SearchResult[]>([]);
    const [destinations, setDestinations] = useState<Destination[]>([{ id: 1, point: null, query: "", results: [] }]);

    const [distance, setDistance] = useState<number | null>(null);
    const [loadingRoute, setLoadingRoute] = useState(false);

    const startMarkerRef = useRef<Marker | null>(null);
    const destinationMarkersRef = useRef<Map<number, Marker>>(new Map());
    const nextDestinationIdRef = useRef(2);


    // Manages markers on the map
    useEffect(() => {
        if (!map) return;

        // Update or create the start marker.
        if (!startPoint) {
            startMarkerRef.current?.remove();
            startMarkerRef.current = null;
        } else if (!startMarkerRef.current) {
            startMarkerRef.current = createMapMarker(
                map,
                startPoint,
                context.startPinColor,
            );
        } else {
            startMarkerRef.current
                .setLngLat([startPoint.lng, startPoint.lat]);

            startMarkerRef.current
                .getElement()
                .style.setProperty("background-color", context.startPinColor);
        }

        // Remove markers for deleted destinations.
        const currentIds = new Set(destinations.map((d) => d.id));

        for (const [id, marker] of destinationMarkersRef.current) {
            if (!currentIds.has(id)) {
                marker.remove();
                destinationMarkersRef.current.delete(id);
            }
        }

        // Update or create destination markers.
        for (const destination of destinations) {
            const existingMarker = destinationMarkersRef.current.get(
                destination.id,
            );

            if (!destination.point) {
                existingMarker?.remove();
                destinationMarkersRef.current.delete(destination.id);
                continue;
            }

            if (existingMarker) {
                existingMarker.setLngLat([
                    destination.point.lng,
                    destination.point.lat,
                ]);

                existingMarker
                    .getElement()
                    .style.setProperty(
                        "background-color",
                        context.endPinColor,
                    );
            } else {
                destinationMarkersRef.current.set(
                    destination.id,
                    createMapMarker(
                        map,
                        destination.point,
                        context.endPinColor,
                    ),
                );
            }
        }
    }, [
        map,
        startPoint,
        context.startPinColor,
        destinations,
        context.endPinColor,
    ]);

    // Clean up markers when the map changes or this component unmounts.
    useEffect(() => {
        return () => {
            startMarkerRef.current?.remove();
            startMarkerRef.current = null;

            for (const marker of destinationMarkersRef.current.values()) {
                marker.remove();
            }

            destinationMarkersRef.current.clear();
        };
    }, [map]);


    // Update the route color immediately when settings change.
    useEffect(() => {
        if (!map) return;

        if (map.getLayer("planned-route-line")) {
            map.setPaintProperty(
                "planned-route-line",
                "line-color",
                context.routeColor,
            );
        }
    }, [map, context.routeColor]);



    // Select a location by clicking the map
    useEffect(() => {
        if (!map) return;

        function handleMapClick(event: MapMouseEvent) {
            const point: Point = {
                lng: event.lngLat.lng,
                lat: event.lngLat.lat,
            };

            if (activeField === "start") {
                setStartPoint(point);
                setStartQuery(`${point.lat.toFixed(context.locationDecimals)}, ${point.lng.toFixed(context.locationDecimals)}`);
                return;
            }

            setDestinations((current) =>
                current.map((destination) =>
                    destination.id === activeField
                        ? {
                            ...destination,
                            point,
                            query: `${point.lat.toFixed(context.locationDecimals)}, ${point.lng.toFixed(context.locationDecimals)}`,
                            results: [],
                        }
                        : destination,
                ),
            );
        }

        map.on("click", handleMapClick);

        return () => {map.off("click", handleMapClick)};
    }, [map, activeField]);

    // handle autocomplete when typing
    useEffect(() => {
        const timeouts: number[] = [];

        function search(
            query: string,
            point: Point | null,
            onResults: (results: SearchResult[]) => void,
        ) {
            if (!query.trim() || point) {
            onResults([]);
            return;
            }
            
            // set to 400 to reduce api calls 
            const timeout = window.setTimeout(async () => {
            try {
                onResults(await searchLocation(query));
            } catch (error) {
                console.error("Location search failed:", error);
            }
            }, 400);

            timeouts.push(timeout);
        }

        search(startQuery, startPoint, setStartResults);

        destinations.forEach((destination) => {
            search(destination.query, destination.point, (results) => {
            setDestinations((current) =>
                current.map((item) =>
                item.id === destination.id &&
                item.query === destination.query
                    ? { ...item, results }
                    : item,
                ),
            );
            });
        });

        return () => {
            timeouts.forEach((timeout) => window.clearTimeout(timeout));
        };
    }, [
        startQuery,
        startPoint,
        destinations.map((d) => `${d.id}:${d.query}:${Boolean(d.point)}`).join("|"),
    ]);


    function selectSearchResult(field: "start" | number, result: SearchResult) {
        const point: Point = {
            lng: Number(result.lon),
            lat: Number(result.lat),
        };

        if (field === "start") {
            setStartPoint(point);
            setStartQuery(result.display_name);
            setStartResults([]);
        } else {
            setDestinations((current) =>
                current.map((destination) =>
                    destination.id === field
                        ? {
                            ...destination,
                            point,
                            query: result.display_name,
                            results: [],
                        }
                        : destination,
                ),
            );
        }

        map?.flyTo({
            center: [point.lng, point.lat],
            zoom: 10,
            duration: 1000,
        });
    }

    function addDestination() {
        const id = nextDestinationIdRef.current++;

        setDestinations((current) => [
            ...current,
            {
                id,
                point: null,
                query: "",
                results: [],
            },
        ]);

        setActiveField(id);
    }

    function removeDestination(id: number) {
        setDestinations((current) =>
            current.filter(
                (destination) =>
                    destination.id !== id,
            ),
        );

        if (activeField === id) {
            setActiveField("start");
        }

        clearRoute();
    }

    function updateDestinationQuery(
        id: number,
        query: string,
    ) {
        setDestinations((current) =>
            current.map((destination) =>
                destination.id === id
                    ? {
                          ...destination,
                          query,
                          point: null,
                          results: [],
                      }
                    : destination,
            ),
        );

        setActiveField(id);
        setDistance(null);
    }

    async function calculateRoute() {
        if (!map || !startPoint) return;

        const validDestinations = destinations.filter(
            (destination) => destination.point !== null,
        );

        if (validDestinations.length === 0) return;

        setLoadingRoute(true);

        try {
            const points: Point[] = [
            startPoint,
            ...validDestinations.map((destination) => destination.point!),
            ];

            const route = await requestRoute(points);

            setDistance(route.distance);

            const sourceId = "planned-route";
            const routeData = {
            type: "Feature" as const,
            properties: {},
            geometry: route.geometry,
            };

            if (map.getSource(sourceId)) {
            (map.getSource(sourceId) as GeoJSONSource).setData(routeData);
            } else {
            map.addSource(sourceId, {
                type: "geojson",
                data: routeData,
            });

            map.addLayer({
                id: "planned-route-line",
                type: "line",
                source: sourceId,
                paint: {
                "line-color": context.routeColor,
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

        if (map.getLayer("planned-route-line")) {
            map.removeLayer("planned-route-line");
        }

        if (map.getSource("planned-route")) {
            map.removeSource("planned-route");
        }

        setDistance(null);
    }

    function clearAll() {
        clearRoute();

        setStartPoint(null);
        setStartQuery("");
        setStartResults([]);

        setDestinations([
            {
                id: nextDestinationIdRef.current++,
                point: null,
                query: "",
                results: [],
            },
        ]);

        setActiveField("start");
    }

    function handleClose() {
        clearAll();
        onClose();
    }

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
                            setStartQuery(
                                event.target.value,
                            );
                            setStartPoint(null);
                            setActiveField("start");
                            setDistance(null);
                        }}
                        onFocus={() => {
                            setActiveField("start");
                        }}
                        placeholder="Start location"
                    />

                    {startResults.length > 0 && (
                        <div>
                            {startResults.length > 0 && (
                            <div className="map-route-results">
                                {startResults.map((result, index) => (
                                <button
                                    type="button"
                                    key={`${result.lat}-${result.lon}-${index}`}
                                    onClick={() => selectSearchResult("start", result)}
                                >
                                    {result.display_name}
                                </button>
                                ))}
                            </div>
                            )}
                        </div>
                    )}
                    
                </div>

                {destinations.map(
                    (destination, index) => (
                        <div
                            className="map-route-field"
                            key={destination.id}
                        >
                            <div className="map-route-field-header">
                                <label
                                    htmlFor={`route-destination-${destination.id}`}
                                >
                                    Destination{" "}
                                    {index + 1}
                                </label>

                                {destinations.length >
                                    1 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeDestination(
                                                destination.id,
                                            )
                                        }
                                        aria-label={`Remove destination ${index + 1}`}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>

                            <input
                                id={`route-destination-${destination.id}`}
                                value={
                                    destination.query
                                }
                                onChange={(event) =>
                                    updateDestinationQuery(
                                        destination.id,
                                        event.target.value,
                                    )
                                }
                                onFocus={() => {
                                    setActiveField(
                                        destination.id,
                                    );
                                }}
                                placeholder={`Destination ${index + 1}`}
                            />

                            {destination.results.length > 0 && (
                            <div className="map-route-results">
                                {destination.results.map((result, resultIndex) => (
                                <button
                                    type="button"
                                    key={`${result.lat}-${result.lon}-${resultIndex}`}
                                    onClick={() =>
                                    selectSearchResult(destination.id, result)
                                    }
                                >
                                    {result.display_name}
                                </button>
                                ))}
                            </div>
                            )}
                        </div>
                    ),
                )}

                <button
                    type="button"
                    onClick={addDestination}
                >
                    + Add destination
                </button>
            </div>

            {distance !== null && (
                <div>
                    Distance:{" "}
                    {formatDistance(
                        distance,
                        context.units,
                    )}
                </div>
            )}

            <div className="map-route-actions">
                <button
                    type="button"
                    onClick={calculateRoute}
                    disabled={
                        !startPoint ||
                        destinations.every(
                            (destination) =>
                                !destination.point,
                        ) ||
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
                    onClick={handleClose}
                    aria-label="Close route planner"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default MapRoutePlanner;