import { useState, useEffect } from "react";
import NavDesktop from "./../desktop/NavDesktop";
import NavMobile from "./../mobile/NavMobile";

const NavSwitcher = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 1024);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div data-testid="nav-root">
      {isMobile ? <NavMobile /> : <NavDesktop />}
    </div>
  );
};

export default NavSwitcher;
