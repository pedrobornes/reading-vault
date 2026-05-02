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
  
  // Estados de interacción
  const [escribiendo, setEscribiendo] = useState(false);
  const [textoResena, setTextoResena] = useState("");
  const [resenasComunidad, setResenasComunidad] = useState([]);
  const [miVoto, setMiVoto] = useState(0);
  const [hoverVoto, setHoverVoto] = useState(0);

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

  const cargarDatosYVoto = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/libros/buscar-unico?isbn=${isbn}`
      );
      
      let libroData = res.data;

      if (libroData) {
        setLibro(libroData); 
      } else {
        // Fallback al state si por alguna razón falla la API pero venimos de la card
        libroData = libro;
      }

      // 3. Cargar reseñas de la comunidad si tenemos el ID (ahora recuperado por ISBN)
      if (libroData?.idLibro) {
        const resResenas = await axios.get(`http://localhost:8080/api/reviews/libro/${libroData.idLibro}`);
        setResenasComunidad(resResenas.data || []);

        const usuarioSesion = JSON.parse(localStorage.getItem("usuario"));
        if (usuarioSesion) {
          try {
            const resVoto = await axios.get(
              `http://localhost:8080/api/reviews/usuario/${usuarioSesion.idUsuario}/libro/${libroData.idLibro}`
            );
            if (resVoto.data) {
              setMiVoto(resVoto.data.puntuacion);
              setTextoResena(resVoto.data.contenido || "");
            }
          } catch (e) {
            console.log("El usuario aún no ha votado este libro.");
          }
        }
      }
    } catch (err) {
      console.error("Error en la carga de datos del vault:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosYVoto();
  }, [isbn]);

  const manejarVoto = async (puntuacion) => {
    const usuarioSesion = JSON.parse(localStorage.getItem("usuario"));
    if (!usuarioSesion) {
      mostrarNotificacion("Debes iniciar sesión para votar", "error");
      return;
    }

    try {
      // Creamos una copia del libro asegurando que incluya el ISBN de la URL
      const libroParaEnviar = {
        ...libro,
        isbn: isbn // 'isbn' viene del useParams()
      };

      await axios.post('http://localhost:8080/api/reviews/votar', {
        idUsuario: usuarioSesion.idUsuario,
        puntuacion: puntuacion,
        libro: libroParaEnviar 
      });

      setMiVoto(puntuacion);
      await cargarDatosYVoto();
      mostrarNotificacion("¡Puntuación guardada!", "success");
    } catch (err) {
      console.error("Error al votar:", err);
      mostrarNotificacion("No se pudo registrar el voto", "error");
    }
  };

  const enviarResena = async () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!libro?.idLibro) {
      mostrarNotificacion("Vota primero para habilitar la reseña", "error");
      return;
    }

    try {
      await axios.post('http://localhost:8080/api/reviews/resenar', {
        idUsuario: usuario.idUsuario,
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

  if (cargando) return <div className="text-center py-5"><h3>Cargando sabiduría...</h3></div>;
  if (!libro) return null;

  const descripcionCompleta = libro.descripcion || "Sin descripción disponible.";
  const sinopsisCorta = descripcionCompleta.length > 300 ? descripcionCompleta.substring(0, 300) + "..." : descripcionCompleta;

  return (
    <>
      {/* Sistema de notificación */}
      {mensaje.texto && (
        <div className={`vault-toast vault-toast--${mensaje.tipo}`}>
          {mensaje.tipo === "success" ? (
            <i className="bi bi-check-circle-fill me-2"></i>
          ) : (
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
          )}
          {mensaje.texto}
        </div>
      )}
      <section className="detalle-top-bg py-5">
        <div className="container-custom">
          <div className="row">
            {/* Lateral Izquierdo: Portada y Voto */}
            <div className="col-md-4 col-lg-3 text-center mb-4">
              <img 
                src={libro.portada || libro.fotoPortada || "https://via.placeholder.com/300x450?text=Sin+Portada"} 
                alt={libro.titulo} 
                className="detalle-portada shadow-lg mb-4 img-fluid" 
              />
              
              <button className="btn-estado w-100 mb-4 d-flex justify-content-between px-4">
                Añadir al Vault <i className="bi bi-caret-down-fill"></i>
              </button>

              {/* TARJETA DE VOTACIÓN (Estilo image_3e14f7.png) */}
              <div className="voto-interactivo-card">
                <p>Tu puntuación</p>
                
                <div className="estrellas-selector d-flex justify-content-center mb-4">
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

                {!escribiendo ? (
                  <button 
                    className="btn-escribir-vault"
                    onClick={() => setEscribiendo(true)}
                    disabled={miVoto === 0}
                    title={miVoto === 0 ? "Vota primero para habilitar" : ""}
                  >
                    <i className="bi bi-pencil-square"></i>
                    <span>{textoResena ? "Editar reseña" : "Escribir reseña"}</span>
                  </button>
                ) : (
                  <div className="resena-editor">
                    <textarea
                      className="form-control mb-2"
                      placeholder="¿Qué te pareció el libro?"
                      rows="3"
                      value={textoResena}
                      onChange={(e) => setTextoResena(e.target.value)}
                      autoFocus
                    ></textarea>
                    <div className="d-flex gap-2">
                      <button className="btn btn-success btn-sm flex-grow-1 py-2" onClick={enviarResena}>
                        Publicar
                      </button>
                      <button className="btn btn-light btn-sm px-3" onClick={() => setEscribiendo(false)}>
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Valoración Global */}
              <div className="detalle-rating text-muted mt-4">
                <p className="mb-1 small">Valoración global</p>
                <div className="estrellas mb-1">
                  {renderEstrellas(libro.valoracion || 0)}
                </div>
                <div className="small">
                  <strong>{(libro.valoracion || 0).toFixed(1)}</strong> / 5
                  <br />
                  ({(libro.votos || 0).toLocaleString()} votos)
                </div>
              </div>
            </div>

            {/* Contenido Derecho */}
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

      {/* Sección de Reseñas Reales */}
      <section className="detalle-reviews-bg py-5">
        <div className="container-custom" style={{ maxWidth: '800px' }}>
          <h2 className="text-center mb-5 detalle-titulo-seccion">Opiniones de la comunidad</h2>
          <div className="d-flex flex-column gap-4">
            {resenasComunidad.some(r => r.contenido) ? (
              resenasComunidad.map((resena) => (
                resena.contenido && (
                  <div key={resena.idReview} className="review-card p-4 shadow-sm border-0 bg-white">
                    <div className="review-user text-center">
                      {resena.usuario.fotoPerfil ? (
                        <img src={resena.usuario.fotoPerfil} alt={resena.usuario.nombre} className="review-avatar mb-2" />
                      ) : (
                        <div className="avatar-placeholder mb-2">
                          {resena.usuario.nombre.charAt(0).toUpperCase()}
                        </div>
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
              ))
            ) : (
              <div className="text-center p-5 bg-white rounded-pill shadow-sm">
                <p className="text-muted mb-0">Nadie ha escrito una reseña todavía. ¡Inaugura el muro!</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}