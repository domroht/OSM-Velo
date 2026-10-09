import type { Point, SearchResult } from "./routeTypes";


export async function searchLocation(query: string): Promise<SearchResult[]> {
    
    if (!query.trim()) return [];
    
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=5`);

    if (!response.ok) throw new Error(`Location search failed: ${response.status}`);

    return (await response.json()) as SearchResult[];
}


export async function calculateRoute( points: Point[]) {

    if (points.length < 2) throw new Error("At least two points are required to calculate a route.");

    const coordinates = points.map((point) => `${point.lng},${point.lat}`).join(";");

    const response = await fetch(`https://routing.openstreetmap.de/routed-bike/route/v1/driving/${coordinates}?overview=full&geometries=geojson`);

    if (!response.ok) throw new Error(`Routing request failed: ${response.status}`);

    const data = await response.json();

    if (!data.routes?.length) throw new Error("No route found");

    return data.routes[0];
}
