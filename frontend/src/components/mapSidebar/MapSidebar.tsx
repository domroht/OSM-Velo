import { useState } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import MapSearch from "../mapSearch/MapSearch";
import "./MapSidebar.css";

import panel_left_open from "../../assets/icons/panel-left-open.svg";
import panel_left_close from "../../assets/icons/panel-left-close.svg";
import search from "../../assets/icons/search.svg";

type MapSidebarProps = {
  map: MapLibreMap | null;
};

function MapSidebar({ map }: MapSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  function closeTool() {
    setActiveTool(null);
  }

  return (
    <aside
      className={`map-sidebar ${
        collapsed ? "collapsed" : ""
      }`}
    >
      <div className="map-sidebar-header">
        {!collapsed && (
          <span className="map-sidebar-title">
            Tools
          </span>
        )}

        <button
          className="map-sidebar-toggle"
          onClick={() =>
            setCollapsed((current) => !current)
          }
          aria-label={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          {collapsed ? (
            <img
              src={panel_left_open}
              alt=""
            />
          ) : (
            <img
              src={panel_left_close}
              alt=""
            />
          )}
        </button>
      </div>

      <div className="map-sidebar-body">
        {activeTool === "search" ? (
          <MapSearch
            map={map}
            onClose={closeTool}
          />
        ) : (
          <button
            className="map-sidebar-tool"
            onClick={() => setActiveTool("search")}
          >
            <span className="map-sidebar-tool-icon">
              <img src={search} alt="" />
            </span>

            {!collapsed && (
              <span className="map-sidebar-tool-label">
                Search location
              </span>
            )}
          </button>
        )}
      </div>
    </aside>
  );
}

export default MapSidebar;