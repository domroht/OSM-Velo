import { useState } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";

import MapSidebar from "../components/mapSidebar/MapSidebar";
import MapView from "../features/map/MapView";

import "./HomePage.css";

function HomePage() {
  const [map, setMap] = useState<MapLibreMap | null>(null);

  return (
    <div className="map-page">
      <MapView onMapReady={setMap} />
      <MapSidebar map={map} />
    </div>
  );
}

export default HomePage;