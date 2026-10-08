import { useState } from "react";
import UISettings from "../components/settings/MapSettings";
import "./ProfilePage.css";

type Setting = "ui";

function ProfilePage() {
  const [activeSetting, setActiveSetting] = useState<Setting>("ui");

  return (
    <div className="profile-page">
      <aside className="profile-sidebar">
        <h2>Settings</h2>

        <button
          className={activeSetting === "ui" ? "active" : ""}
          onClick={() => setActiveSetting("ui")}
        >
          Map
        </button>
      </aside>

      <main className="profile-content">
        {activeSetting === "ui" && <UISettings />}
      </main>
    </div>
  );
}

export default ProfilePage;