import { useSettings } from "../../context/SettingContext";

function UISettings() {
  const { context, setContext } = useSettings();

  return (
    <section>
      <h1>Map Settings</h1>

      <label>
        <p>Distance units </p>
        <select
          value={context.units}
          onChange={(event) => setContext({units: event.target.value as "metric" | "imperial"})}
        >
          <option value="metric">Kilometers</option>
          <option value="imperial">Miles</option>
        </select>
      </label>

    <label>
      <p>Show map controls</p>
      <input
        type="checkbox"
        checked={context.showMapControls}
        onChange={(event) => setContext({showMapControls: event.target.checked as true | false})}
      />
    </label>

    </section>
  );
}

export default UISettings;