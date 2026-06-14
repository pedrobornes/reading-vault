import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../apiConfig";
import "../assets/css/header.css";

export default function Header() {
  const navigate = useNavigate();
  const [numPendientes, setNumPendientes] = useState(0);
  
  // Estado y ref para menú móvil
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Verifica sesión
  const usuarioSesion = JSON.parse(localStorage.getItem("usuario"));
  const estaLogueado = !!usuarioSesion;

  // Cargar pendientes
  useEffect(() => {
    if (estaLogueado) {
      const token = localStorage.getItem("token");
      fetch(
        `${API_BASE_URL}/api/amistades/pendientes/${usuarioSesion.idUsuario}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setNumPendientes(data.length))
        .catch((err) => console.log("Error al contar pendientes", err));
    }
  }, [estaLogueado, usuarioSesion?.idUsuario]);

  // Cierra el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Función logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    window.location.reload();
  };

  // Cierra menú al navegar
  const cerrarMenu = () => setIsOpen(false);

  const FOTO_DEFAULT = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (
    // Ref asignado al nav principal para cerrar al hacer clic fuera
    <nav className={`navbar-custom ${isOpen ? "menu-open" : ""}`} ref={menuRef}>
      <div className="container d-flex justify-content-between align-items-center">
        
        {/* Logo */}
        <Link to="/" className="navbar-custom__brand" onClick={cerrarMenu}>
          <div className="navbar-custom__logo-circle">
            <img src="/img/logo-vault.png" alt="Logo" className="navbar-custom__logo-img" />
          </div>
          <h3>
            <span className="navbar-custom__brand--reading">Reading</span>
            <span className="navbar-custom__brand--vault">Vault</span>
          </h3>
        </Link>

        {/* Menú */}
        <div className={`navbar-custom__menu ${isOpen ? "is-open" : ""}`}>
          <Link to={estaLogueado ? "/home" : "/login"} className="navbar-custom__link" onClick={cerrarMenu}>
            Home
          </Link>
          <Link to="/comunidad" className="navbar-custom__link" onClick={cerrarMenu}>
            Comunidad
          </Link>
          <Link to="/buscador" className="navbar-custom__link" onClick={cerrarMenu}>
            Explorar
          </Link>

          {estaLogueado && (
            <Link to="/mis-amigos" className="navbar-custom__link d-flex align-items-center" onClick={cerrarMenu}>
              Amigos 
              {numPendientes > 0 && (
                <span className="badge-notificacion ms-2">
                  {numPendientes > 99 ? '99+' : numPendientes}
                </span>
              )}
            </Link>
          )}

          {/* Ocultamos la barra vertical en móviles (visible solo desde md en adelante) */}
          <div className="navbar-custom__divider d-none d-md-block"></div>

          {/* Opciones Auth */}
          {!estaLogueado ? (
            <div className="d-flex flex-column flex-md-row align-items-center gap-3 mt-3 mt-md-0">
              <Link to="/registro" className="navbar-custom__link" onClick={cerrarMenu}>
                Registro
              </Link>
              <Link to="/login" className="navbar-custom__auth-btn" onClick={cerrarMenu}>
                Log In
              </Link>
            </div>
          ) : (
            // Alineamos los botones en columna para móvil y en fila para PC, añadiendo margen superior en móvil
            <div className="d-flex flex-column flex-md-row align-items-center gap-3 mt-4 mt-md-0">
              <Link
                to={`/perfil/${usuarioSesion.idUsuario}`}
                className="navbar-custom__link d-flex align-items-center gap-2"
                onClick={cerrarMenu}
              >
                <img
                  src={usuarioSesion.fotoPerfil || FOTO_DEFAULT}
                  alt="Mi perfil"
                  style={{ width: "30px", height: "30px", borderRadius: "50%", objectFit: "cover" }}
                />
                Mi perfil
              </Link>
              <button onClick={handleLogout} className="navbar-custom__auth-btn">
                Log Out
              </button>
            </div>
          )}
        </div>

        {/* Botón hamburguesa/X */}
        <div
          className="navbar-custom__hamburger d-flex align-items-center justify-content-center d-md-none"
          onClick={() => setIsOpen(!isOpen)}
          style={{ fontSize: "1.8rem", cursor: "pointer", zIndex: 1050 }}
        >
          {isOpen ? <i className="bi bi-x-lg"></i> : <i className="bi bi-list"></i>}
        </div>
      </div>
    </nav>
  );
}