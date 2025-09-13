import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import NavSwitcher from "./components/navigation/shared/NavSwitcher.jsx";
import { Routes } from "react-router-dom";

const App = () => {
  return (
    <main>
      <Header />
      <NavSwitcher />
      <Routes></Routes>
      <Footer />
    </main>
  );
};

export default App;
