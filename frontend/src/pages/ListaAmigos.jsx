import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import "../assets/css/listaAmigos.css";

export default function TusAmigos() {
  // Extraemos el idUsuario de la URL
  const { idUsuario } = useParams(); 
  
  const [seccion, setSeccion] = useState("amigos"); 
  const [pendientes, setPendientes] = useState([]);
  const [amigos, setAmigos] = useState([]);
  const [usuarioPerfil, setUsuarioPerfil] = useState(null); // Para saber de quién es la lista
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const miSesion = JSON.parse(localStorage.getItem("usuario"));
  const token = localStorage.getItem("token");
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Lógica para determinar si es mi propia lista o la de otro
  const esMiPropiaLista = !idUsuario || parseInt(idUsuario) === miSesion.idUsuario;
  const idABuscar = idUsuario || miSesion.idUsuario;

  useEffect(() => {
    cargarDatosSociales();
    // Si no es mi lista, cargamos los datos del dueño para el título
    if (!esMiPropiaLista) {
        fetch(`http://localhost:8080/api/usuarios/${idABuscar}`, { headers })
            .then(res => res.json())
            .then(data => setUsuarioPerfil(data));
    }
  }, [idUsuario]); // Recargar si cambia el ID en la URL

  const cargarDatosSociales = async () => {
    setCargando(true);
    try {
      // Las solicitudes solo se cargan si es MI lista
      if (esMiPropiaLista) {
        const resPen = await fetch(`http://localhost:8080/api/amistades/pendientes/${miSesion.idUsuario}`, { headers });
        const dataPen = await resPen.json();
        setPendientes(dataPen);
      }

      // La lista de amigos se carga para cualquier ID
      const resAmi = await fetch(`http://localhost:8080/api/amistades/lista/${idABuscar}`, { headers });
      const dataAmi = await resAmi.json();
      setAmigos(dataAmi);
    } catch (err) {
      console.error("Error cargando comunidad", err);
    } finally {
      setCargando(false);
    }
  };

  const obtenerEstadoConexion = (ultimaConexion) => {
    if (!ultimaConexion) return { online: false, texto: "Desconectado" };
    const ultima = new Date(ultimaConexion);
    const ahora = new Date();
    const diferenciaMinutos = Math.floor((ahora - ultima) / (1000 * 60));

    if (diferenciaMinutos < 5) return { online: true, texto: "● En línea ahora" };
    if (ultima.toDateString() === ahora.toDateString()) return { online: false, texto: "Última conexión hoy" };
    
    const ayer = new Date();
    ayer.setDate(ahora.getDate() - 1);
    if (ultima.toDateString() === ayer.toDateString()) return { online: false, texto: "Última conexión ayer" };

    return { online: false, texto: `Última conexión el ${ultima.toLocaleDateString()}` };
  };

  const gestionarAccion = async (id, accion) => {
    const endpoint = accion === 'aceptar' ? 'aceptar' : 'rechazar';
    const metodo = accion === 'aceptar' ? 'PUT' : 'DELETE';

    const res = await fetch(`http://localhost:8080/api/amistades/${endpoint}/${id}`, {
      method: metodo,
      headers: headers
    });

    if (res.ok) cargarDatosSociales();
  };

  const amigosFiltrados = amigos.filter(a => 
    a.nombreUsuario.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="tus-amigos-bg py-5">
      <div className="container-custom">
        <div className="row g-4">
          
          <div className="col-lg-3">
            <div className="social-sidebar">
              <h5 className="mb-4">
                {esMiPropiaLista ? "Tu Bóveda Social" : `Bóveda de ${usuarioPerfil?.nombreUsuario}`}
              </h5>
              
              <button 
                className={`nav-social-link ${seccion === 'amigos' ? 'active' : ''}`}
                onClick={() => setSeccion('amigos')}
              >
                <i className="bi bi-people-fill me-2"></i> {esMiPropiaLista ? "Mis Amigos" : "Sus Amigos"}
                <span className="badge bg-light text-dark ms-auto">{amigos.length}</span>
              </button>

              {/* Solo mostramos la pestaña de solicitudes si es nuestra propia lista */}
              {esMiPropiaLista && (
                <button 
                  className={`nav-social-link ${seccion === 'solicitudes' ? 'active' : ''}`}
                  onClick={() => setSeccion('solicitudes')}
                >
                  <i className="bi bi-envelope-heart-fill me-2"></i> Solicitudes
                  {pendientes.length > 0 && (
                    <span className="badge rounded-pill bg-danger ms-auto">{pendientes.length}</span>
                  )}
                </button>
              )}

              <Link to={esMiPropiaLista ? `/perfil/${miSesion.idUsuario}` : `/perfil/${idUsuario}`} className="btn btn-outline-secondary w-100 rounded-pill mt-4 btn-sm">
                <i className="bi bi-arrow-left me-2"></i> Volver al perfil
              </Link>
            </div>
          </div>

          <div className="col-lg-9">
            {seccion === 'amigos' && (
              <div className="search-amigos-container">
                <i className="bi bi-search search-amigos-icon"></i>
                <input 
                  type="text" 
                  className="search-amigos-input" 
                  placeholder="Buscar en esta lista..." 
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            )}

            {seccion === 'solicitudes' && esMiPropiaLista ? (
              <section>
                <h3>Solicitudes Pendientes</h3>
                <hr className="mb-4" />
                {pendientes.length === 0 ? (
                  <div className="detalle-card p-5 text-center">
                    <p className="text-muted mb-0">No tienes peticiones por ahora.</p>
                  </div>
                ) : (
                  pendientes.map(sol => (
                    <div key={sol.id} className="amigo-item-card">
                      <img src={sol.usuario1.fotoPerfil || "/img/default-avatar.png"} className="amigo-avatar" alt="avatar" />
                      <div className="flex-grow-1">
                        <h5 className="mb-0">{sol.usuario1.nombreUsuario}</h5>
                        <span className="small text-muted">Te envió una solicitud</span>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn-add-vault btn-add-vault--leido py-1 px-3" onClick={() => gestionarAccion(sol.id, 'aceptar')}>Aceptar</button>
                        <button className="btn btn-outline-secondary rounded-pill btn-sm" onClick={() => gestionarAccion(sol.id, 'rechazar')}>Ignorar</button>
                      </div>
                    </div>
                  ))
                )}
              </section>
            ) : (
              <section>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3>{esMiPropiaLista ? "Mis Amigos" : `Amigos de ${usuarioPerfil?.nombreUsuario}`}</h3>
                  <span className="badge-tu-resena">Total: {amigos.length}</span>
                </div>
                
                {amigosFiltrados.length === 0 ? (
                  <div className="detalle-card p-5 text-center">
                    <p className="text-muted">No se han encontrado lectores en esta lista.</p>
                  </div>
                ) : (
                  amigosFiltrados.map(amigo => {
                    const estado = obtenerEstadoConexion(amigo.ultimaConexion);
                    return (
                      <div key={amigo.idUsuario} className="amigo-item-card">
                        <img src={amigo.fotoPerfil || "/img/default-avatar.png"} className="amigo-avatar" alt="avatar" />
                        <div className="flex-grow-1">
                          <h5 className="mb-0">{amigo.nombreUsuario}</h5>
                          <div className={`status-indicator ${estado.online ? "status-online" : "status-offline"}`}>
                            <span>{estado.texto}</span>
                          </div>
                        </div>
                        <Link to={`/perfil/${amigo.idUsuario}`} className="btn-add-vault py-1 px-3" style={{width: 'auto'}}>Ver Perfil</Link>
                      </div>
                    );
                  })
                )}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}