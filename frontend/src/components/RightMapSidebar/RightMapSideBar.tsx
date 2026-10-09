import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import MapSettings from "./settings/MapSettings";

import panel_right_open from "../../assets/icons/panel-right-open.svg";
import panel_right_close from "../../assets/icons/panel-right-close.svg";

import "./RightMapSidebar.css";

type MapSidebarProps = {
collapsed: boolean;
setCollapsed: Dispatch<SetStateAction<boolean>>;
};

function RightMapSidebar({ collapsed, setCollapsed }: MapSidebarProps) {
const [activeTool, setActiveTool] = useState<string | null>(null);


function closeTool() {
    setActiveTool(null);
}

return (
    <aside className={`right-map-sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="right-map-sidebar-header">
            <button
                className="right-map-sidebar-toggle"
                onClick={() => {
                    setCollapsed((current) => !current);
                    closeTool();
                }}
                aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
                aria-expanded={!collapsed}
            >
                {collapsed ? (
                    <img src={panel_right_open} alt="" />
                ) : (
                    <img src={panel_right_close} alt="" />
                )}
            </button>
        </div>

        {!collapsed && (
            <div className="right-map-sidebar-body">
                <MapSettings />
            </div>
        )}
    </aside>
);


}

export default RightMapSidebar;
