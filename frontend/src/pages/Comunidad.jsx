import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/comunidad.css';
import CrearGrupoModal from '../components/CrearGrupoModal';

export default function Comunidad() {
  // Estados
  const [pestaña, setPestaña] = useState('grupos'); 
  const [busqueda, setBusqueda] = useState('');
  const [usuarios, setUsuarios] = useState([]); 
  const [grupos, setGrupos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const cargarUsuarios = async () => {
    setCargando(true);
    const token = localStorage.getItem("token");
    try {
      
      const response = await fetch('http://localhost:8080/api/usuarios', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setUsuarios(data);
      }
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setCargando(false);
    }

    
  };

  useEffect(() => {
    if (pestaña === 'usuarios') {
      cargarUsuarios();
    }else if (pestaña === 'grupos') {
      cargarGrupos(); 
    }
  }, [pestaña]);

  // Filtrado por búsqueda
  const usuariosFiltrados = usuarios.filter(u => {
    const textoBuscado = busqueda.toLowerCase();
    const nombreUsuario = (u.nombreUsuario || u.nombre_usuario || "").toLowerCase();
    // Devuelve true si el texto buscado está en el campo
    return nombreUsuario.includes(textoBuscado) 
    
         
  });
  
  const cargarGrupos = async () => {
    setCargando(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch('http://localhost:8080/api/comunidades', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setGrupos(data); // Guardamos los grupos de la BD
      }
    } catch (error) {
      console.error("Error cargando grupos:", error);
    } finally {
      setCargando(false);
    }
  };

  const gruposFiltrados = grupos.filter(g => 
    g.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  
  

  return (
    <main className="comunidad-bg py-5">
      <div className="container-custom">
        
        {/* Cabecera */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 gap-3">
          <h1 className="comunidad-titulo mb-0">Comunidad</h1>
          <button className="btn-crear-grupo" onClick={() => setShowModal(true)}>
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
          {pestaña === 'grupos' && (
            cargando ? <p className="text-center w-100">Cargando clubes de lectura...</p> :
            gruposFiltrados.length > 0 ? (
              gruposFiltrados.map(grupo => (
                <div key={grupo.idComunidad} className="col-md-6 col-lg-4">
                  <div className="comunidad-card h-100 d-flex flex-column">
                    <div className="posicion-foto-grupo">
                      <img src={grupo.foto} alt={grupo.nombre} className="card-img-top grupo-img" />
                    </div>
                    
                    <div className="card-body p-4 text-center d-flex flex-column flex-grow-1">
                      <h5 className="fw-bold mb-1 grupo-nombre-comunidad">{grupo.nombre}</h5>
                      <p className="text-muted small mb-3">
                        <i className="bi bi-person-hearts me-1 text-danger"></i> 
                        {grupo.miembros ? grupo.miembros.length : 0} miembros
                      </p>
                      
                      {/* SECCIÓN DEL LIBRO ACTUAL */}
                      <div className="mt-2 mb-4 flex-grow-1 d-flex align-items-center justify-content-center">
                        {grupo.libro ? (
                          <div className="lectura-actual-badge p-2.5 rounded w-100 d-flex align-items-center gap-2 text-start">
                            <i className="bi bi-book-half text-vault-verde fs-5 ms-1"></i>
                            <div>
                              <span className="d-block libro-leyendo-label">Leyendo ahora:</span>
                              <strong className="libro-leyendo-titulo">{grupo.libro.titulo}</strong>
                            </div>
                          </div>
                        ) : (
                          <div className="lectura-vacia-badge p-2.5 rounded w-100 text-center">
                            <span className="text-muted small"><i className="bi bi-pause-circle me-1"></i> Sin lectura activa</span>
                          </div>
                        )}
                      </div>
                      
                      <button 
                        className="btn-unirse mt-auto w-100"
                        onClick={() => navigate(`/comunidad/grupo/${grupo.idComunidad}`)}
                      >
                        Ver grupo
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center w-100 py-5">
                <i className="bi bi-chat-square-dots display-1 text-muted mb-3 opacity-50"></i>
                <h4 className="text-muted fw-bold">No se encontraron grupos</h4>
                <p className="text-muted">¡Sé el primero en crear un club de lectura usando el botón de arriba!</p>
              </div>
            )
          )}

          {pestaña === 'usuarios' && (
            cargando ? (
              <p className="text-center w-100">Cargando datos...</p>
            ) : busqueda.trim() === '' ? (
              <div className="text-center w-100 py-5">
                <i className="bi bi-search display-1 text-muted mb-3 opacity-50"></i>
                <h4 className="text-muted fw-bold">Encuentra a otros lectores</h4>
                <p className="text-muted">Escribe un nombre de usuario arriba para empezar a buscar.</p>
              </div>
            ) : usuariosFiltrados.length > 0 ? (
              usuariosFiltrados.map(user => (
                <div key={user.idUsuario || user.id} className="col-md-6 col-lg-3">
                  <div className="comunidad-card h-100 p-4 text-center d-flex flex-column align-items-center">
                    <img 
                      /* Generamos el avatar con nombre_usuario */
                      src={user.fotoPerfil || "https://ui-avatars.com/api/?name=" + user.nombre_usuario} 
                      alt={user.nombre_usuario} 
                      className="usuario-avatar mb-3 shadow-sm" 
                    />
                    {/* Mostramos el nombre_usuario */}
                    <h5 className="fw-bold mb-1">{user.nombreUsuario}</h5>
                    
                    <div className="d-flex gap-3 text-muted small mt-auto">
                      <span><i className="bi bi-book-fill me-1"></i> {user.totalLibros || 0} leídos</span>
                    </div>
                    <button className="btn-seguir mt-3 w-100" onClick={() => navigate(`/perfil/${user.idUsuario}`)}>Ver perfil</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center w-100 py-5">
                <i className="bi bi-emoji-frown display-1 text-muted mb-3 opacity-50"></i>
                <h4 className="text-muted fw-bold">Sin resultados</h4>
                <p className="text-muted">No hemos encontrado a ningún usuario que contenga "{busqueda}".</p>
              </div>
            )
          )}
        </div>
      </div>
      <CrearGrupoModal 
        show={showModal} 
        onClose={() => setShowModal(false)} 
        onGrupoCreado={cargarGrupos} 
      />
    </main>
  );
}