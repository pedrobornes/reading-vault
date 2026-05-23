import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Swal from 'sweetalert2';
import "../assets/css/detalleGrupo.css";

export default function DetalleGrupo() {
  const { id } = useParams();
  const [grupo, setGrupo] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [estaUnido, setEstaUnido] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Estados para el Modal de Progreso
  const [showModalProgreso, setShowModalProgreso] = useState(false);

  // Estados para el Modal de Cambiar Libro
  const [showModalLibro, setShowModalLibro] = useState(false);
  const [busquedaLibro, setBusquedaLibro] = useState("");
  const [resultadosLibros, setResultadosLibros] = useState([]);

  // Estados para controlar qué mensaje se está editando en el chat
  const [idMensajeEditando, setIdMensajeEditando] = useState(null);
  const [textoEditando, setTextoEditando] = useState("");

  const sesion = JSON.parse(localStorage.getItem("usuario"));
  const token = localStorage.getItem("token");

  // Cargar datos del grupo y sus mensajes
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/comunidades/${id}`, {
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
    const endpoint = estaUnido ? "salir" : "unirse";
    try {
      const res = await fetch(
        `http://localhost:8080/api/comunidades/${id}/${endpoint}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idUsuario: sesion.idUsuario }),
        },
      );

      if (res.ok) {
        // Recibimos la comunidad actualizada directamente del backend
        const comunidadActualizada = await res.json();

        // Usamos una función de actualización para asegurar que React vea el cambio
        setGrupo((prev) => ({ ...comunidadActualizada }));
        setEstaUnido(!estaUnido);

        console.log(
          "Nuevo número de miembros:",
          comunidadActualizada.miembros?.length,
        );
      } else {
        const errorText = await res.text();
        console.error("Error del servidor:", errorText);
      }
    } catch (error) {
      console.error("Error en la petición:", error);
    }
  };

  const handleBuscarLibro = async (e) => {
    const texto = e.target.value;
    setBusquedaLibro(texto);

    if (texto.length < 3) {
      setResultadosLibros([]);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/comunidades/buscar-libro-externo?q=${encodeURIComponent(texto)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (response.ok) {
        const dataGoogle = await response.json();
        
        if (dataGoogle.items) {
          const librosLimpios = dataGoogle.items.map(item => {
            const info = item.volumeInfo;
            return {
              titulo: info.title || "Título desconocido",
              
              autor: info.authors ? info.authors[0] : "Autor desconocido", 
              portada: info.imageLinks ? info.imageLinks.thumbnail : "https://via.placeholder.com/40x60?text=Sin+Foto",
              paginas: info.pageCount || 0
            };
          });
          
          setResultadosLibros(librosLimpios);
        } else {
          setResultadosLibros([]); // No se encontró nada
        }
      }
    } catch (error) {
      console.error("Error buscando libros por nuestra cuenta:", error);
    }
  };

  // Función para confirmar el cambio de libro
  const confirmarCambioLibro = async (libroElegido) => {
    const totalPaginas = libroElegido.paginas || libroElegido.numPaginas || libroElegido.pageCount || 0;
    // Si viene de Google Books, no tiene idLibro, le pasamos los datos para que el backend lo cree (como hicimos en crear grupo)
    const payload = libroElegido.idLibro
      ? { idLibro: libroElegido.idLibro }
      : {
          tituloLibro: libroElegido.titulo,
          autorLibro: libroElegido.autor,
          portadaLibro: libroElegido.portada || libroElegido.fotoPortada,
          paginasLibro: totalPaginas 
        };

    try {
      const res = await fetch(
        `http://localhost:8080/api/comunidades/${id}/cambiar-libro`,
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
        setGrupo(comunidadActualizada); // Actualizamos la vista al instante
        setShowModalLibro(false); // Cerramos el modal
        setBusquedaLibro(""); // Limpiamos el buscador
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
        `http://localhost:8080/api/comunidades/${id}/mensajes`,
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
        // El backend nos devuelve SOLO el mensaje que acabamos de crear
        const mensajeGuardado = await res.json();

        // Lo colocamos el primero de la lista conservando los que ya teníamos
        setMensajes((prevMensajes) => [mensajeGuardado, ...prevMensajes]);
        
        // Limpiamos el cuadro de texto para poder seguir escribiendo
        setNuevoMensaje("");
      }
    } catch (error) {
      console.error("Error al enviar:", error);
    }
  };

  const handleBorrarMensaje = (idMensaje) => {
    // Lanzamos el SweetAlert
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
          const res = await fetch(`http://localhost:8080/api/comunidades/mensajes/${idMensaje}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.ok) {
            // Lo eliminamos de la lista en React
            setMensajes(mensajes.filter(m => m.idMensaje !== idMensaje));
            
            //  mini alert de éxito que desaparece solo en 1.5 segundos
            Swal.fire({
              title: '¡Borrado!',
              text: 'Tu comentario ha desaparecido.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
          }
        } catch (error) {
          console.error("Error al borrar el mensaje:", error);
          Swal.fire('Error', 'Hubo un problema de conexión al borrar.', 'error');
        }
      }
    });
  };

  const handleGuardarEdicion = async (idMensaje) => {
    if (!textoEditando.trim()) return;
    try {
      const res = await fetch(`http://localhost:8080/api/comunidades/mensajes/${idMensaje}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ contenido: textoEditando })
      });
      if (res.ok) {
        const msgActualizado = await res.json();
        // Actualizamos el mensaje editado dentro del array conservando el orden
        setMensajes(mensajes.map(m => m.idMensaje === idMensaje ? msgActualizado : m));
        setIdMensajeEditando(null);
      }
    } catch (error) {
      console.error("Error al editar el mensaje:", error);
    }
  };

  // Dentro del componente DetalleGrupo
  const [showModal, setShowModal] = useState(false);
  const [progreso, setProgreso] = useState({ pagina: 0, total: 0, nota: "" });

  const guardarProgreso = async () => {
    const res = await fetch(
      `http://localhost:8080/api/comunidades/${id}/actualizar-progreso`,
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
      setShowModal(false);
    }
  };

  if (cargando)
    return <div className="text-center py-5">Cargando club de lectura...</div>;
  if (!grupo)
    return <div className="text-center py-5">Grupo no encontrado.</div>;

  const miMembresia = grupo.miembros?.find(m => m.usuario.idUsuario === sesion.idUsuario);
  const soyAdmin = miMembresia?.rol === "admin";


  return (
    <div className="detalle-grupo-bg">
      {/* Cabecera Hero */}
      <header
        className="grupo-header"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.95)), url(${grupo.foto})`,
        }}
      >
        <div className="container h-100 d-flex flex-column justify-content-end pb-5">
          <div className="d-flex justify-content-between align-items-end">
            <div className="text-white">
              <h1 className="display-3 fw-bold mb-0 titulo-comunidad">{grupo.nombre}</h1>
              <p className="lead opacity-75 mb-2">{grupo.descripcion}</p>
              <div className="d-flex align-items-center gap-2 opacity-90">
                <i className="bi bi-people-fill"></i>
                <span>
                  {grupo.miembros ? grupo.miembros.length : 0} lectores en este
                  club
                </span>
              </div>
            </div>
            <button
              className={`btn-membresia ${estaUnido ? "btn-salir" : "btn-unirse"}`}
              onClick={manejarMembresia}
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
                  <img src={grupo.libro.fotoPortada} alt="Libro" className="img-libro-detalle mb-3" />
                  <h4 className="mb-1">{grupo.libro.titulo}</h4>
                  <p className="text-muted small mb-4">por {grupo.libro.autor}</p>

                  {/* Estadísticas de Lectura (El lápiz ya está protegido) */}
                  <div className="progreso-lectura text-start p-3 rounded-4 mb-3 shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small text-muted">Progreso:</span>
                      {soyAdmin && (
                        <button className="btn btn-sm btn-outline-primary border-0" onClick={() => {
                          setProgreso({ pagina: grupo.paginaActual || 0, total: grupo.libro?.paginas || grupo.totalPaginas || 0, nota: grupo.notaProgreso || "" });
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

                  {/* BOTÓN 1: Cuando SÍ hay un libro leyendo */}
                  {soyAdmin && (
                    <button className="btn-nueva-lectura w-100 mt-3" onClick={() => setShowModalLibro(true)}>
                      <i className="bi bi-journal-plus me-2"></i>Cambiar Lectura
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No hay lectura activa.</p>
                  
                  {/* BOTÓN 2: Cuando NO hay ningún libro (¡Este se suele olvidar!) */}
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
                      src={sesion.fotoPerfil}
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

                    return (
                      <div key={msg.idMensaje} className="mensaje-item d-flex gap-3 mb-4">
                        <img
                          src={msg.usuario.fotoPerfil}
                          alt={msg.usuario.nombreUsuario}
                          className="rounded-circle"
                          style={{ width: "45px", height: "45px", objectFit: "cover" }}
                        />
                        <div className="mensaje-contenido p-3 rounded-4 bg-light flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                              <span className="fw-bold me-2 mensaje-usuario">
                                {msg.usuario.nombreUsuario}
                              </span>
                              <small className="text-muted">{msg.fecha}</small>
                            </div>

                            {/* Mostrar botones de editar/borrar solo si el mensaje es del usuario logueado */}
                            {esMio && !estaEditandoEste && (
                              <div className="d-flex gap-2">
                                <button 
                                  className="btn btn-sm btn-link text-secondary p-0 border-0"
                                  onClick={() => {
                                    setIdMensajeEditando(msg.idMensaje);
                                    setTextoEditando(msg.contenido);
                                  }}
                                >
                                  <i className="bi bi-pencil-square"></i>
                                </button>
                                <button 
                                  className="btn btn-sm btn-link text-danger p-0 border-0"
                                  onClick={() => handleBorrarMensaje(msg.idMensaje)}
                                >
                                  <i className="bi bi-trash3"></i>
                                </button>
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
                                <button className="btn btn-sm btn-secondary rounded-3" onClick={() => setIdMensajeEditando(null)}>
                                  Cancelar
                                </button>
                                <button className="btn btn-sm text-white rounded-3" style={{ backgroundColor: '#7c4d3a' }} onClick={() => handleGuardarEdicion(msg.idMensaje)}>
                                  Guardar
                                </button>
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

              {/* Resultados desplegables */}
              {resultadosLibros.length > 0 && (
                <ul className="list-group position-absolute w-100 shadow mt-1 bg-white" style={{ zIndex: 1060, maxHeight: '250px', overflowY: 'auto' }}>
                  {resultadosLibros.map(libro => (
                    <li 
                      key={libro.idLibro || Math.random()} 
                      className="list-group-item list-group-item-action d-flex align-items-center gap-3 p-2" 
                      onClick={() => confirmarCambioLibro(libro)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img src={libro.portada || libro.fotoPortada} alt="Portada" style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
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
                  className="form-control bg-light" 
                  min="0"
                  value={progreso.pagina}
                  onChange={(e) => setProgreso({...progreso, pagina: e.target.value})}
                />
                <span className="input-group-text bg-light text-muted">de {progreso.total}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold">Nota o Capítulo (Opcional)</label>
              <input 
                type="text" 
                className="form-control bg-light" 
                placeholder="Ej: Capítulo 5 - La Revelación"
                maxLength="50"
                value={progreso.nota}
                onChange={(e) => setProgreso({...progreso, nota: e.target.value})}
              />
            </div>
            
            <button className="btn w-100 text-white fw-bold" style={{ backgroundColor: '#7c4d3a' }} onClick={guardarProgreso}>
              Guardar progreso
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
