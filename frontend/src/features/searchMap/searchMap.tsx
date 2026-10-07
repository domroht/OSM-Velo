import { useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";

import search from "../../assets/icons/search.svg";
import "./searchMap.css";

type MapSearchProps = {
  map: MapLibreMap | null;
  onClose: () => void;
};

type SearchResult = {
  lat: string;
  lon: string;
  display_name: string;
};

function MapSearch({ map, onClose }: MapSearchProps) {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
      zoom: 10,
      duration: 1500,
    });

    onClose();
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Escape") {
      onClose();
      return;
    }

    if (event.key === "Enter" && results.length > 0) {
      selectLocation(results[0]);
    }
  }

  return (
    <div className="map-search">
      <div className="map-search-input-wrapper">
        <img
          src={search}
          alt=""
          className="map-search-icon"
        />

        <input
          ref={inputRef}
          type="text"
          placeholder="Search location..."
          value={searchText}
          onChange={(event) =>
            setSearchText(event.target.value)
          }
          onKeyDown={handleKeyDown}
        />
      </div>

      {results.length > 0 && (
        <div className="map-search-results">
          {results.map((result) => (
            <button
              key={`${result.lat}-${result.lon}`}
              className="map-search-result"
              onClick={() => selectLocation(result)}
            >
              {result.display_name}
            </button>
          ))}
        </div>
      )}

      <button
        className="map-search-close"
        onClick={onClose}
      >
        Cancel
      </button>
    </div>
  );
}

export default MapSearch;