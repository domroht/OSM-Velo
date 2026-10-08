import { NavLink } from "react-router";
import "./Navbar.css";

import sun from "../../assets/icons/sun.svg";
import user from "../../assets/icons/user.svg"

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
          <img src={sun}/>
        </button>

        <button className="navbar-language">
          EN
        </button>

        <NavLink to="profile" end>
          <img src={user}/>
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;