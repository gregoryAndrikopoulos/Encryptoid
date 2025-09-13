import AppLink from "../shared/AppLink.jsx";
import { AiOutlineHome } from "react-icons/ai";
import {
  MdOutlineEnhancedEncryption,
  MdOutlineNoEncryptionGmailerrorred,
} from "react-icons/md";
import "./NavMobile.css";

const NavMobile = () => {
  return (
    <nav className="nav-mobile" data-testid="nav-mobile">
      <AppLink to="/" className="nav-mobile-link" testId="navlink-home">
        <AiOutlineHome aria-label="Home" />
      </AppLink>
      <AppLink
        to="/Encryption"
        className="nav-mobile-link"
        testId="navlink-encryption"
      >
        <MdOutlineEnhancedEncryption aria-label="Encryption" />
      </AppLink>
      <AppLink
        to="/Decryption"
        className="nav-mobile-link"
        testId="navlink-decryption"
      >
        <MdOutlineNoEncryptionGmailerrorred aria-label="Decryption" />
      </AppLink>
    </nav>
  );
};

export default NavMobile;
