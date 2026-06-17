import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { API_BASE_URL } from '../apiConfig';
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
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Lógica para determinar si es mi propia lista o la de otro
  const esMiPropiaLista =
    !idUsuario || parseInt(idUsuario) === miSesion.idUsuario;
  const idABuscar = idUsuario || miSesion.idUsuario;

  useEffect(() => {
    cargarDatosSociales();
    // Si no es mi lista, cargamos los datos del dueño para el título
    if (!esMiPropiaLista) {
      fetch(`${API_BASE_URL}/api/usuarios/${idABuscar}`, { headers })
        .then((res) => res.json())
        .then((data) => setUsuarioPerfil(data));
    }
  }, [idUsuario]); // Recargar si cambia el ID en la URL

  const cargarDatosSociales = async () => {
    setCargando(true);
    try {
      //await new Promise(resolve => setTimeout(resolve, 3000));
      // Las solicitudes solo se cargan si es MI lista
      if (esMiPropiaLista) {
        const resPen = await fetch(
          `${API_BASE_URL}/api/amistades/pendientes/${miSesion.idUsuario}`,
          { headers },
        );
        const dataPen = await resPen.json();
        setPendientes(dataPen);
      }

      // La lista de amigos se carga para cualquier ID
      const resAmi = await fetch(
        `${API_BASE_URL}/api/amistades/lista/${idABuscar}`,
        { headers },
      );
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

  const gestionarAccion = async (id, accion) => {
    const endpoint = accion === "aceptar" ? "aceptar" : "rechazar";
    const metodo = accion === "aceptar" ? "PUT" : "DELETE";

    const res = await fetch(
      `${API_BASE_URL}/api/amistades/${endpoint}/${id}`,
      {
        method: metodo,
        headers: headers,
      },
    );

    if (res.ok){
      setPendientes(pendientes.filter(sol => sol.id !== id));
    if (accion === "aceptar") {
        cargarDatosSociales();
      }
    }
  };

  const amigosFiltrados = amigos.filter((a) =>
    a.nombreUsuario.toLowerCase().includes(busqueda.toLowerCase()),
  );

  if (cargando) {
    return (
      <div className="loader-container d-flex flex-column justify-content-center align-items-center text-center w-100" style={{ minHeight: "80vh" }}>
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
    );
  }

  return (
    <div className="tus-amigos-bg py-5">
      <div className="container-custom">
        <div className="row g-4">
          <div className="col-lg-3">
            <div className="social-sidebar">
              <h5 className="mb-4">
                {esMiPropiaLista
                  ? "Tu bóveda social"
                  : `Bóveda de ${usuarioPerfil?.nombreUsuario}`}
              </h5>

              <button
                className={`nav-social-link ${seccion === "amigos" ? "active" : ""}`}
                onClick={() => setSeccion("amigos")}
              >
                <i className="bi bi-people-fill me-2"></i>{" "}
                {esMiPropiaLista ? "Mis amigos" : "Sus amigos"}
                <span className="badge bg-light text-dark ms-auto">
                  {amigos.length}
                </span>
              </button>

              {/* Solo mostramos la pestaña de solicitudes si es nuestra propia lista */}
              {esMiPropiaLista && (
                <button
                  className={`nav-social-link ${seccion === "solicitudes" ? "active" : ""}`}
                  onClick={() => setSeccion("solicitudes")}
                >
                  <i className="bi bi-envelope-heart-fill me-2"></i> Solicitudes
                  {pendientes.length > 0 && (
                    <span className="badge rounded-pill bg-danger ms-auto">
                      {pendientes.length}
                    </span>
                  )}
                </button>
              )}

              <Link
                to={
                  esMiPropiaLista
                    ? `/perfil/${miSesion.idUsuario}`
                    : `/perfil/${idUsuario}`
                }
                className="btn btn-volver-perfil w-100 rounded-pill mt-4 btn-sm"
              >
                <i className="bi bi-arrow-left me-2"></i> Volver al perfil
              </Link>
            </div>
          </div>

          <div className="col-lg-9">
            {seccion === "amigos" && (
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

            {seccion === "solicitudes" && esMiPropiaLista ? (
              <section>
                <h3>Solicitudes pendientes</h3>
                <hr className="mb-4" />
                {pendientes.length === 0 ? (
                  <div className="detalle-card p-5 text-center">
                    <p className="text-muted mb-0">
                      No tienes peticiones por ahora.
                    </p>
                  </div>
                ) : (
                  pendientes.map((sol) => (
                    <div key={sol.id} className="amigo-item-card">
                      <img
                        src={
                          sol.usuario1.fotoPerfil || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        }
                        className="amigo-avatar"
                        alt="avatar"
                      />
                      <div className="flex-grow-1">
                        <h5 className="mb-0">{sol.usuario1.nombreUsuario}</h5>
                        <span className="small text-muted">
                          Te envió una solicitud
                        </span>
                      </div>
                      <div className="d-flex gap-2 align-items-center" style={{ whiteSpace: 'nowrap' }}>
                        {/* Botón Aceptar */}
                        <button
                          className="btn-add-vault btn-add-vault--leido py-1 px-3"
                          onClick={() => gestionarAccion(sol.id, "aceptar")}
                        >
                          Aceptar
                        </button>
                        {/* Botón Ignorar */}
                        <button
                          className="btn btn-outline-secondary rounded-pill btn-sm py-1 px-3"
                          onClick={() => gestionarAccion(sol.id, "rechazar")}
                        >
                          Ignorar
                        </button>
                        {/* Botón Ver Perfil */}
                        <Link
                          to={`/perfil/${sol.usuario1.idUsuario}`}
                          className="btn-add-vault btn-ver-perfil py-1 px-3"
                          style={{ textDecoration: 'none', width: 'auto' }}
                        >
                          Ver Perfil
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </section>
            ) : (
              <section>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3>
                    {esMiPropiaLista
                      ? "Mis amigos"
                      : `Amigos de ${usuarioPerfil?.nombreUsuario}`}
                  </h3>
                  <span className="badge-tu-resena">
                    Total: {amigos.length}
                  </span>
                </div>

                {amigosFiltrados.length === 0 ? (
                  <div className="detalle-card p-5 text-center">
                    <p className="text-muted">
                      No se han encontrado lectores en esta lista.
                    </p>
                  </div>
                ) : (
                  amigosFiltrados.map((amigo) => {
                    const estado = obtenerEstadoConexion(amigo.ultimaConexion);
                    return (
                      <div key={amigo.idUsuario} className="amigo-item-card">
                        <img
                          src={amigo.fotoPerfil || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                          className="amigo-avatar"
                          alt="avatar"
                        />
                        <div className="flex-grow-1">
                          <h5 className="mb-0">{amigo.nombreUsuario}</h5>
                          <div className={`status-indicator small ${estado.online ? "text-success fw-bold" : "status-offline"}`}>
                            {estado.online && (
                              <i className="bi bi-circle-fill me-1" style={{ fontSize: "0.4rem", verticalAlign: "middle" }}></i>
                            )}
                            <span>{estado.texto}</span>
                          </div>
                        </div>

                        <Link to={`/perfil/${amigo.idUsuario}`} className="btn-add-vault btn-ver-perfil py-1 px-3" style={{width: 'auto'}}>Ver Perfil</Link>
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
