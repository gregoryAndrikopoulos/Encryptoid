import { Link } from "react-router-dom";
import AppLink from "../shared/AppLink.jsx";
import "./NavDesktop.css";

const NavDesktop = () => {
  return (
    <nav className="nav-desktop" data-testid="nav-desktop">
      <Link to="/" className="nav-desktop-site-title" data-testid="nav-title">
        <img
          src="/logo-nav.png"
          alt="Encryptoid logo"
          className="nav-logo"
          data-testid="nav-logo"
        />
      </Link>
      <ul data-testid="nav-desktop-list">
        <AppLink to="/Encryption" testId="navlink-encryption">
          Encryption
        </AppLink>
        <AppLink to="/Decryption" testId="navlink-decryption">
          Decryption
        </AppLink>
      </ul>
    </nav>
  );
};

export default NavDesktop;
