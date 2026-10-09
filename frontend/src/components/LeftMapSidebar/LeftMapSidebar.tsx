import { useState } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";

import { useTranslation } from "../../context/translations/Translations";

import RoutePlanner from "./RoutePlanner/RoutePlanner";

import panel_left_open from "../../assets/icons/panel-left-open.svg";
import panel_left_close from "../../assets/icons/panel-left-close.svg";
import route from "../../assets/icons/route.svg";
import map_plus from "../../assets/icons/map-plus.svg"
import map_pin_plus from "../../assets/icons/map-pin-plus.svg"

import "./LeftMapSidebar.css";

type MapSidebarProps = {
    map: MapLibreMap | null;
};

function LeftMapSidebar({ map }: MapSidebarProps) {
    const [collapsed, setCollapsed] = useState(true);
    const [activeTool, setActiveTool] = useState<string | null>(null);

    const t = useTranslation();

    function closeTool() {
        setActiveTool(null);
    }

    return (
        <aside className={`left-map-sidebar ${collapsed ? "collapsed" : ""}`}>
            <div className="left-map-sidebar-header">
                <button
                    className="left-map-sidebar-toggle"
                    onClick={() => {setCollapsed((current) => !current); closeTool();}}
                >
                    
                    {collapsed ? (<img src={panel_left_open} alt="" /> ) : ( <img src={panel_left_close} alt="" />)}

                </button>
            </div>

            <div className="left-map-sidebar-body">
                {activeTool === "route" ? (
                    <RoutePlanner
                        map={map}
                        onClose={closeTool}
                    />
                ) : (
                    <>
                        <button
                            className="left-map-sidebar-tool"
                            onClick={() => {
                                if (collapsed) {
                                    setCollapsed(false);
                                    return;
                                }

                                setActiveTool("route");
                            }}
                        >
                            <span className="left-map-sidebar-tool-icon">
                                <img src={route} alt="" />
                            </span>

                            {!collapsed && (
                                <span className="left-map-sidebar-tool-label">
                                    {t.map_sidebar.route}
                                </span>
                            )}

                            
                        </button>

                        <button
                            className="left-map-sidebar-tool"
                        >
                            <span className="left-map-sidebar-tool-icon">
                                <img src={map_plus} alt="" />
                            </span>

                            {!collapsed && (
                                <span className="left-map-sidebar-tool-label">
                                    {t.map_sidebar.saved_routes}
                                </span>
                            )}

                            
                        </button>

                        <button
                            className="left-map-sidebar-tool"
                        >
                            <span className="left-map-sidebar-tool-icon">
                                <img src={map_pin_plus} alt="" />
                            </span>

                            {!collapsed && (
                                <span className="left-map-sidebar-tool-label">
                                    {t.map_sidebar.saved_locations}
                                </span>
                            )}

                            
                        </button>
                    </>
                )}
            </div>
        </aside>
    );
}

export default LeftMapSidebar;