import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import Nav from "./components/navigation/shared/Nav.jsx";
import Encryption from "./components/pages/encryption-decryption/components/Encryption.jsx";
import Decryption from "./components/pages/encryption-decryption/components/Decryption.jsx";
import Home from "./components/pages/home/Home.jsx";
import { Route, Routes } from "react-router-dom";

const App = () => {
  return (
    <main>
      <Header />
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/encryption" element={<Encryption />} />
        <Route path="/decryption" element={<Decryption />} />
      </Routes>
      <Footer />
    </main>
  );
};

export default App;
