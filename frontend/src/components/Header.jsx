import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../apiConfig";
import "../assets/css/header.css";

export default function Header() {
  const navigate = useNavigate();
  const [numPendientes, setNumPendientes] = useState(0);
  
  // Verifica sesión
  const usuarioSesion = JSON.parse(localStorage.getItem("usuario"));
  const estaLogueado = !!usuarioSesion; 

  // Cargar solicitudes pendientes
  useEffect(() => {
    if (estaLogueado) {
      const token = localStorage.getItem("token");
      fetch(`${API_BASE_URL}/api/amistades/pendientes/${usuarioSesion.idUsuario}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : [])
      .then(data => setNumPendientes(data.length))
      .catch(err => console.log("Error al contar pendientes", err));
    }
  }, [estaLogueado, usuarioSesion?.idUsuario]);

  const handleLogout = () => {
    localStorage.clear(); 
    navigate("/login");    
    window.location.reload(); 
  };

  const FOTO_DEFAULT = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const [isOpen, setIsOpen] = useState(false);

  return (
    
    <nav className="navbar-custom">
      <div className="container d-flex justify-content-between align-items-center">
        {/* LOGO */}
        <Link to="/" className="navbar-custom__brand">
          <div className="navbar-custom__logo-circle">
            <img src="/img/logo-vault.png" alt="Logo" className="navbar-custom__logo-img" />
          </div>
          <h3>
            <span className="navbar-custom__brand--reading">Reading</span>
            <span className="navbar-custom__brand--vault">Vault</span>
          </h3>
        </Link>

        {/* MENÚ */}
        <div className={`navbar-custom__menu d-flex align-items-center gap-4 ${isOpen ? "is-open" : ""}`}>
          
          <Link to={estaLogueado ? "/home" : "/login"} className="navbar-custom__link">Home</Link>
          <Link to="/comunidad" className="navbar-custom__link">Comunidad</Link>
          <Link to="/buscador" className="navbar-custom__link">Explorar</Link>
          
          {estaLogueado && (
            <Link to="/mis-amigos" className="navbar-custom__link">Amigos {numPendientes > 0 && <span>{numPendientes}</span>}</Link>
          )}

          <div className="navbar-custom__divider"></div>

          {!estaLogueado ? (
            <>
              <Link to="/registro" className="navbar-custom__link">Registro</Link>
              <Link to="/login" className="navbar-custom__auth-btn">Log In</Link>
            </>
          ) : (
            <div className="d-flex align-items-center gap-3">
              <Link to={`/perfil/${usuarioSesion.idUsuario}`} className="navbar-custom__link">Mi perfil</Link>
              <button onClick={handleLogout} className="navbar-custom__auth-btn">Log Out</button>
            </div>
          )}
        </div>

        {/* Botón hamburguesa (solo visible en móvil por CSS) */}
        <div className="navbar-custom__hamburger" onClick={() => setIsOpen(!isOpen)}>
          <span className={isOpen ? "open" : ""}></span>
          <span className={isOpen ? "open" : ""}></span>
          <span className={isOpen ? "open" : ""}></span>
        </div>
      </div>
      
    </nav>
  );

  
}