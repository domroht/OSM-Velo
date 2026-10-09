import { useState } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";

import LeftMapSidebar from "../components/LeftMapSidebar/LeftMapSidebar";
import RightMapSidebar from "../components/RightMapSidebar/RightMapSideBar";
import MapView from "../components/map/MapView";

import "./HomePage.css";

function HomePage() {
const [map, setMap] = useState<MapLibreMap | null>(null);
const [rightCollapsed, setRightCollapsed] = useState(true);


return (
    <div className={`map-page ${rightCollapsed ? "right-collapsed" : "right-expanded"}`}>
        <RightMapSidebar
            collapsed={rightCollapsed}
            setCollapsed={setRightCollapsed}
        />

        <MapView onMapReady={setMap} />

        <LeftMapSidebar map={map} />
    </div>
);


}

export default HomePage;
