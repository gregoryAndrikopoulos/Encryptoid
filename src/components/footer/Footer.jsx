import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer" role="contentinfo" data-testid="footer.root">
      <div className="footer-content" data-testid="footer.content">
        <p data-testid="footer.text">
          &copy; {new Date().getFullYear()} Encryptoid. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
