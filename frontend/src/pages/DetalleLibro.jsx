import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../assets/css/detalleLibro.css'; 
import { API_BASE_URL } from '../apiConfig';

// RENDERIZAR EL TEXTO DE LA RESEÑA CON "LEER MÁS"
function TextoResenaTruncado({ texto }) {
  const [expandido, setExpandido] = useState(false);
  const limiteCaracteres = 500;

  if (!texto) return null;

  // Si el texto es corto, lo mostramos entero sin botones
  if (texto.length <= limiteCaracteres) {
    return <p className="mb-0">"{texto}"</p>;
  }

  // Si es largo, evaluamos si el usuario le ha dado a expandir
  const textoMostrado = expandido ? texto : texto.substring(0, limiteCaracteres) + "...";

  return (
    <div className="detalle-texto-resena">
      <p className="mb-1">"{textoMostrado}"</p>
      <button 
        className="p-0 border-0 bg-transparent text-primary small fw-bold" 
        onClick={() => setExpandido(!expandido)}
        style={{ fontSize: '0.85rem' }}
      >
        {expandido ? "Ver menos ▲" : "Leer más ▼"}
      </button>
    </div>
  );
}

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
  const [showMenuVault, setShowMenuVault] = useState(false); 
  const [estanteriaActual, setEstanteriaActual] = useState(null); 
  
  // Estados de interacción
  const [escribiendo, setEscribiendo] = useState(false);
  const [textoResena, setTextoResena] = useState("");
  const [resenasComunidad, setResenasComunidad] = useState([]);
  const [miVoto, setMiVoto] = useState(0);
  const [hoverVoto, setHoverVoto] = useState(0);

  // Control de paginación de reseñas de la comunidad
  const [limiteResenas, setLimiteResenas] = useState(5);

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
    // Lanzamos el SweetAlert para frenar al usuario y pedir confirmación
    const confirmacion = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Vas a eliminar tu reseña de forma permanente y no podrás recuperarla.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33', // Rojo para la acción de borrar
      cancelButtonColor: '#4B5043', // Verde para cancelar
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar',
      borderRadius: '15px'
    });

    // Si el usuario cancela o cierra la ventana, cortamos la función
    if (!confirmacion.isConfirmed) return;

    // Si ha confirmado, procedemos a borrar
    try {
      await axios.post(`${API_BASE_URL}/api/reviews/borrar-comentario`, {
        idUsuario: usuarioSesion.idUsuario,
        idLibro: libro.idLibro
      });
      
      setTextoResena("");
      cargarDatosYVoto();
      
      // Lanzamos tu Toast verde silencioso para confirmar el éxito
      mostrarNotificacion("Reseña eliminada", "success");
      
    } catch (err) {
      // O el Toast rojo si algo falla en el backend
      mostrarNotificacion("Error al borrar la reseña", "error");
    }
  };


  const cargarDatosYVoto = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/libros/buscar-unico?isbn=${isbn}`
      );
      
      let libroData = res.data;

      if (libroData) {
        setLibro(libroData); 

        if (libroData.isbn) {
          axios.post(`${API_BASE_URL}/api/libros/sincronizar`, libroData)
               .catch(err => console.log("El libro ya existe o hubo un fallo silencioso"));
        }
      } else {
        libroData = libro;
      }

      if (libroData?.idLibro) {
        const resResenas = await axios.get(`${API_BASE_URL}/api/reviews/libro/${libroData.idLibro}`);
        setResenasComunidad(resResenas.data || []);

        if (usuarioSesion) {
          try {
            const resVoto = await axios.get(
              `${API_BASE_URL}/api/reviews/usuario/${usuarioSesion.idUsuario}/libro/${libroData.idLibro}`
            );
            if (resVoto.data) {
              setMiVoto(resVoto.data.puntuacion);
              setTextoResena(resVoto.data.contenido || "");
            }
          } catch (e) { console.log("Sin voto previo"); }

          try {
            const token = localStorage.getItem("token");
            const resVault = await axios.get(
              `${API_BASE_URL}/api/bibliotecas/estado?idUsuario=${usuarioSesion.idUsuario}&titulo=${encodeURIComponent(libroData.titulo)}&autor=${encodeURIComponent(libroData.autor)}`,
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
      const response = await fetch(`${API_BASE_URL}/api/bibliotecas/add`, {
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

        if (nombreEstanteria === "Leído") {
          try {
            await axios.get(`${API_BASE_URL}/api/retos/usuario/${usuarioSesion.idUsuario}/actual`, {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
          } catch (retoErr) {
            console.error("Error al forzar la sincronización del reto:", retoErr);
          }
        }

        await cargarDatosYVoto();
      }
    } catch (error) {
      mostrarNotificacion("Error al actualizar el Vault", "error");
    }
  };

  const eliminarDeBiblioteca = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/bibliotecas/remove?idUsuario=${usuarioSesion.idUsuario}&titulo=${encodeURIComponent(libro.titulo)}&autor=${encodeURIComponent(libro.autor)}`,
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
      await axios.post(`${API_BASE_URL}/api/reviews/votar`, {
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
      await axios.post(`${API_BASE_URL}/api/reviews/resenar`, {
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
        <h4 className="loader-texto mt-5 text-muted fw-bold">Cargando libro...</h4>
      </div>
    );
  }

  if (!libro) {
    return (
      <div className="text-center w-100 py-5" style={{ minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <i className="bi bi-exclamation-circle display-1 text-muted mb-3 opacity-50"></i>
        <h4 className="text-muted fw-bold">Libro no encontrado</h4>
        <p className="text-muted">El libro que buscas no existe o ha sido eliminado.</p>
      </div>
    );
  }

  const descripcionCompleta = libro.descripcion || "Sin descripción disponible.";
  const sinopsisCorta = descripcionCompleta.length > 300 ? descripcionCompleta.substring(0, 300) + "..." : descripcionCompleta;

  // Filtros de opinión
  const opinionesDeOtros = resenasComunidad.filter(r => r.usuario.idUsuario !== usuarioSesion?.idUsuario && r.contenido);
  const totalOpinionesConTexto = resenasComunidad.filter(r => r.contenido).length;

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
                <p className="detalle-stats mb-3">
                  <strong>Páginas:</strong> {libro.paginas || 'N/A'} | <strong>Publicación:</strong> {libro.fechaPublicacion || 'Desconocida'}
                </p>
                <p className="mb-0 small text-muted">
                  <strong>Géneros:</strong> {libro.generos || "General"} 
                  {libro.isbn && <> | <strong>ISBN:</strong> {libro.isbn}</>}
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
              </div>
            </div>
          </div>
        </div>
      </section>

<h2 className="text-center detalle-titulo-seccion ">Valoraciones y reseñas</h2>

      {/* --- SECCIÓN RESEÑAS --- */}
      <section className="detalle-reviews-bg py-5">
        <div className="container-custom" style={{ maxWidth: '900px' }}>
          

          

          {/* EDITOR */}
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
                  <button className="btn-steam" style={{backgroundColor: "var(--color-rojo-vino)", color: 'white'}} onClick={() => setEscribiendo(false)}>
                    Cancelar
                  </button>
                )}
                <button className="btn-steam btn-steam-publicar" onClick={enviarResena}>
                  {escribiendo ? "Guardar cambios" : "Publicar reseña"}
                </button>
              </div>
            </div>
          )}
          
          <div className="d-flex flex-column gap-4">
            {/* TU RESEÑA DESTACADA */}
            {resenasComunidad
              .filter(r => r.usuario.idUsuario === usuarioSesion?.idUsuario && r.contenido)
              .map(resena => (
                !escribiendo && (
                  <div key={resena.idReview} className="review-card">
                    <div className="mis-acciones-review">
                        <button className="btn-accion-steam" onClick={() => setEscribiendo(true)} title="Editar">
                            <i className="bi bi-pencil-square"></i>
                        </button>
                        <button className="btn-accion-steam" onClick={borrarResena} title="Borrar">
                            <i className="bi bi-trash3"></i>
                        </button>
                    </div>

                    <div className="review-user">
                      <Link to={`/perfil/${resena.usuario.idUsuario}`} className="review-user-link">
                        <span className="badge-tu-resena mb-2 d-inline-block">Tú</span>
                        <img 
                          src={(resena.usuario.fotoPerfil && resena.usuario.fotoPerfil !== "null" && resena.usuario.fotoPerfil.trim() !== "") 
                                ? resena.usuario.fotoPerfil 
                                : "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                          alt="Tú" 
                          className="review-avatar" 
                        />
                        <h5>{resena.usuario.nombre}</h5>
                      </Link>
                    </div>

                    {/* Aplicado componente de truncado para tu reseña */}
                    <div className="review-content">
                      <div className="estrellas mb-2">{renderEstrellas(resena.puntuacion)}</div>
                      <TextoResenaTruncado texto={resena.contenido} />
                      <small className="text-muted d-block mt-2">{resena.fecha}</small>
                    </div>
                  </div>
                )
              ))}

            {/* RESEÑAS DE OTROS */}
            {opinionesDeOtros.slice(0, limiteResenas).map((resena) => (
              <div key={resena.idReview} className="review-card">
                <div className="review-user">
                  <Link to={`/perfil/${resena.usuario.idUsuario}`} className="review-user-link">
                    <img 
                      src={(resena.usuario.fotoPerfil && resena.usuario.fotoPerfil !== "null" && resena.usuario.fotoPerfil.trim() !== "") 
                            ? resena.usuario.fotoPerfil 
                            : "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                      alt={resena.usuario.nombre} 
                      className="review-avatar" 
                    />
                    <h5>{resena.usuario.nombre}</h5>
                  </Link>
                </div>

                {/* Aplicado componente de truncado para las reseñas de los demás */}
                <div className="review-content">
                  <div className="estrellas mb-2">{renderEstrellas(resena.puntuacion)}</div>
                  <TextoResenaTruncado texto={resena.contenido} />
                  <small className="text-muted d-block mt-2">{resena.fecha}</small>
                </div>
              </div>
            ))}

            {/* BOTÓN VER MÁS */}
            {opinionesDeOtros.length > limiteResenas ? (
              <button 
                className="btn-ver-mas shadow-sm"
                onClick={() => setLimiteResenas((prev) => prev + 5)}
              >
                Ver más
              </button>
            ) : (
              totalOpinionesConTexto === 0 && !escribiendo && (
                <div className="text-center p-5 bg-white rounded-pill shadow-sm">
                  <p className="text-muted mb-0">Nadie ha escrito una reseña todavía.</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </>
  );
}