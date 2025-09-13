import "./Header.css";

const Header = () => {
  return (
    <header id="top" className="header" role="banner" data-testid="header.root">
      <img
        src="/banner.png"
        alt="Encryptoid logo"
        className="logo"
        data-testid="header.logo"
      />
    </header>
  );
};

export default Header;
