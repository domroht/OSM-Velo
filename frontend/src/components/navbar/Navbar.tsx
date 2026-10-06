import { NavLink } from "react-router";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <NavLink to="/" className="navbar-logo">
          OSM-Velo
        </NavLink>
      </div>

      <div className="navbar-center">
        <NavLink to="/" end>
          Map
        </NavLink>
      </div>

      <div className="navbar-right">
        <button className="navbar-icon">
          Mode
        </button>

        <button className="navbar-language">
          Sprog
        </button>

        <button className="navbar-profile">
          Profil
        </button>
      </div>
    </nav>
  );
}

export default Navbar;