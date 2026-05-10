import { Link, useNavigate } from "react-router-dom";
import "../assets/css/header.css";

// Componente Navbar
export default function Header() {
  const navigate = useNavigate();
  
  // Verifica sesión
  const usuarioSesion = JSON.parse(localStorage.getItem("usuario"));
  const estaLogueado = !!usuarioSesion; 

  // Cierra sesión
  const handleLogout = () => {
    localStorage.clear(); 
    navigate("/login");    
    window.location.reload(); 
  };

  const FOTO_DEFAULT = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (
    <nav className="navbar-custom">
      <div className="container d-flex justify-content-between align-items-center">
        {/* LOGO: A la landing */}
        <Link to="/" className="navbar-custom__brand">
          <div className="navbar-custom__logo-circle">
            <img
              src="/img/logo-vault.png"
              alt="Logo"
              className="navbar-custom__logo-img"
            />
          </div>
          <h3><span className="navbar-custom__brand--reading">Reading</span><span className="navbar-custom__brand--vault">Vault</span></h3>
        </Link>

        {/* MENÚ */}
        <div className="navbar-custom__menu d-flex align-items-center gap-4">
          
          {/* Home dinámico */}
          <Link to={estaLogueado ? "/home" : "/login"} className="navbar-custom__link">
            Home
          </Link>
          
          <Link to="/comunidad" className="navbar-custom__link">
            Comunidad
          </Link>
          <Link to="/buscador" className="navbar-custom__link">
            Explorar
          </Link>
          
          {/* Enlace ancla a la sección Nosotros en la Landing */}
          <Link to="/#nosotros" className="navbar-custom__link">
            Nosotros
          </Link>

          <div className="navbar-custom__divider"></div>

          {/* SIN LOGUEAR */}
          {!estaLogueado ? (
            <>
              <Link to="/registro" className="navbar-custom__link">Registro</Link>
              <Link to="/login" className="navbar-custom__auth-btn">Log In</Link>
            </>
          ) : (
            /* LOGUEADO */
            <div className="d-flex align-items-center gap-3">
              {/* CAMBIO CLAVE: Ahora apunta a la ruta dinámica usando el ID de la sesión */}
              <Link 
                to={`/perfil/${usuarioSesion.idUsuario}`} 
                className="navbar-custom__link d-flex align-items-center gap-2"
              >
                <img 
                  src={usuarioSesion.fotoPerfil || FOTO_DEFAULT} 
                  alt="Mi perfil" 
                  style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} 
                />
                Mi perfil
              </Link>

              <button 
                onClick={handleLogout} 
                className="navbar-custom__auth-btn"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}