import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";

// Importación de componentes
import Header from "./components/Header";
import Footer from "./components/Footer";

// Importación de páginas
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import BuscadorLibros from "./pages/BuscadorLibros";
import Home from './pages/Home'
import PerfilUsuario from "./pages/PerfilUsuario";

function App() {
  return (
    <Router>
      <Header />

      {/* No ponemos el container aquí porque si no, 
          el fondo azul del Hero de la Landing se cortará.
      */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Landing />} />

          {/* Para Login, Registro y Buscador, que SÍ son 100% 
             contenido centrado, lo ideal es que el container 
             esté dentro de cada página.
          */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/buscador" element={<BuscadorLibros />} />

          <Route path="/home" element={<Home />} />
          <Route path="/perfilUsuario" element={<PerfilUsuario />} />
        </Routes>
      </main>

      <Footer />
    </Router>
  );
}

export default App;
