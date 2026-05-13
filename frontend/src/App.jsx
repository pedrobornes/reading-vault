import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from './components/ScrollToTop';
import BotonSubir from './components/BotonSubir';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// Animaciones AOS
import AOS from 'aos';
import 'aos/dist/aos.css';

import "./App.css";

// Componentes globales
import Header from "./components/Header";
import Footer from "./components/Footer";

// Páginas
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import BuscadorLibros from "./pages/BuscadorLibros";
import Home from './pages/Home';
import PerfilUsuario from "./pages/PerfilUsuario";
import AjustesCuenta from "./pages/AjustesCuenta";
import DetalleLibro from "./pages/DetalleLibro";
import Comunidad from "./pages/Comunidad";
import Reto from "./pages/Reto";
import MisLibros from "./pages/MisLibros";
import ListaAmigos from "./pages/ListaAmigos";

function App() {
  useEffect(() => {
    // Inicialización de animaciones AOS
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
          <Route path="/comunidad" element={<Comunidad />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/buscador" element={<BuscadorLibros />} />
          <Route path="/home" element={<Home />} />
          <Route path="/perfil/:idUsuario" element={<PerfilUsuario />} />
          <Route path="/ajustesCuenta" element={<AjustesCuenta />} />
          <Route path="/reto" element={<Reto />} />
          <Route path="mislibros" element={<MisLibros/>} />
          <Route path="/libro/:isbn" element={<DetalleLibro />} />
          <Route path="/mis-amigos" element={<ListaAmigos />} />
          <Route path="/usuarios/:idUsuario/amigos" element={<ListaAmigos />} />
          <Route path="*" element={<div style={{ padding: '50px', textAlign: 'center' }}><h2>404 - Página no encontrada</h2></div>} />
        </Routes>
      </main>
      <Footer />
      <BotonSubir />
    </Router>
  );
}

export default App;