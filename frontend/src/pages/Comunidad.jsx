import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../apiConfig';
import '../assets/css/comunidad.css';
import Swal from 'sweetalert2';
import CrearGrupoModal from '../components/CrearGrupoModal';

export default function Comunidad() {
  // Estados generales
  const [pestaña, setPestaña] = useState('grupos'); 
  const [busqueda, setBusqueda] = useState('');
  const [usuarios, setUsuarios] = useState([]); 
  const [grupos, setGrupos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Estados paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 12;

  // Sesión usuario
  const sesionStr = localStorage.getItem("usuario");
  const sesion = sesionStr ? JSON.parse(sesionStr) : null;

  const [filtroVista, setFiltroVista] = useState('todos'); // 'todos' o 'mios'
  const esAdminSistema = sesion?.rol === "ADMIN" || sesion?.rol === "admin";

  // FUNCIÓN PARA PROTEGER BOTONES ---
  const ejecutarAccionProtegida = (accionCallback, mensajeAccion) => {
    if (!sesion) {
      Swal.fire({
        title: "¿Te unes a la lectura?",
        text: `Debes iniciar sesión o registrarte para ${mensajeAccion}.`,
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "var(--color-salmon, #fa8072)", 
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Ir a Login",
        cancelButtonText: "Cancelar",
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
    } else {
      accionCallback();
    }
  };

  // Reset de página al buscar o cambiar de pestaña
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, pestaña, filtroVista]);

  const cargarUsuarios = async () => {
    setCargando(true);
    const token = localStorage.getItem("token");
    
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/usuarios`, {
        headers: headers 
      });
      if (response.ok) {
        const data = await response.json();
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
    } else if (pestaña === 'grupos') {
      cargarGrupos(); 
    }
  }, [pestaña]);

  // Filtrado por búsqueda para usuarios
  const usuariosFiltrados = usuarios.filter(u => {
    const textoBuscado = busqueda.toLowerCase();
    const nombreUsuario = (u.nombreUsuario || u.nombre_usuario || "").toLowerCase();
    return nombreUsuario.includes(textoBuscado);
  });
  
  // PAGINACIÓN USUARIOS
  const indiceUltimoUsuario = paginaActual * elementosPorPagina;
  const indicePrimerUsuario = indiceUltimoUsuario - elementosPorPagina;
  const usuariosPaginados = usuariosFiltrados.slice(indicePrimerUsuario, indiceUltimoUsuario);
  const totalPaginasUsuarios = Math.ceil(usuariosFiltrados.length / elementosPorPagina);

  const cargarGrupos = async () => {
    setCargando(true);
    const token = localStorage.getItem("token");
    
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/comunidades`, {
        headers: headers 
      });
      if (response.ok) {
        const data = await response.json();
        setGrupos(data);
      }
    } catch (error) {
      console.error("Error cargando grupos:", error);
    } finally {
      setCargando(false);
    }
  };

  // gruposFiltrados
  const gruposFiltrados = grupos.filter(g => {
    const coincideBusqueda = g.nombre?.toLowerCase().includes(busqueda.toLowerCase());
    const esMiembro = g.miembros?.some(m => m.usuario.idUsuario === sesion?.idUsuario);
    
    if (filtroVista === 'mios') return coincideBusqueda && esMiembro;
    return coincideBusqueda;
  });

  // ORDENACIÓN: Grupos del usuario primero
  const gruposOrdenados = [...gruposFiltrados].sort((a, b) => {
    const esMiembroA = a.miembros?.some(m => m.usuario.idUsuario === sesion?.idUsuario);
    const esMiembroB = b.miembros?.some(m => m.usuario.idUsuario === sesion?.idUsuario);
    
    if (esMiembroA && !esMiembroB) return -1;
    if (!esMiembroA && esMiembroB) return 1;
    return 0;
  });

  // PAGINACIÓN GRUPOS
  const indiceUltimoGrupo = paginaActual * elementosPorPagina;
  const indicePrimerGrupo = indiceUltimoGrupo - elementosPorPagina;
  const gruposPaginados = gruposOrdenados.slice(indicePrimerGrupo, indiceUltimoGrupo);
  const totalPaginasGrupos = Math.ceil(gruposOrdenados.length / elementosPorPagina);


  // --- FUNCIONES DE ESTILO DE PAGINACIÓN IDÉNTICAS AL BUSCADOR ---
  const cambiarPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderNumerosPagina = (totalPaginas) => {
    const paginas = [];
    const maxPaginasVisibles = 5;
    let inicio = Math.max(1, paginaActual - 2);
    let fin = Math.min(totalPaginas, inicio + maxPaginasVisibles - 1);

    if (fin - inicio + 1 < maxPaginasVisibles) {
      inicio = Math.max(1, fin - maxPaginasVisibles + 1);
    }

    for (let i = inicio; i <= fin; i++) {
      paginas.push(
        <button
          key={i}
          className={`btn ${paginaActual === i ? "btn-success" : "btn-outline-success"} mx-1`}
          onClick={() => cambiarPagina(i)}
        >
          {i}
        </button>
      );
    }
    return paginas;
  };

  return (
    <main className="comunidad-bg py-5">
      <div className="container-custom">
        {/* Cabecera */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 gap-3">
          <h1 className="comunidad-titulo mb-0">Comunidad</h1>
          <button 
            className="btn-crear-grupo" 
            onClick={() => ejecutarAccionProtegida(() => setShowModal(true), "crear un nuevo club de lectura")}
          >
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

        {/* Selector de Vista: Todos vs Mis Grupos */}
        {pestaña === 'grupos' && (
          <div className="d-flex justify-content-center mb-4 gap-2">
            <button 
              className={`btn ${filtroVista === 'todos' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setFiltroVista('todos')}
            >
              Todos los Grupos
            </button>
            <button 
              className={`btn ${filtroVista === 'mios' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setFiltroVista('mios')}
            >
              Mis Grupos
            </button>
          </div>
        )}

        {/* Resultados */}
        <div className="row g-4">
          {pestaña === 'grupos' && (
            cargando ? (
              <div className="loader-container d-flex flex-column justify-content-center align-items-center text-center w-100" style={{ minHeight: "400px" }}>
                <div className="book">
                  <div className="inner">
                    <div className="left"></div>
                    <div className="middle"></div>
                    <div className="right"></div>
                  </div>
                  <ul>
                    {[...Array(18)].map((_, i) => (
                      <li key={i}></li>
                    ))}
                  </ul>
                </div>
                <h4 className="loader-texto mt-5 text-muted fw-bold">Cargando clubes de lectura...</h4>
              </div>
            ) : gruposPaginados.length > 0 ? (
              <>
                {gruposPaginados.map(grupo => {
                  const esMiembro = grupo.miembros?.some(m => m.usuario.idUsuario === sesion?.idUsuario);
                  
                  return (
                    <div key={grupo.idComunidad} className="col-md-6 col-lg-4">
                      {/* Añadimos position-relative para la estrella */}
                      <div className="comunidad-card h-100 d-flex flex-column position-relative">
                        
                        {/* ICONO DE ESTRELLA PARA MIS GRUPOS */}
                        {esMiembro && (
                          <div className="badge-mi-grupo position-absolute" style={{ top: '10px', right: '15px', zIndex: 10, background: 'rgba(0,0,0,0.6)', padding: '5px 10px', borderRadius: '20px' }}>
                             <i className="bi bi-star-fill text-warning" title="Es uno de mis grupos"></i>
                          </div>
                        )}

                        <div className="posicion-foto-grupo">
                          <img src={grupo.foto} alt={grupo.nombre} className="card-img-top grupo-img" />
                        </div>
                        <div className="card-body p-4 text-center d-flex flex-column flex-grow-1">
                          <h5 className="fw-bold mb-1 grupo-nombre-comunidad">{grupo.nombre}</h5>
                          <p className="text-muted small mb-3">
                            <i className="bi bi-person-hearts me-1 text-danger"></i> 
                            {grupo.miembros ? grupo.miembros.length : 0} miembros
                          </p>
                          
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
                            onClick={() => ejecutarAccionProtegida(
                              () => navigate(`/comunidad/grupo/${grupo.idComunidad}`), 
                              "ver los detalles y unirte a este grupo"
                            )}
                          >
                            Ver grupo
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* --- PAGINACIÓN ESTILO BUSCADOR PARA GRUPOS --- */}
                {totalPaginasGrupos > 1 && (
                  <div className="col-12">
                    <div className="pagination-wrapper d-flex justify-content-center align-items-center mt-5 mb-3 gap-2">
                      <button
                        className="btn btn-outline-success"
                        onClick={() => cambiarPagina(paginaActual - 1)}
                        disabled={paginaActual === 1}
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>

                      <div className="d-none d-sm-flex">
                        {renderNumerosPagina(totalPaginasGrupos)}
                      </div>

                      <button
                        className="btn btn-outline-success"
                        onClick={() => cambiarPagina(paginaActual + 1)}
                        disabled={paginaActual === totalPaginasGrupos}
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                )}
              </>
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
              <div className="loader-container d-flex flex-column justify-content-center align-items-center text-center w-100" style={{ minHeight: "400px" }}>
                <div className="book">
                  <div className="inner">
                    <div className="left"></div>
                    <div className="middle"></div>
                    <div className="right"></div>
                  </div>
                  <ul>
                    {[...Array(18)].map((_, i) => (
                      <li key={i}></li>
                    ))}
                  </ul>
                </div>
                <h4 className="loader-texto mt-5 text-muted fw-bold">Buscando lectores...</h4>
              </div>
            ) : busqueda.trim() === '' ? (
              <div className="text-center w-100 py-5">
                <i className="bi bi-search display-1 text-muted mb-3 opacity-50"></i>
                <h4 className="text-muted fw-bold">Encuentra a otros lectores</h4>
                <p className="text-muted">Escribe un nombre de usuario arriba para empezar a buscar.</p>
              </div>
            ) : usuariosPaginados.length > 0 ? (
              <>
                {usuariosPaginados.map(user => (
                  <div key={user.idUsuario || user.id} className="col-md-6 col-lg-3">
                    <div className="comunidad-card h-100 p-4 text-center d-flex flex-column align-items-center">
                      <img 
                        src={(user.fotoPerfil && user.fotoPerfil !== "null" && user.fotoPerfil.trim() !== "") 
                              ? user.fotoPerfil 
                              : "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                        alt={user.nombreUsuario} 
                        className="usuario-avatar mb-3 shadow-sm" 
                      />
                      <h5 className="fw-bold mb-1">{user.nombreUsuario}</h5>
                      
                      <div className="d-flex gap-3 text-muted small mt-auto">
                        <span><i className="bi bi-book-fill me-1"></i> {user.totalLibros || 0} leídos</span>
                      </div>
                      <button 
                        className="btn-seguir mt-3 w-100" 
                        onClick={() => ejecutarAccionProtegida(
                          () => navigate(`/perfil/${user.idUsuario}`),
                          "ver el perfil de este lector"
                        )}
                      >
                        Ver perfil
                      </button>
                    </div>
                  </div>
                ))}

                {/* --- PAGINACIÓN ESTILO BUSCADOR PARA USUARIOS --- */}
                {totalPaginasUsuarios > 1 && (
                  <div className="col-12">
                    <div className="pagination-wrapper d-flex justify-content-center align-items-center mt-5 mb-3 gap-2">
                      <button
                        className="btn btn-outline-success"
                        onClick={() => cambiarPagina(paginaActual - 1)}
                        disabled={paginaActual === 1}
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>

                      <div className="d-none d-sm-flex">
                        {renderNumerosPagina(totalPaginasUsuarios)}
                      </div>

                      <button
                        className="btn btn-outline-success"
                        onClick={() => cambiarPagina(paginaActual + 1)}
                        disabled={paginaActual === totalPaginasUsuarios}
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                )}
              </>
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