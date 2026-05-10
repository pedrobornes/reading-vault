import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../assets/css/detalleLibro.css'; 

export default function DetalleLibro() {
  const { isbn } = useParams();
  const location = useLocation();
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const mostrarNotificacion = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
  };
  
  // Estados principales
  const [libro, setLibro] = useState(location.state?.libro || null);
  const [cargando, setCargando] = useState(!libro);
  const [sinopsisExpandida, setSinopsisExpandida] = useState(false);
  const [showMenuVault, setShowMenuVault] = useState(false); // Estado para el menú desplegable
  const [estanteriaActual, setEstanteriaActual] = useState(null); // Estado del Vault
  
  // Estados de interacción
  const [escribiendo, setEscribiendo] = useState(false);
  const [textoResena, setTextoResena] = useState("");
  const [resenasComunidad, setResenasComunidad] = useState([]);
  const [miVoto, setMiVoto] = useState(0);
  const [hoverVoto, setHoverVoto] = useState(0);

  const usuarioSesion = JSON.parse(localStorage.getItem("usuario"));

  const renderEstrellas = (rating) => {
    const estrellas = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        estrellas.push(<i key={i} className="bi bi-star-fill"></i>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        estrellas.push(<i key={i} className="bi bi-star-half"></i>);
      } else {
        estrellas.push(<i key={i} className="bi bi-star text-muted"></i>);
      }
    }
    return estrellas;
  };

  const borrarResena = async () => {
    try {
      await axios.post('http://localhost:8080/api/reviews/borrar-comentario', {
        idUsuario: usuarioSesion.idUsuario,
        idLibro: libro.idLibro
      });
      setTextoResena("");
      mostrarNotificacion("Reseña eliminada", "success");
      cargarDatosYVoto();
    } catch (err) {
      mostrarNotificacion("Error al borrar", "error");
    }
  };

  const cargarDatosYVoto = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/libros/buscar-unico?isbn=${isbn}`
      );
      
      let libroData = res.data;

      if (libroData) {
        setLibro(libroData); 

        // Se ejecuta en segundo plano (sin 'await') para no frenar la carga de la pantalla
        if (libroData.isbn) {
          axios.post('http://localhost:8080/api/libros/sincronizar', libroData)
               .catch(err => console.log("El libro ya existe o hubo un fallo silencioso"));
        }
        // ----------------------------------

      } else {
        libroData = libro;
      }

      if (libroData?.idLibro) {
        const resResenas = await axios.get(`http://localhost:8080/api/reviews/libro/${libroData.idLibro}`);
        setResenasComunidad(resResenas.data || []);

        if (usuarioSesion) {
          // Cargar voto y reseña
          try {
            const resVoto = await axios.get(
              `http://localhost:8080/api/reviews/usuario/${usuarioSesion.idUsuario}/libro/${libroData.idLibro}`
            );
            if (resVoto.data) {
              setMiVoto(resVoto.data.puntuacion);
              setTextoResena(resVoto.data.contenido || "");
            }
          } catch (e) { console.log("Sin voto previo"); }

          // Cargar estado en el Vault (Biblioteca)
          try {
            const token = localStorage.getItem("token");
            const resVault = await axios.get(
              `http://localhost:8080/api/bibliotecas/estado?idUsuario=${usuarioSesion.idUsuario}&titulo=${encodeURIComponent(libroData.titulo)}&autor=${encodeURIComponent(libroData.autor)}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (resVault.data?.nombreEstanteria) {
              setEstanteriaActual(resVault.data.nombreEstanteria);
            }
          } catch (e) { console.log("No está en la biblioteca"); }
        }
      }
    } catch (err) {
      console.error("Error en la carga:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosYVoto();
  }, [isbn]);

  const manejarCambioVault = async (nombreEstanteria) => {
    if (!usuarioSesion) {
      mostrarNotificacion("Debes iniciar sesión", "error");
      return;
    }

    const payload = {
      idUsuario: usuarioSesion.idUsuario,
      nombreEstanteria: nombreEstanteria,
      libro: {
        ...libro,
        isbn: isbn,
        portada: libro.portada || libro.fotoPortada,
        description: libro.descripcion || "Sin descripción disponible."
      },
    };

    try {
      const response = await fetch(`http://localhost:8080/api/bibliotecas/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setEstanteriaActual(nombreEstanteria);
        setShowMenuVault(false);
        mostrarNotificacion(`Libro movido a ${nombreEstanteria}`, "success");
        await cargarDatosYVoto();
      }
    } catch (error) {
      mostrarNotificacion("Error al actualizar el Vault", "error");
    }
  };

  const eliminarDeBiblioteca = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/bibliotecas/remove?idUsuario=${usuarioSesion.idUsuario}&titulo=${encodeURIComponent(libro.titulo)}&autor=${encodeURIComponent(libro.autor)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.ok) {
        setEstanteriaActual(null);
        setShowMenuVault(false);
        mostrarNotificacion("Libro eliminado del Vault", "success");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const manejarVoto = async (puntuacion) => {
    if (!usuarioSesion) {
      mostrarNotificacion("Debes iniciar sesión para votar", "error");
      return;
    }

    try {
      const libroParaEnviar = { ...libro, isbn: isbn };
      await axios.post('http://localhost:8080/api/reviews/votar', {
        idUsuario: usuarioSesion.idUsuario,
        puntuacion: puntuacion,
        libro: libroParaEnviar 
      });

      setMiVoto(puntuacion);
      await cargarDatosYVoto();
      mostrarNotificacion("¡Puntuación guardada!", "success");
    } catch (err) {
      mostrarNotificacion("No se pudo registrar el voto", "error");
    }
  };

  const enviarResena = async () => {
    if (!libro?.idLibro) {
      mostrarNotificacion("Vota primero para habilitar la reseña", "error");
      return;
    }

    try {
      await axios.post('http://localhost:8080/api/reviews/resenar', {
        idUsuario: usuarioSesion.idUsuario,
        idLibro: libro.idLibro,
        contenido: textoResena
      });
      setEscribiendo(false);
      mostrarNotificacion("¡Reseña publicada!", "success");
      cargarDatosYVoto(); 
    } catch (err) {
      mostrarNotificacion("Error al guardar el comentario", "error");
    }
  };

  const getClaseBoton = () => {
    if (estanteriaActual === "Pendiente") return "btn-add-vault--pendiente";
    if (estanteriaActual === "Leyendo") return "btn-add-vault--leyendo";
    if (estanteriaActual === "Leído") return "btn-add-vault--leido";
    return ""; 
  };

  if (cargando) return <div className="text-center py-5"><h3>Cargando sabiduría...</h3></div>;
  if (!libro) return null;

  const descripcionCompleta = libro.descripcion || "Sin descripción disponible.";
  const sinopsisCorta = descripcionCompleta.length > 300 ? descripcionCompleta.substring(0, 300) + "..." : descripcionCompleta;

return (
    <>
      {mensaje.texto && (
        <div className={`vault-toast vault-toast--${mensaje.tipo}`}>
          <i className={`bi bi-${mensaje.tipo === "success" ? "check-circle" : "exclamation-triangle"}-fill me-2`}></i>
          {mensaje.texto}
        </div>
      )}

      {/* --- SECCIÓN SUPERIOR --- */}
      <section className="detalle-top-bg py-5">
        <div className="container-custom">
          <div className="row">
            <div className="col-md-4 col-lg-3 text-center mb-4">
              <img 
                src={libro.portada || libro.fotoPortada || "https://via.placeholder.com/300x450?text=Sin+Portada"} 
                alt={libro.titulo} 
                className="detalle-portada shadow-lg mb-4 img-fluid" 
              />
              
              <div className="libro-card__acciones acciones-detalle mb-4">
                <button
                  className={`btn-add-vault w-100 ${getClaseBoton()}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenuVault(!showMenuVault);
                  }}
                >
                  {estanteriaActual ? estanteriaActual : "Añadir a mi Vault"}
                  <i className={`bi bi-chevron-${showMenuVault ? "up" : "down"} ms-2`}></i>
                </button>

                {showMenuVault && (
                  <div className="menu-desplegable" style={{ display: 'block' }}>
                    <div className="menu-desplegable__item" onClick={() => manejarCambioVault("Pendiente")}>
                      <i className="bi bi-clock me-2 text-warning"></i> Pendiente
                    </div>
                    <div className="menu-desplegable__item" onClick={() => manejarCambioVault("Leyendo")}>
                      <i className="bi bi-book-half me-2 text-primary"></i> Leyendo
                    </div>
                    <div className="menu-desplegable__item" onClick={() => manejarCambioVault("Leído")}>
                      <i className="bi bi-check-circle-fill me-2 text-success"></i> Leído
                    </div>
                    {estanteriaActual && (
                      <div className="menu-desplegable__item menu-desplegable__item--eliminar" onClick={eliminarDeBiblioteca}>
                        <i className="bi bi-trash3 me-2"></i> Eliminar del Vault
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="voto-interactivo-card">
                <p>Tu puntuación</p>
                <div className="estrellas-selector d-flex justify-content-center mb-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <i
                      key={num}
                      className={`bi bi-star${num <= (hoverVoto || miVoto) ? '-fill' : ''}`}
                      onMouseEnter={() => setHoverVoto(num)}
                      onMouseLeave={() => setHoverVoto(0)}
                      onClick={() => manejarVoto(num)}
                    ></i>
                  ))}
                </div>
                {miVoto === 0 && <p className="small text-muted mb-0" style={{fontSize: '0.7rem'}}>Vota para habilitar la reseña</p>}
              </div>

              <div className="detalle-rating text-muted mt-4">
                <p className="mb-1 small">Valoración global</p>
                <div className="estrellas mb-1">{renderEstrellas(libro.valoracion || 0)}</div>
                <div className="small">
                  <strong>{(libro.valoracion || 0).toFixed(1)}</strong> / 5
                  <br />
                  ({(libro.votos || 0).toLocaleString()} votos)
                </div>
              </div>
            </div>

            <div className="col-md-8 col-lg-9 d-flex flex-column gap-4">
              <div className="detalle-card p-4 text-center">
                <h1 className="detalle-titulo">{libro.titulo}</h1>
                <h3 className="detalle-autor mb-4 text-muted">{libro.autor}</h3>
                <p className="detalle-stats mb-0">
                  <strong>Páginas:</strong> {libro.paginas || 'N/A'} | <strong>Publicación:</strong> {libro.fechaPublicacion || 'Desconocida'}
                </p>
              </div>

              <div className="detalle-card p-4">
                <h5 className="fw-bold">Sinopsis</h5>
                <div className="detalle-texto mb-1">
                  {sinopsisExpandida ? descripcionCompleta : sinopsisCorta}
                </div>
                {descripcionCompleta.length > 300 && (
                  <button className="btn-mas p-0 border-0 bg-transparent text-primary" onClick={() => setSinopsisExpandida(!sinopsisExpandida)}>
                    {sinopsisExpandida ? "Ver menos ▲" : "Leer más ▼"}
                  </button>
                )}
                <hr />
                <p className="mb-0"><strong>Géneros:</strong> {libro.generos || "General"}</p>
                {libro.isbn && <p className="mt-2 small text-muted"><strong>ISBN:</strong> {libro.isbn}</p>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN RESEÑAS --- */}
      <section className="detalle-reviews-bg py-5">
        <div className="container-custom" style={{ maxWidth: '800px' }}>
          
          {/* EDITOR INTEGRADO: Desaparece si hay reseña y no estamos editando */}
          {usuarioSesion && miVoto > 0 && (escribiendo || !resenasComunidad.some(r => r.usuario.idUsuario === usuarioSesion.idUsuario && r.contenido)) && (
            <div className="seccion-escribir-resena mb-5">
              <h4>{escribiendo ? "Actualizar mi opinión" : "Escribe una reseña"}</h4>
              <textarea 
                className="steam-textarea"
                placeholder="Dinos qué te ha parecido..."
                value={textoResena}
                onChange={(e) => setTextoResena(e.target.value)}
                autoFocus={escribiendo}
              />
              <div className="steam-acciones">
                {escribiendo && (
                   <button className="btn-steam" style={{backgroundColor: '#6c757d', color: 'white'}} onClick={() => setEscribiendo(false)}>
                     Cancelar
                   </button>
                )}
                <button className="btn-steam btn-steam-publicar" onClick={enviarResena}>
                  {escribiendo ? "Guardar cambios" : "Publicar reseña"}
                </button>
              </div>
            </div>
          )}

          <h2 className="text-center mb-5 detalle-titulo-seccion">Opiniones de la comunidad</h2>
          
          <div className="d-flex flex-column gap-4">
            
            {/* TU RESEÑA DESTACADA */}
            {resenasComunidad
              .filter(r => r.usuario.idUsuario === usuarioSesion?.idUsuario && r.contenido)
              .map(resena => (
                !escribiendo && (
                  <div key={resena.idReview} className="review-card review-card--propia p-4 shadow-sm border-0 bg-white">
                    
                    <div className="mis-acciones-review">
                        <button className="btn-accion-steam" onClick={() => setEscribiendo(true)} title="Editar">
                            <i className="bi bi-pencil-square"></i>
                        </button>
                        <button className="btn-accion-steam" onClick={borrarResena} title="Borrar">
                            <i className="bi bi-trash3"></i>
                        </button>
                    </div>

                    <div className="review-user text-center">
                      <span className="badge-tu-resena mb-2 d-inline-block">Tu opinión</span>
                      {resena.usuario.fotoPerfil ? (
                        <img src={resena.usuario.fotoPerfil} alt="Tú" className="review-avatar mb-2" />
                      ) : (
                        <div className="avatar-placeholder mb-2">{resena.usuario.nombre.charAt(0).toUpperCase()}</div>
                      )}
                      <h5 className="mb-0">{resena.usuario.nombre}</h5>
                    </div>

                    <div className="review-content p-3">
                      <div className="estrellas mb-2">{renderEstrellas(resena.puntuacion)}</div>
                      <p className="mb-0 text-muted">{resena.contenido}</p>
                      <small className="text-muted d-block mt-2">{resena.fecha}</small>
                    </div>
                  </div>
                )
              ))}

            {/* RESEÑAS DE OTROS */}
            {resenasComunidad
              .filter(r => r.usuario.idUsuario !== usuarioSesion?.idUsuario && r.contenido)
              .map((resena) => (
                <div key={resena.idReview} className="review-card p-4 shadow-sm border-0 bg-white">
                  <div className="review-user text-center">
                    {resena.usuario.fotoPerfil ? (
                      <img src={resena.usuario.fotoPerfil} alt={resena.usuario.nombre} className="review-avatar mb-2" />
                    ) : (
                      <div className="avatar-placeholder mb-2">{resena.usuario.nombre.charAt(0).toUpperCase()}</div>
                    )}
                    <h5 className="mb-0">{resena.usuario.nombre}</h5>
                  </div>
                  <div className="review-content p-3">
                    <div className="estrellas mb-2">{renderEstrellas(resena.puntuacion)}</div>
                    <p className="mb-0 text-muted">{resena.contenido}</p>
                    <small className="text-muted d-block mt-2">{resena.fecha}</small>
                  </div>
                </div>
              ))}

            {!resenasComunidad.some(r => r.contenido) && !escribiendo && (
              <div className="text-center p-5 bg-white rounded-pill shadow-sm">
                <p className="text-muted mb-0">Nadie ha escrito una reseña todavía.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}