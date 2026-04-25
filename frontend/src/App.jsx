import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Importación de componentes
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Importación de páginas
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import BuscadorLibros from "./pages/BuscadorLibros";
import Home from './pages/Home'

function App() {
  return (
    <Router>
      {/* El Navbar aparece en todas las rutas */}
      <Navbar />
      
      <main className="main-content">
        <Routes>
          {/* Ruta principal: Landing modular */}
          <Route path="/" element={<Landing />} />

          {/* Rutas de autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          
          {/* Buscador dinámico de Google Books */}
          <Route path="/buscador" element={<BuscadorLibros />} />

          <Route path="/home" element={<Home />} />
        </Routes>
      </main>

      {/* El Footer aparece al final de todas las rutas */}
      <Footer />
    </Router>
  );
}

export default App;