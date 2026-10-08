import { useSettings } from "../../context/SettingContext";
import "./MapSettings.css";

function MapSettings() {
  const { context, setContext } = useSettings();

  return (
    <section className="settings">
      <div className="settings-header">
        <h1>Map Settings</h1>
        <p>Customize how your map looks and behaves.</p>
      </div>

      {/* Map behaviour */}
      <div className="settings-card">
        <h2>Map behaviour</h2>

        <div className="setting-row">
          <div className="setting-info">
            <span className="setting-title">Distance units</span>
            <span className="setting-description">
              Choose how distances are displayed.
            </span>
          </div>

          <select
            className="settings-select"
            value={context.units}
            onChange={(event) =>
              setContext({
                units: event.target.value as "metric" | "imperial",
              })
            }
          >
            <option value="metric">Kilometers</option>
            <option value="imperial">Miles</option>
          </select>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <span className="setting-title">Map controls</span>
            <span className="setting-description">
              Show zoom and other map controls.
            </span>
          </div>

          <label className="switch">
            <input
              type="checkbox"
              checked={context.showMapControls}
              onChange={(event) =>
                setContext({
                  showMapControls: event.target.checked,
                })
              }
            />
            <span className="slider" />
          </label>
        </div>
      </div>

      {/* Map appearance */}
      <div className="settings-card">
        <h2>Map appearance</h2>

        <div className="color-setting">
          <div className="setting-info">
            <span className="setting-title">Route color</span>
            <span className="setting-description">
              Color used for the route line.
            </span>
          </div>

          <label className="color-picker">
            <input
              type="color"
              value={context.routeColor}
              onChange={(event) =>
                setContext({
                  routeColor: event.target.value,
                })
              }
            />
            <span>{context.routeColor}</span>
          </label>
        </div>

        <div className="color-setting">
          <div className="setting-info">
            <span className="setting-title">Start pin</span>
            <span className="setting-description">
              Color of the starting location.
            </span>
          </div>

          <label className="color-picker">
            <input
              type="color"
              value={context.startPinColor}
              onChange={(event) =>
                setContext({
                  startPinColor: event.target.value,
                })
              }
            />
            <span>{context.startPinColor}</span>
          </label>
        </div>

        <div className="color-setting">
          <div className="setting-info">
            <span className="setting-title">End pin</span>
            <span className="setting-description">
              Color of the destination.
            </span>
          </div>

          <label className="color-picker">
            <input
              type="color"
              value={context.endPinColor}
              onChange={(event) =>
                setContext({
                  endPinColor: event.target.value,
                })
              }
            />
            <span>{context.endPinColor}</span>
          </label>
        </div>
      </div>
    </section>
  );
}

export default MapSettings;