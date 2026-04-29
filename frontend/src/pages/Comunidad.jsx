import React, { useState } from 'react';
import '../assets/css/comunidad.css';

export default function Comunidad() {
  // Estados
  const [pestaña, setPestaña] = useState('grupos'); // 'grupos' o 'usuarios'
  const [busqueda, setBusqueda] = useState('');

  // Mock Data
  const gruposMock = [
    { id: 1, nombre: "Amantes de la Fantasía", miembros: 142, lecturaActual: "El Archivo de las Tormentas", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=300&auto=format&fit=crop" },
    { id: 2, nombre: "Club de Clásicos", miembros: 89, lecturaActual: "Orgullo y Prejuicio", img: "https://images.unsplash.com/photo-1455390582262-044cdead2708?q=80&w=300&auto=format&fit=crop" },
    { id: 3, nombre: "Thriller y Misterio", miembros: 215, lecturaActual: "La chica del tren", img: "https://images.unsplash.com/photo-1587876931567-564ce588bfbd?q=80&w=300&auto=format&fit=crop" }
  ];

  const usuariosMock = [
    { id: 1, nombre: "CarlosRuiz", avatar: "https://randomuser.me/api/portraits/men/32.jpg", librosLeidos: 45, generoFav: "Ciencia Ficción" },
    { id: 2, nombre: "AnaLee", avatar: "https://randomuser.me/api/portraits/women/44.jpg", librosLeidos: 112, generoFav: "Fantasía" },
    { id: 3, nombre: "Elena_99", avatar: "https://randomuser.me/api/portraits/women/68.jpg", librosLeidos: 23, generoFav: "Romance" },
    { id: 4, nombre: "LectorEmpedernido", avatar: "https://randomuser.me/api/portraits/men/46.jpg", librosLeidos: 304, generoFav: "Histórica" }
  ];

  return (
    <main className="comunidad-bg py-5">
      <div className="container-custom">
        
        {/* Cabecera */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 gap-3">
          <h1 className="comunidad-titulo mb-0">Comunidad</h1>
          <button className="btn-crear-grupo">
            <i className="bi bi-plus-circle-fill me-2"></i> Crear Grupo
          </button>
        </div>

        {/* Buscador y Pestañas */}
        <div className="busqueda-container p-4 mb-5 shadow-sm">
          <div className="row g-3 align-items-center">
            
            <div className="col-md-5">
              <div className="d-flex gap-2 nav-pestañas">
                <button 
                  className={`btn-tab ${pestaña === 'grupos' ? 'active' : ''}`}
                  onClick={() => setPestaña('grupos')}
                >
                  <i className="bi bi-people-fill me-2"></i> Grupos
                </button>
                <button 
                  className={`btn-tab ${pestaña === 'usuarios' ? 'active' : ''}`}
                  onClick={() => setPestaña('usuarios')}
                >
                  <i className="bi bi-person-fill me-2"></i> Usuarios
                </button>
              </div>
            </div>

            <div className="col-md-7">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control border-start-0 ps-0 input-buscar" 
                  placeholder={`Buscar ${pestaña}...`}
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Resultados */}
        <div className="row g-4">
          {pestaña === 'grupos' && gruposMock.map(grupo => (
            <div key={grupo.id} className="col-md-6 col-lg-4">
              <div className="comunidad-card h-100">
                <img src={grupo.img} alt={grupo.nombre} className="card-img-top grupo-img" />
                <div className="card-body p-4 text-center">
                  <h5 className="fw-bold mb-1">{grupo.nombre}</h5>
                  <p className="text-muted small mb-3"><i className="bi bi-person-hearts me-1"></i> {grupo.miembros} miembros</p>
                  <div className="lectura-actual p-2 rounded">
                    <span className="d-block small text-muted">Leyendo ahora:</span>
                    <strong className="text-dark">{grupo.lecturaActual}</strong>
                  </div>
                  <button className="btn-unirse mt-4 w-100">Unirse al grupo</button>
                </div>
              </div>
            </div>
          ))}

          {pestaña === 'usuarios' && usuariosMock.map(user => (
            <div key={user.id} className="col-md-6 col-lg-3">
              <div className="comunidad-card h-100 p-4 text-center d-flex flex-column align-items-center justify-content-center">
                <img src={user.avatar} alt={user.nombre} className="usuario-avatar mb-3" />
                <h5 className="fw-bold mb-1">@{user.nombre}</h5>
                <p className="text-muted small mb-3">{user.generoFav}</p>
                <div className="d-flex gap-3 text-muted small mt-auto">
                  <span><i className="bi bi-book-fill me-1"></i> {user.librosLeidos} leídos</span>
                </div>
                <button className="btn-seguir mt-3 w-100">Ver perfil</button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}