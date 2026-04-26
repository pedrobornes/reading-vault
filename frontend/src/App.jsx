import React, { useEffect } from "react"; // Añadido useEffect
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from './components/ScrollToTop';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// Importación de AOS (Animaciones)
import AOS from 'aos';
import 'aos/dist/aos.css';

import "./App.css";

// Importación de componentes
import Header from "./components/Header";
import Footer from "./components/Footer";

// Importación de páginas
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import BuscadorLibros from "./pages/BuscadorLibros";
import Home from './pages/Home';

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1000, 
      once: true,
      easing: 'ease-in-out',
    });
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Header />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/buscador" element={<BuscadorLibros />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </main>

      <Footer />
    </Router>
  );
}

export default App;