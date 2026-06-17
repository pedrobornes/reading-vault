import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../apiConfig';
import "../assets/css/listaAmigos.css";

export default function MiembrosGrupo() {
  const FOTO_DEFECTO = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
  const { idGrupo } = useParams();
  const navigate = useNavigate();

  const [miembros, setMiembros] = useState([]);
  const [grupoInfo, setGrupoInfo] = useState({ miembros: [] });
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  // Estados paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 12;

  const sesion = JSON.parse(localStorage.getItem("usuario"));
  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Determinar permisos de forma global
  const esAdminSistema = sesion?.rol === "ADMIN" || sesion?.rol === "admin";
  const soyAdminDelGrupo = grupoInfo?.miembros?.find(m => m.usuario.idUsuario === sesion?.idUsuario)?.rol === "admin";

  // El botón de gestionar aparece si eres Admin del sistema o eres Admin del grupo
  const tengoPermisosGestion = soyAdminDelGrupo || esAdminSistema;

  useEffect(() => {
    cargarDatosComunidad();
  }, [idGrupo]);

  // Reset de página al buscar
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  const cargarDatosComunidad = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/comunidades/${idGrupo}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setGrupoInfo(data);
        setMiembros(data.miembros || []);
      }
    } catch (err) {
      console.error("Error cargando la comunidad", err);
    } finally {
      setCargando(false);
    }
  };

  // --- LÓGICA PAGINACIÓN ---
  const miembrosFiltrados = miembros.filter((m) =>
    m?.usuario?.nombreUsuario?.toLowerCase().includes(busqueda.toLowerCase())
  );
  
  const indiceUltimo = paginaActual * elementosPorPagina;
  const indicePrimero = indiceUltimo - elementosPorPagina;
  const miembrosPaginados = miembrosFiltrados.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(miembrosFiltrados.length / elementosPorPagina);

  const cambiarPagina = (num) => {
    setPaginaActual(num);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderNumerosPagina = () => {
    const paginas = [];
    const maxPaginasVisibles = 5;
    let inicio = Math.max(1, paginaActual - 2);
    let fin = Math.min(totalPaginas, inicio + maxPaginasVisibles - 1);
    if (fin - inicio + 1 < maxPaginasVisibles) inicio = Math.max(1, fin - maxPaginasVisibles + 1);

    for (let i = inicio; i <= fin; i++) {
      paginas.push(
        <button key={i} className={`btn ${paginaActual === i ? "btn-success" : "btn-outline-success"} mx-1`} onClick={() => cambiarPagina(i)}>
          {i}
        </button>
      );
    }
    return paginas;
  };

  const obtenerEstadoConexion = (ultimaConexion) => {
    if (!ultimaConexion) return { online: false, texto: "Desconectado" };

    const ultima = new Date(ultimaConexion).getTime();
    const ahora = new Date().getTime();

    const diferenciaMinutos = Math.floor((ahora - ultima) / (1000 * 60));

    // Si la diferencia está entre -5 y +5 minutos, está en línea.
    if (diferenciaMinutos >= -5 && diferenciaMinutos < 5) {
      return { online: true, texto: "En línea" };
    }

    // Seguimos con la lógica de hoy/ayer
    const ultimaDate = new Date(ultimaConexion);
    const ahoraDate = new Date();

    if (ultimaDate.toDateString() === ahoraDate.toDateString()) {
      return { online: false, texto: "Última conexión hoy" };
    }

    const ayer = new Date();
    ayer.setDate(ahoraDate.getDate() - 1);
    if (ultimaDate.toDateString() === ayer.toDateString()) {
      return { online: false, texto: "Última conexión ayer" };
    }

    return { online: false, texto: `Última conexión el ${ultimaDate.toLocaleDateString()}` };
  };

  const handleExpulsar = (idUsuario, nombreUsuario) => {
    Swal.fire({
      title: `¿Expulsar a ${nombreUsuario}?`,
      text: "Ya no podrá participar en el muro del club.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#7c4d3a',
      confirmButtonText: 'Sí, expulsar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/comunidades/${idGrupo}/expulsar/${idUsuario}`, { 
            method: "DELETE", 
            headers: headers,
            body: JSON.stringify({ idUsuario: sesion.idUsuario }) 
          });
          
          if (res.ok) {
            Swal.fire({ title: '¡Expulsado!', icon: 'success', timer: 1500, showConfirmButton: false });
            cargarDatosComunidad();
          } else {
             // Mostrar error si el backend te bloquea
             Swal.fire('Error', 'No tienes permisos para expulsar', 'error');
          }
        } catch (error) { 
          console.error("Error al expulsar:", error); 
        }
      }
    });
  };

  const handleCederAdmin = (idUsuario, nombreUsuario) => {
    Swal.fire({
      title: '¿Ceder administración?',
      text: `Convertirás a ${nombreUsuario} en el nuevo Admin.`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#7c4d3a',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sí, ceder rol'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/comunidades/${idGrupo}/cambiar-admin/${idUsuario}`, { 
            method: "PUT", 
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify({ idUsuario: sesion.idUsuario }) 
          });
          
          if (res.ok) {
            Swal.fire({ title: '¡Rol transferido!', icon: 'success', timer: 1500, showConfirmButton: false });
            cargarDatosComunidad();
          }
        } catch (error) { console.error("Error al ceder rol:", error); }
      }
    });
  };

  if (cargando) {
    return (
      <div className="loader-container d-flex flex-column justify-content-center align-items-center text-center w-100" style={{ minHeight: "80vh" }}>
        <div className="book">
          <div className="inner">
            <div className="left"></div>
            <div className="middle"></div>
            <div className="right"></div>
          </div>
          <ul>{[...Array(18)].map((_, i) => (<li key={i}></li>))}</ul>
        </div>
        <h4 className="loader-texto mt-5 text-muted fw-bold">Cargando lista lectores...</h4>
      </div>
    );
  }

  return (
    <div className="tus-amigos-bg py-5">
      <div className="container-custom">
        <div className="row g-4">
          <div className="col-lg-3">
            <div className="social-sidebar">
              <h5 className="mb-4 text-truncate">{grupoInfo?.nombre}</h5>
              <button className="nav-social-link active w-100 text-start">
                <i className="bi bi-people-fill me-2"></i> Lectores activos: {miembros.length}
              </button>
              <Link to={`/comunidad/grupo/${idGrupo}`} className="btn btn-volver-perfil w-100 rounded-pill mt-4 btn-sm text-center">
                <i className="bi bi-arrow-left me-2"></i> Volver al grupo
              </Link>
            </div>
          </div>

          <div className="col-lg-9">
            <div className="search-amigos-container mb-4">
              <i className="bi bi-search search-amigos-icon"></i>
              <input type="text" className="search-amigos-input" placeholder="Buscar lector en la comunidad..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </div>

            <section>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>Miembros del Club</h3>
                <span className="badge-tu-resena">Total: {miembros.length}</span>
              </div>

              {miembrosPaginados.length === 0 ? (
                <div className="detalle-card p-5 text-center bg-white rounded-4 border">
                  <p className="text-muted">No se han encontrado lectores.</p>
                </div>
              ) : (
                <>
                  {miembrosPaginados.map((membro) => {
                    const esElMismo = membro.usuario.idUsuario === sesion.idUsuario;
                    const esAdminDelFila = membro.rol === "admin";
                    const estado = obtenerEstadoConexion(membro.usuario.ultimaConexion);

                    return (
                      <div key={membro.usuario.idUsuario} className="amigo-item-card d-flex align-items-center p-3 mb-3 bg-white rounded-4 shadow-sm">
                        <img src={membro.usuario.fotoPerfil || FOTO_DEFECTO} className="amigo-avatar me-3" alt="avatar" style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }} />
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2">
                            <h5 className="mb-0 fw-bold">{membro.usuario.nombreUsuario}</h5>
                            {esAdminDelFila && <span className="badge bg-warning text-dark">Admin</span>}
                          </div>
                          <div className={`status-indicator small ${estado.online ? "text-success fw-bold" : "status-offline"}`}>
                            {estado.online && (
                              <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.4rem', verticalAlign: "middle", marginBottom: "2px" }}></i>
                            )}
                            <span>{estado.texto}</span>
                          </div>
                        </div>

                        <div className="d-flex gap-2">
                          {tengoPermisosGestion && !esElMismo && (
                            <>
                              {!esAdminDelFila && tengoPermisosGestion && (
                                <button className="btn-gestion-comunidad btn-hacer-admin" onClick={() => handleCederAdmin(membro.usuario.idUsuario, membro.usuario.nombreUsuario)}>
                                  <i className="bi bi-shield-check me-1"></i> Promover
                                </button>
                              )}
                              <button className="btn-gestion-comunidad btn-expulsar" onClick={() => handleExpulsar(membro.usuario.idUsuario, membro.usuario.nombreUsuario)}>
                                <i className="bi bi-person-x me-1"></i> Expulsar
                              </button>
                            </>
                          )}
                          <Link to={`/perfil/${membro.usuario.idUsuario}`} className="btn-gestion-comunidad btn-ver-perfil-listado">
                            Ver Perfil
                          </Link>
                        </div>
                      </div>
                    );
                  })}

                  {/* --- BOTONES DE PAGINACIÓN --- */}
                  {totalPaginas > 1 && (
                    <div className="d-flex justify-content-center mt-4 align-items-center gap-2">
                      <button className="btn btn-outline-success" onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1}>
                        <i className="bi bi-chevron-left"></i>
                      </button>
                      <div className="d-none d-sm-flex">{renderNumerosPagina()}</div>
                      <button className="btn btn-outline-success" onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas}>
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}