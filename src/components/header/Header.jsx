import "./Header.css";

const Header = () => {
  return (
    <header id="top" className="header" data-testid="header.root">
      <img
        src="/logo.png"
        alt="Encryptoid logo"
        width="1024"
        height="1024"
        decoding="async"
        fetchpriority="high"
        className="logo"
        data-testid="header.logo"
      />
    </header>
  );
};

export default Header;
