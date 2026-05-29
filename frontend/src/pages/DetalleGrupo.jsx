import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from '../apiConfig';
import Swal from 'sweetalert2';
import "../assets/css/detalleGrupo.css";

export default function DetalleGrupo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [grupo, setGrupo] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [estaUnido, setEstaUnido] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Estados para el Modal de Progreso
  const [showModalProgreso, setShowModalProgreso] = useState(false);
  const [errorProgreso, setErrorProgreso] = useState("");

  // Estados para el Modal de Cambiar Libro
  const [showModalLibro, setShowModalLibro] = useState(false);
  const [busquedaLibro, setBusquedaLibro] = useState("");
  const [resultadosLibros, setResultadosLibros] = useState([]);

  // Estados para controlar qué mensaje se está editando en el chat
  const [idMensajeEditando, setIdMensajeEditando] = useState(null);
  const [textoEditando, setTextoEditando] = useState("");

  const [progreso, setProgreso] = useState({ pagina: 0, total: 0, nota: "" });

  const sesion = JSON.parse(localStorage.getItem("usuario"));
  const token = localStorage.getItem("token");

  
  // Toast
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const toastTimeoutRef = useRef(null);

  const mostrarNotificacion = (texto, tipo) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setMensaje({ texto, tipo });
    toastTimeoutRef.current = setTimeout(() => {
      setMensaje({ texto: "", tipo: "" });
    }, 3000);
  };

  // Imagen de avatar por defecto si el usuario no tiene una establecida
  const FOTO_DEFECTO = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

  // Cargar datos del grupo y sus mensajes
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/comunidades/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setGrupo(data);

          setMensajes(data.mensajes || []);
          // Comprobar si el usuario actual está unido
          const unido = data.miembros?.some(
            (m) => m.usuario.idUsuario === sesion.idUsuario,
          );
          setEstaUnido(unido);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [id, token, sesion.idUsuario]);

  const manejarMembresia = async () => {
    // ESCUDO DE SEGURIDAD PARA EL ADMIN
    if (estaUnido && soyAdmin) {
      const cantidadMiembros = grupo.miembros?.length || 0;
      
      // Si hay más gente en el grupo, le prohibimos salir directamente
      if (cantidadMiembros > 1) {
        Swal.fire({
          title: "Acción denegada",
          text: "No puedes abandonar el club siendo el Administrador. Debes ceder el rol de admin a otro miembro antes de salir.",
          icon: "error",
          confirmButtonColor: "#7c4d3a"
        });
        return;
      }
    }

    const endpoint = estaUnido ? "salir" : "unirse";
    try {
      const res = await fetch(`${API_BASE_URL}/api/comunidades/${id}/${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idUsuario: sesion.idUsuario }),
      });

      if (res.ok) {
        const comunidadActualizada = await res.json();

        setGrupo(comunidadActualizada);
        setEstaUnido(!estaUnido);

        const esMiembro = comunidadActualizada.miembros?.some(
          (m) => m.usuario.idUsuario === sesion.idUsuario
        );
        setEstaUnido(esMiembro);

      } else {
        const errorText = await res.text();
        console.error("Error del servidor:", errorText);
      }
    } catch (error) {
      console.error("Error en la petición:", error);
    }
  };

  const handleEliminarGrupo = () => {
    Swal.fire({
      title: '¿Eliminar club de lectura?',
      text: "Esta acción borrará el grupo, los mensajes y el progreso de todos los miembros. ¡No se puede deshacer!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#7c4d3a',
      confirmButtonText: 'Sí, eliminar grupo'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/comunidades/${id}`, {
            method: "DELETE",
            headers: { 
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ idUsuario: sesion.idUsuario })
          });
          
          if (res.ok) {
            Swal.fire('Eliminado', 'El club ha sido borrado.', 'success');
            navigate('/comunidad');
          } else {
             const err = await res.text();
             console.error("Error al borrar:", err);
             Swal.fire('Error', 'No tienes permisos o hubo un problema.', 'error');
          }
        } catch (error) {
          Swal.fire('Error', 'No se pudo eliminar el grupo.', 'error');
        }
      }
    });
  };

  // APUNTA AL ENDPOINT DE BÚSQUEDA EXACTA
  const handleBuscarLibro = async (e) => {
    const texto = e.target.value;
    setBusquedaLibro(texto);

    if (texto.trim().length < 3) {
      setResultadosLibros([]);
      return;
    }

    try {
      const url = `${API_BASE_URL}/api/libros/buscar-exacto?q=${encodeURIComponent(texto.trim())}&pagina=1`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const librosEncontrados = await response.json();
        
        const librosLimpios = librosEncontrados.map(libro => ({
          idLibro: libro.idLibro || null, 
          titulo: libro.titulo || "Título desconocido",
          autor: libro.autor || "Autor desconocido", 
          portada: libro.fotoPortada || libro.portada || "https://via.placeholder.com/40x60?text=Sin+Foto",
          paginas: libro.paginas || libro.numPaginas || 0
        }));
        
        setResultadosLibros(librosLimpios);
      }
    } catch (error) {
      console.error("Error buscando libros con el filtro exacto:", error);
    }
  };

  const handleAbandonarGrupo = async () => {
    const miembros = grupo.miembros || [];
    const esUltimoMiembro = miembros.length === 1;

    if (esUltimoMiembro) {
      // Si es el último, pedir confirmación para eliminar todo el grupo
      const result = await Swal.fire({
        title: '¿Eres el último miembro?',
        text: "Al ser el único usuario, el grupo se eliminará automáticamente. ¿Continuar?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#7c4d3a',
        confirmButtonText: 'Sí, abandonar y eliminar grupo'
      });

      if (result.isConfirmed) {
        // Llamamos directamente a la lógica de eliminación total
        handleEliminarGrupo(); 
      }
    } else {
      // Si hay más miembros, ejecución normal de "salir"
      await ejecutarAbandonar();
    }
  };

  const ejecutarAbandonar = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/comunidades/${id}/salir`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idUsuario: sesion.idUsuario }),
      });

      if (res.ok) {
        // Redirigir al usuario fuera del grupo después de salir
        navigate('/comunidad');
      } else {
        Swal.fire('Error', 'No se pudo abandonar el grupo.', 'error');
      }
    } catch (error) {
      console.error("Error al abandonar:", error);
    }
  };

  // Función para confirmar el cambio de libro
  const confirmarCambioLibro = async (libroElegido) => {
    const totalPaginas = libroElegido.paginas || 0;
    const payload = libroElegido.idLibro
      ? { idLibro: libroElegido.idLibro }
      : {
          tituloLibro: libroElegido.titulo,
          autorLibro: libroElegido.autor,
          portadaLibro: libroElegido.portada,
          paginasLibro: totalPaginas,
          isbnLibro: libroElegido.isbn
        };

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/comunidades/${id}/cambiar-libro`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (res.ok) {
        const comunidadActualizada = await res.json();
        setGrupo(comunidadActualizada); 
        setShowModalLibro(false); 
        setBusquedaLibro(""); 
        setResultadosLibros([]);
      }
    } catch (error) {
      console.error("Error al cambiar de libro:", error);
    }
  };

  // Enviar un nuevo mensaje
  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/comunidades/${id}/mensajes`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idUsuario: sesion.idUsuario,
            contenido: nuevoMensaje,
          }),
        },
      );

      if (res.ok) {
        const mensajeGuardado = await res.json();
        setMensajes((prevMensajes) => [mensajeGuardado, ...prevMensajes]);
        setNuevoMensaje("");
      }
    } catch (error) {
      console.error("Error al enviar:", error);
    }
  };

  const handleBorrarMensaje = (idMensaje) => {
    Swal.fire({
      title: '¿Borrar comentario?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#7c4d3a',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/comunidades/mensajes/${idMensaje}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.ok) {
            setMensajes(mensajes.filter(m => m.idMensaje !== idMensaje));
            mostrarNotificacion("Comentario eliminado correctamente.", "success");
          } else {
            mostrarNotificacion("Error al eliminar el comentario.", "error");
          }
        } catch (error) {
          console.error("Error al borrar el mensaje:", error);
          mostrarNotificacion("Hubo un problema de conexión.", "error");
        }
      }
    });
  };

  const handleGuardarEdicion = async (idMensaje) => {
    if (!textoEditando.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/comunidades/mensajes/${idMensaje}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ contenido: textoEditando })
      });
      if (res.ok) {
        const msgActualizado = await res.json();
        setMensajes(mensajes.map(m => m.idMensaje === idMensaje ? msgActualizado : m));
        setIdMensajeEditando(null);
      }
    } catch (error) {
      console.error("Error al editar el mensaje:", error);
    }
  };

  // Controlador de cambio de página con validación semántica en tiempo real
  const handleCambioPagina = (e) => {
    const valor = parseInt(e.target.value) || 0;
    const maxPaginas = progreso.total;

    if (valor < 0) {
      setErrorProgreso("La página no puede ser menor que 0.");
    } else if (valor > maxPaginas) {
      setErrorProgreso(`No puedes superar las ${maxPaginas} páginas del libro.`);
    } else if (progreso.nota.length > 0 && progreso.nota.trim().length < 5) {
      setErrorProgreso("La nota o capítulo debe tener al menos 5 caracteres reales.");
    } else {
      setErrorProgreso(""); 
    }

    setProgreso({ ...progreso, pagina: e.target.value });
  };

  // Manejador del cambio de la nota opcional con validación de longitud mínima
  const handleCambioNota = (e) => {
    const texto = e.target.value;
    const valorPag = parseInt(progreso.pagina) || 0;

    if (texto.length > 0 && texto.trim().length < 5) {
      setErrorProgreso("La nota o capítulo debe tener al menos 5 caracteres reales.");
    } else if (valorPag < 0 || valorPag > progreso.total) {
      setErrorProgreso(`No puedes superar las ${progreso.total} páginas del libro.`);
    } else {
      setErrorProgreso("");
    }

    setProgreso({ ...progreso, nota: texto });
  };

  // Guardar progreso validado con Toast
  const guardarProgreso = async () => {
    if (errorProgreso || progreso.pagina === "") return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/comunidades/${id}/actualizar-progreso`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(progreso),
        },
      );

      if (res.ok) {
        const data = await res.json();
        setGrupo(data);
        setShowModalProgreso(false);

        // --- CAMBIO AQUÍ: Sustituimos el Swal.mixin por tu mostrarNotificacion ---
        mostrarNotificacion("Progreso guardado correctamente", "success");
      } else {
        mostrarNotificacion("Error al guardar el progreso", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarNotificacion("Error de conexión con el servidor", "error");
    }
  };

  if (cargando) {
    return (
      <div className="loader-container d-flex flex-column justify-content-center align-items-center text-center w-100" style={{ minHeight: "60vh" }}>
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
        <h4 className="loader-texto mt-5 text-muted fw-bold">Cargando club de lectura...</h4>
      </div>
    );
  }

  if (!grupo) {
    return (
      <div className="text-center w-100 py-5" style={{ minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <i className="bi bi-exclamation-circle display-1 text-muted mb-3 opacity-50"></i>
        <h4 className="text-muted fw-bold">Grupo no encontrado</h4>
        <p className="text-muted">El club de lectura que buscas no existe o ha sido eliminado.</p>
      </div>
    );
  }

  const miMembresia = grupo.miembros?.find(m => m.usuario.idUsuario === sesion.idUsuario);
  const soyAdmin = miMembresia?.rol === "admin";

  return (
    <div className="detalle-grupo-bg">
      {mensaje.texto && (
        <div className={`vault-toast vault-toast--${mensaje.tipo}`} style={{ zIndex: 9999 }}>
          {mensaje.texto}
        </div>
      )}
      {/* Cabecera Hero */}
      <header
        className="grupo-header"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.95)), url(${grupo.foto})`,
        }}
      >
        <div className="container h-100 d-flex flex-column justify-content-end pb-5">
          <div className="d-flex justify-content-between align-items-end">
            <div className="texto-header-container">
              <h1 className="display-3 fw-bold mb-0 titulo-comunidad">{grupo.nombre}</h1>
              <p className="lead mb-2">{grupo.descripcion}</p>
              
              <div className="d-flex align-items-center gap-2">
                <Link 
                  to={`/comunidad/${id}/miembros`} 
                  className="text-white text-decoration-none"
                  title="Ver lista de miembros"
                >
                  <i className="bi bi-people-fill me-2"></i>
                  {grupo.miembros?.length || 0} {grupo.miembros?.length === 1 ? "miembro" : "miembros"}
                </Link>
              </div>
            </div>

           <button
            className={`btn-membresia ${estaUnido ? "btn-salir" : "btn-unirse"}`}
            onClick={estaUnido ? handleAbandonarGrupo : manejarMembresia}
          >
            {estaUnido ? "Salir del grupo" : "¡Unirme!"}
          </button>
          </div>
        </div>
      </header>

      <div className="container content-wrapper">
        <div className="row g-5">
          {/* Columna Izquierda: Lectura Actual */}
          <div className="col-lg-4">
            <div className="card-lectura p-4 shadow-sm">
              <h5 className="fw-bold mb-4">
                <i className="bi bi-book me-2"></i>Lectura actual
              </h5>
              {grupo.libro ? (
                <div className="text-center">
                  <div 
                    onClick={() => navigate(`/libro/${grupo.libro.isbn}`)}
                    className="enlace-libro-detalle"
                    style={{ cursor: "pointer" }}
                    title={`Ver detalles de ${grupo.libro.titulo}`}
                  >
                    <img src={grupo.libro.fotoPortada} alt={grupo.libro.titulo} className="img-libro-detalle mb-3" />
                    <h4 className="mb-1 libro-clicable-titulo">{grupo.libro.titulo}</h4>
                    <p className="text-muted small mb-4">por {grupo.libro.autor}</p>
                  </div>

                  {/* Estadísticas de Lectura */}
                  <div className="progreso-lectura text-start p-3 rounded-4 mb-3 shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small text-muted">Progreso:</span>
                      {soyAdmin && (
                        <button className="btn btn-sm btn-outline-primary border-0" onClick={() => {
                          const maxPaginas = grupo.libro?.paginas || grupo.totalPaginas || 0;
                          setProgreso({ pagina: grupo.paginaActual || 0, total: maxPaginas, nota: grupo.notaProgreso || "" });
                          setErrorProgreso("");
                          setShowModalProgreso(true);
                        }}>
                          <i className="bi bi-pencil"></i>
                        </button>
                      )}
                    </div>
                    <h6 className="fw-bold mb-1">
                      Pág. {grupo.paginaActual || 0} / {grupo.libro?.paginas || grupo.totalPaginas || 0}
                    </h6>
                    <div className="mt-2 mb-3 p-2 border-start border-3 border-warning bg-light rounded-end">
                      <span className="small text-muted fst-italic d-block">
                        {grupo.notaProgreso ? `"${grupo.notaProgreso}"` : "Sin anotaciones en este capítulo todavía."}
                      </span>
                    </div>
                  </div>

                  {soyAdmin && (
                    <button className="btn-nueva-lectura w-100 mt-3" onClick={() => setShowModalLibro(true)}>
                      <i className="bi bi-journal-plus me-2"></i>Cambiar Lectura
                    </button>
                  )}
                  {soyAdmin && (
                    <button className="btn btn-outline-danger w-100 mt-3" onClick={handleEliminarGrupo}>
                      <i className="bi bi-trash-fill me-2"></i>Eliminar Grupo
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No hay lectura activa.</p>
                  {soyAdmin && (
                    <button className="btn-nueva-lectura w-100" onClick={() => setShowModalLibro(true)}>
                      Elegir Libro
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha: Chat / Muro */}
          <div className="col-lg-8">
            <div className="card-chat p-4 shadow-sm">
              <h5 className="fw-bold mb-4">Muro de la comunidad</h5>

              {/* Formulario de mensaje */}
              {estaUnido ? (
                <form onSubmit={enviarMensaje} className="mb-5">
                  <div className="d-flex gap-3">
                    <img
                      src={sesion.fotoPerfil || FOTO_DEFECTO}
                      alt="Tú"
                      className="rounded-circle"
                      style={{ width: "45px", height: "45px", objectFit: "cover" }}
                    />
                    <div className="flex-grow-1">
                      <textarea
                        className="form-control border-0 bg-light rounded-4 p-3"
                        placeholder="Comparte tus impresiones sobre la lectura..."
                        value={nuevoMensaje}
                        onChange={(e) => setNuevoMensaje(e.target.value)}
                        rows="2"
                      ></textarea>
                      <div className="text-end mt-2">
                        <button type="submit" className="btn btn-primary-vault px-4">
                          Publicar
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="alert alert-secondary text-center rounded-4 mb-5 shadow-sm border-0">
                  <i className="bi bi-lock-fill me-2 fs-5"></i>
                  <span>Debes <strong>unirte al club</strong> para poder participar en el chat.</span>
                </div>
              )}

              {/* Lista de mensajes */}
              <div className="mensajes-container">
                {mensajes.length > 0 ? (
                  mensajes.map((msg) => {
                    const esMio = msg.usuario.idUsuario == sesion.idUsuario;
                    const estaEditandoEste = idMensajeEditando === msg.idMensaje;
                    const esAdminGlobal = sesion.rol === "ADMIN" || sesion.rol === "admin";
                    const puedeBorrar = esMio || soyAdmin || esAdminGlobal;

                    return (
                      <div key={msg.idMensaje} className="mensaje-item d-flex gap-3 mb-4">
                        <img
                          src={msg.usuario.fotoPerfil || FOTO_DEFECTO}
                          alt={msg.usuario.nombreUsuario}
                          className="rounded-circle"
                          style={{ width: "45px", height: "45px", objectFit: "cover" }}
                        />
                        <div className="mensaje-contenido p-3 rounded-4 bg-light flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                              <span className="fw-bold me-2 mensaje-usuario">{msg.usuario.nombreUsuario}</span>
                              <small className="text-muted">{msg.fecha}</small>
                            </div>

                            {/* Botones de acción controlados por permisos */}
                            {(esMio || puedeBorrar) && (
                              <div className="d-flex gap-2">
                                {/* Editar solo si es suyo */}
                                {esMio && !estaEditandoEste && (
                                  <button 
                                    className="btn btn-sm btn-link text-secondary p-0 border-0"
                                    onClick={() => {
                                      setIdMensajeEditando(msg.idMensaje);
                                      setTextoEditando(msg.contenido);
                                    }}
                                  >
                                    <i className="bi bi-pencil-square"></i>
                                  </button>
                                )}
                                {/* Borrar si es suyo o es admin */}
                                {puedeBorrar && (
                                  <button 
                                    className="btn btn-sm btn-link text-danger p-0 border-0"
                                    onClick={() => handleBorrarMensaje(msg.idMensaje)}
                                  >
                                    <i className="bi bi-trash3"></i>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {estaEditandoEste ? (
                            <div className="mt-1">
                              <textarea
                                className="form-control form-control-sm rounded-3 mb-2"
                                value={textoEditando}
                                onChange={(e) => setTextoEditando(e.target.value)}
                                rows="2"
                              />
                              <div className="d-flex gap-2 justify-content-end">
                                <button className="btn btn-sm btn-secondary btn-cancelar-edicion rounded-3" onClick={() => setIdMensajeEditando(null)}>Cancelar</button>
                                <button className="btn btn-sm text-white btn-guardar-edicion rounded-3" style={{ backgroundColor: '#7c4d3a' }} onClick={() => handleGuardarEdicion(msg.idMensaje)}>Guardar</button>
                              </div>
                            </div>
                          ) : (
                            <p className="mb-0 text-secondary" style={{ whiteSpace: 'pre-wrap' }}>{msg.contenido}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-muted py-4">
                    No hay comentarios aún. ¡Sé el primero!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PARA CAMBIAR DE LIBRO */}
      {showModalLibro && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="bg-white p-4 rounded-4 shadow-lg" style={{ width: '100%', maxWidth: '500px' }}>
            <div className="d-flex justify-content-between mb-3">
              <h5 className="fw-bold m-0">Elegir nueva lectura</h5>
              <button className="btn-close" onClick={() => setShowModalLibro(false)}></button>
            </div>
            
            <div className="position-relative">
              <div className="input-group mb-2">
                <span className="input-group-text bg-light border-end-0"><i className="bi bi-search"></i></span>
                <input 
                  type="text" 
                  className="form-control border-start-0 bg-light" 
                  placeholder="Escribe título o autor..."
                  value={busquedaLibro}
                  onChange={handleBuscarLibro}
                />
              </div>

              {resultadosLibros.length > 0 && (
                <ul className="list-group position-absolute w-100 shadow mt-1 bg-white" style={{ zIndex: 1060, maxHeight: '250px', overflowY: 'auto' }}>
                  {resultadosLibros.map((libro, idx) => (
                    <li 
                      key={libro.idLibro || idx} 
                      className="list-group-item list-group-item-action d-flex align-items-center gap-3 p-2" 
                      onClick={() => confirmarCambioLibro(libro)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img src={libro.portada} alt="Portada" style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div>
                        <span className="fw-bold d-block text-dark" style={{ fontSize: '0.9rem' }}>{libro.titulo}</span>
                        <span className="text-muted small">{libro.autor}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <p className="text-muted small mt-3 mb-0">
              <i className="bi bi-info-circle me-1"></i> Al seleccionar un libro, el progreso del grupo se reiniciará a la página 0.
            </p>
          </div>
        </div>
      )}

      {/* MODAL PARA ACTUALIZAR PROGRESO */}
      {showModalProgreso && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="bg-white p-4 rounded-4 shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
            <div className="d-flex justify-content-between mb-3">
              <h5 className="fw-bold m-0">Actualizar progreso</h5>
              <button className="btn-close" onClick={() => setShowModalProgreso(false)}></button>
            </div>
            
            <div className="mb-3">
              <label className="form-label small fw-bold">Página actual</label>
              <div className="input-group">
                <input 
                  type="number" 
                  className={`form-control ${errorProgreso ? 'border-danger' : 'bg-light'}`} 
                  min="0"
                  max={progreso.total}
                  value={progreso.pagina}
                  onChange={handleCambioPagina}
                />
                <span className="input-group-text bg-light text-muted">de {progreso.total}</span>
              </div>
              {errorProgreso && (
                <div className="text-danger small fw-bold mt-1">
                  <i className="bi bi-exclamation-circle me-1"></i>{errorProgreso}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold">Nota o Capítulo (Opcional)</label>
              <input 
                type="text" 
                className="form-control bg-light" 
                placeholder="Ej: Capítulo 5 - La Revelación"
                maxLength="50"
                value={progreso.nota}
                onChange={handleCambioNota}
              />
            </div>
            
            <button 
              className="btn w-100 text-white fw-bold btn-guardar-progreso" 
              onClick={guardarProgreso}
              disabled={!!errorProgreso || progreso.pagina === ""}
            >
              Guardar progreso
            </button>
          </div>
        </div>
      )}
    </div>
  );
}