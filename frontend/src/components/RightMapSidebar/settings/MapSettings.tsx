import { useSettings } from "../../../context/SettingContext";
import { useTranslation } from "../../../context/translations/Translations";

import "./MapSettings.css";

function MapSettings() {
    const { context, setContext } = useSettings();
    const t = useTranslation();

    const handleColorChange = (
        key: "routeColor" | "startPinColor" | "endPinColor",
        color: string
    ) => {
        setContext({ [key]: color });
    };

    return (
        <section className="settings">
            <div className="settings-header">
                <h1>{t.map_settings.title}</h1>
            </div>

            <div className="settings-card">
                <h2>{t.map_settings.behavior}</h2>

                <div className="setting-row">
                    <div className="setting-info">
                        <span className="setting-title">
                            {t.map_settings.units}
                        </span>
                    </div>

                    <select
                        className="settings-select"
                        value={context.units}
                        onChange={(event) =>
                            setContext({
                                units: event.target.value as
                                    | "metric"
                                    | "imperial",
                            })
                        }
                    >
                        <option value="metric">
                            {t.map_settings.kilometers}
                        </option>
                        <option value="imperial">
                            {t.map_settings.miles}
                        </option>
                    </select>
                </div>

                <div className="setting-row">
                    <div className="setting-info">
                        <span className="setting-title">
                            {t.map_settings.map_controls}
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

            <div className="settings-card">
                <h2>{t.map_settings.appearance}</h2>

                <div className="color-setting">
                    <div className="setting-info">
                        <span className="setting-title">
                            {t.map_settings.route_color}
                        </span>
                    </div>

                    <label className="color-picker">
                        <input
                            type="color"
                            value={context.routeColor}
                            onChange={(event) =>
                                handleColorChange(
                                    "routeColor",
                                    event.target.value
                                )
                            }
                        />
                        <span>{context.routeColor}</span>
                    </label>
                </div>

                <div className="color-setting">
                    <div className="setting-info">
                        <span className="setting-title">
                            {t.map_settings.start_pin}
                        </span>
                    </div>

                    <label className="color-picker">
                        <input
                            type="color"
                            value={context.startPinColor}
                            onChange={(event) =>
                                handleColorChange(
                                    "startPinColor",
                                    event.target.value
                                )
                            }
                        />
                        <span>{context.startPinColor}</span>
                    </label>
                </div>

                <div className="color-setting">
                    <div className="setting-info">
                        <span className="setting-title">
                            {t.map_settings.end_pin}
                        </span>
                    </div>

                    <label className="color-picker">
                        <input
                            type="color"
                            value={context.endPinColor}
                            onChange={(event) =>
                                handleColorChange(
                                    "endPinColor",
                                    event.target.value
                                )
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
