import { useEffect, useState } from "react";
import "./MapSidebar.css";
import type { Map as MapLibreMap } from "maplibre-gl";

import panel_left_open from "../../assets/icons/panel-left-open.svg";
import panel_left_close from "../../assets/icons/panel-left-close.svg";
import search from "../../assets/icons/search.svg";

type MapSidebarProps = {
  map: MapLibreMap | null;
};

type SearchResult = {
  lat: string;
  lon: string;
  display_name: string;
};

function MapSidebar({ map }: MapSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!searchText.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
            searchText,
          )}&limit=5`,
        );

        if (!response.ok) {
          throw new Error("Search request failed");
        }

        const data: SearchResult[] = await response.json();

        setResults(data);
      } catch (error) {
        console.error("Search failed:", error);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchText]);

  function selectLocation(result: SearchResult) {
    if (!map) return;

    map.flyTo({
      center: [
        Number(result.lon),
        Number(result.lat),
      ],
      zoom: 15,
      duration: 1500,
    });

    setSearchText(result.display_name);
    setResults([]);
  }

  function handleSearchKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key !== "Enter") return;

    if (results.length > 0) {
      selectLocation(results[0]);
    }
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
        <div className="map-sidebar-search">
          <button
            className="map-sidebar-search-button"
            type="button"
            onClick={() => {
              if (collapsed) {
                setCollapsed(false);
              }
            }}
          >
            <img
              src={search}
              alt="Search"
            />
          </button>

          {!collapsed && (
            <input
              type="text"
              placeholder="Search location"
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
              onKeyDown={handleSearchKeyDown}
            />
          )}
        </div>

        {!collapsed && results.length > 0 && (
          <div className="map-sidebar-results">
            {results.map((result) => (
              <button
                key={`${result.lat}-${result.lon}`}
                className="map-sidebar-result"
                onClick={() =>
                  selectLocation(result)
                }
              >
                {result.display_name}
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

export default MapSidebar;