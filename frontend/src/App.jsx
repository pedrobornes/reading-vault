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

function App() {
  useEffect(() => {
    // Inicialización AOS
    AOS.init({
      duration: 1000, 
      once: true,
      easing: 'ease-in-out',
    });

    // --- LÓGICA DE SUSURRO (Persistente) ---
    const reproducirSusurro = () => {
      const proximoSusurro = localStorage.getItem('proximoSusurro');
      const ahora = Date.now();

      if (proximoSusurro && ahora < proximoSusurro) {
        const tiempoRestante = proximoSusurro - ahora;
        setTimeout(reproducirSusurro, tiempoRestante);
        return;
      }

      const audio = new Audio('/media/susurro.mp3');
      audio.volume = 0.6;
      
      audio.play()
        .then(() => {
          const delay = Math.random() * (20 * 60 * 1000 - 60 * 1000) + 60 * 1000;
          localStorage.setItem('proximoSusurro', Date.now() + delay);
          setTimeout(reproducirSusurro, delay);
        })
        .catch(() => setTimeout(reproducirSusurro, 5000));
    };

    // --- LÓGICA DE SCREAMER (Bloqueo Total) ---
    const mostrarScreamer = () => {
      const divSusto = document.createElement('div');
      divSusto.id = "screamer-overlay";
      divSusto.style = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:black; z-index:200000; display:flex; align-items:center; justify-content:center; cursor:none; pointer-events:all; user-select:none;";
      
      divSusto.innerHTML = `
        <video id="video-screamer" src="/media/sustito.mp4" 
               style="width:100%; height:100%; object-fit:cover;" 
               disablePictureInPicture 
               controlsList="nodownload nofullscreen noremoteplayback">
        </video>
      `;

      const bloquearEntrada = (e) => {
        e.stopImmediatePropagation();
        e.preventDefault();
        return false;
      };

      window.addEventListener('keydown', bloquearEntrada, true);
      window.addEventListener('contextmenu', bloquearEntrada, true);
      window.addEventListener('keyup', bloquearEntrada, true);

      document.body.appendChild(divSusto);
      const video = document.getElementById('video-screamer');

      const forzarFullscreen = () => {
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
          if (divSusto.requestFullscreen) divSusto.requestFullscreen();
          else if (divSusto.webkitRequestFullscreen) divSusto.webkitRequestFullscreen();
        }
      };
      document.addEventListener('fullscreenchange', forzarFullscreen);

      if (divSusto.requestFullscreen) divSusto.requestFullscreen();
      else if (divSusto.webkitRequestFullscreen) divSusto.webkitRequestFullscreen();

      video.volume = 0.5;
      video.play();

      video.onended = () => {
        document.removeEventListener('fullscreenchange', forzarFullscreen);
        if (document.fullscreenElement) document.exitFullscreen();
        divSusto.remove();
        window.removeEventListener('keydown', bloquearEntrada, true);
        window.removeEventListener('contextmenu', bloquearEntrada, true);
        window.removeEventListener('keyup', bloquearEntrada, true);
      };

      setTimeout(() => {
        if (document.getElementById('screamer-overlay')) {
          document.removeEventListener('fullscreenchange', forzarFullscreen);
          divSusto.remove();
          window.removeEventListener('keydown', bloquearEntrada, true);
          window.removeEventListener('contextmenu', bloquearEntrada, true);
          if (document.fullscreenElement) document.exitFullscreen();
        }
      }, 60000);
    };

    // --- MANEJAR CLICK CON COOLDOWN DE 2 HORAS ---
    const manejarBromaClick = (e) => {
      const ultimoScreamer = localStorage.getItem('ultimoScreamer');
      const ahora = Date.now();
      const dosHoras = 2 * 60 * 60 * 1000;

      // Si ya saltó hace menos de 2 horas, no hacemos nada
      if (ultimoScreamer && (ahora - ultimoScreamer) < dosHoras) {
        return;
      }

      if (Math.random() < 0.003) { // Probabilidad del 0.3%
        e.preventDefault();
        e.stopPropagation();
        
        // Guardamos el momento del susto para activar el enfriamiento
        localStorage.setItem('ultimoScreamer', Date.now());
        mostrarScreamer();
      }
    };

    reproducirSusurro();
    document.addEventListener('click', manejarBromaClick, true);

    return () => {
      document.removeEventListener('click', manejarBromaClick, true);
    };
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
          <Route path="/perfilUsuario" element={<PerfilUsuario />} />
          <Route path="/ajustesCuenta" element={<AjustesCuenta />} />
          <Route path="/reto" element={<Reto />} />
          <Route path="/libro/:isbn" element={<DetalleLibro />} />
        </Routes>
      </main>
      <Footer />
      <BotonSubir />
    </Router>
  );
}

export default App;