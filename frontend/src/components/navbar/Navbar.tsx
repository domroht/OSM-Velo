import { NavLink } from "react-router";
import "./Navbar.css";

import { useSettings } from "../../context/SettingContext";
import { useTranslation } from "../../context/translations/Translations";

import user from "../../assets/icons/user.svg";

function Navbar() {
    const { context, setContext } = useSettings();
    const t = useTranslation();

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <NavLink to="/" end>
                    {t.navbar.title}
                </NavLink>
            </div>

            <div className="navbar-center">
                <NavLink to="/" end>
                    {t.navbar.map}
                </NavLink>
            </div>

            <div className="navbar-right">

                <button onClick={() => setContext({lang: context.lang === "EN" ? "DA" : "EN"})}>
                    {context.lang}
                </button>

                <NavLink to="profile" end>
                    <img src={user} alt="" />
                </NavLink>

            </div>
        </nav>
    );
}

export default Navbar;