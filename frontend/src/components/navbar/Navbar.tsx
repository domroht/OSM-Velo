import { NavLink } from "react-router";
import "./Navbar.css";

import { useSettings } from "../../context/SettingContext";
import user from "../../assets/icons/user.svg"

function Navbar() {
  const {context, setContext} = useSettings();
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <NavLink to="/" className="navbar-logo">
          OSM-Velo
        </NavLink>
      </div>

      <div className="navbar-center">
        <NavLink to="/" end>
          {context.lang === "EN" ? "Map" : "Kort"}
        </NavLink>
      </div>

      <div className="navbar-right">

      <button
        className="navbar-language"
        onClick={() => setContext({ lang: context.lang === "EN" ? "DA" : "EN" })}
      >
        {context.lang}
      </button>

        <NavLink to="profile" end>
          <img src={user}/>
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;