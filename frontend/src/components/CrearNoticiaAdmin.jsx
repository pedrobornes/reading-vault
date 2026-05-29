import React, { useState, useEffect, useRef } from "react";
import "../assets/css/crearNoticiaAdmin.css";

// Añadimos mostrarNotificacion aquí en los props
export default function CrearNoticiaAdmin({ onNoticiaCreada, mostrarNotificacion }) {
  // --- ESTADOS DE CONTROL DE VISIBILIDAD ---
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [incluyeLibro, setIncluyeLibro] = useState(false);

  // --- ESTADOS DEL BUSCADOR DE GOOGLE BOOKS ---
  const [busqueda, setBusqueda] = useState("");
  const [librosFiltrados, setLibrosFiltrados] = useState([]);
  const [libroSeleccionado, setLibroSeleccionado] = useState(null);

  // --- DATOS DE SESIÓN Y SEGURIDAD ---
  const token = localStorage.getItem("token");
  const sesion = localStorage.getItem("usuario");
  const miSesion = sesion ? JSON.parse(sesion) : null;

  // Hook useEffect para realizar búsquedas en tiempo real en la API externa
  useEffect(() => {
    // Cancelamos la consulta si el switch está apagado o el texto es inferior a 3 letras
    if (!incluyeLibro || busqueda.trim().length < 3) {
      setLibrosFiltrados([]);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    
    // Consultamos el endpoint híbrido pasándole 'q' y forzando isGenero=false (Google Books)
    fetch(`http://localhost:8080/api/libros/buscar?q=${busqueda}&isGenero=false`, { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setLibrosFiltrados(data);
      })
      .catch((err) => console.error("Error buscando libros en Google Books:", err));
  }, [busqueda, incluyeLibro, token]);

  // Manejador del envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validación preventiva en el lado del cliente (Usamos el toast de error)
    if (!titulo.trim() || !contenido.trim()) {
      if (mostrarNotificacion) {
        mostrarNotificacion("El título y el contenido son obligatorios", "error");
      }
      return;
    }

    // Estructuramos el objeto Noticia mapeando los campos requeridos por la entidad de Java
    const nuevaNoticia = {
      titulo,
      contenido,
      autor: { idUsuario: miSesion?.idUsuario },
      // Si incluye libro, montamos el objeto mapeando las claves según la respuesta del controlador
      libro: incluyeLibro && libroSeleccionado ? {
        isbn: libroSeleccionado.isbn,
        titulo: libroSeleccionado.titulo,
        autor: libroSeleccionado.autor,
        descripcion: libroSeleccionado.descripcion,
        fotoPortada: libroSeleccionado.portada || libroSeleccionado.fotoPortada, 
        fechaPublicacion: libroSeleccionado.fechaPublicacion,
        paginas: libroSeleccionado.paginas ? parseInt(libroSeleccionado.paginas) : 0,
        generos: libroSeleccionado.generos,
        valoracion: libroSeleccionado.valoracion ? parseFloat(libroSeleccionado.valoracion) : 0.0,
        votos: libroSeleccionado.votos ? parseInt(libroSeleccionado.votos) : 0
      } : null
    };

    // Petición POST para persistir la noticia en la base de datos
    fetch("http://localhost:8080/api/noticias", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nuevaNoticia),
    })
      .then((res) => {
        if (res.ok) {
          // Toast de éxito
          if (mostrarNotificacion) {
            mostrarNotificacion("La noticia se ha publicado correctamente", "success");
          }
          
          // Reseteamos todos los estados tras un guardado exitoso
          setTitulo("");
          setContenido("");
          setIncluyeLibro(false);
          setBusqueda("");
          setLibroSeleccionado(null);
          setMostrarFormulario(false);
          
          // Callback para recargar el feed principal del Home al instante
          if (onNoticiaCreada) onNoticiaCreada(); 
        } else {
          // Toast de error
          if (mostrarNotificacion) {
            mostrarNotificacion("No se pudo crear la noticia", "error");
          }
        }
      })
      .catch((err) => {
        console.error("Error al publicar noticia:", err);
        if (mostrarNotificacion) {
          mostrarNotificacion("Error de conexión", "error");
        }
      });
  };

  // Renderizado optimizado: Si está oculto, solo muestra el botón de apertura
  if (!mostrarFormulario) {
    return (
      <div className="text-center mb-4">
        <button onClick={() => setMostrarFormulario(true)} className="btn-publicar-noticia shadow-sm">
          <i className="bi bi-plus-circle me-2"></i>Publicar nueva noticia
        </button>
      </div>
    );
  }

  // Renderizado del formulario completo de administración
  return (
    <div className="noticia-form-card mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0 noticia-form-card__titulo">
          Publicar Nueva Noticia
        </h4>
        <button type="button" className="btn-close" onClick={() => { setMostrarFormulario(false); setLibroSeleccionado(null); setBusqueda(""); }}></button>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Input del Título */}
        <div className="mb-3">
          <label className="form-label-custom">Título de la noticia</label>
          <input type="text" className="form-control" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Libro recomendado de la semana..." />
        </div>

        {/* Textarea del Contenido */}
        <div className="mb-3">
          <label className="form-label-custom">Contenido del artículo</label>
          <textarea className="form-control" rows="3" value={contenido} onChange={(e) => setContenido(e.target.value)} placeholder="Escribe el cuerpo de la noticia aquí..."></textarea>
        </div>

        {/* Switch Selector de Libro */}
        <div className="form-check form-switch mb-3">
          <input className="form-check-input" type="checkbox" id="switchLibro" checked={incluyeLibro} onChange={(e) => { setIncluyeLibro(e.target.checked); if (!e.target.checked) setLibroSeleccionado(null); }} />
          <label className="form-check-label form-label-custom ms-2" htmlFor="switchLibro">¿Esta noticia está asociada a un libro?</label>
        </div>

        {/* Bloque del buscador condicional */}
        {incluyeLibro && (
          <div className="mb-3 position-relative">
            <label className="form-label-custom">Buscar en Google Books</label>
            <input
              type="text"
              className="form-control"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Escribe el título del libro..."
              disabled={libroSeleccionado !== null}
            />

            {/* Listado de sugerencias de la API de Google */}
            {librosFiltrados.length > 0 && !libroSeleccionado && (
              <ul className="buscador-resultados-lista shadow-sm">
                {librosFiltrados.map((lib, idx) => (
                  <li
                    key={lib.isbn || idx}
                    className="buscador-resultado-item d-flex align-items-center gap-2"
                    onClick={() => {
                      setLibroSeleccionado(lib);
                      setBusqueda(lib.titulo);
                    }}
                  >
                    {(lib.portada || lib.fotoPortada) && (
                      <img 
                        src={lib.portada || lib.fotoPortada} 
                        alt="" 
                        className="buscador-resultado-img" 
                      />
                    )}
                    <div className="text-truncate">
                      <strong>{lib.titulo}</strong> <span className="text-muted small">por {lib.autor}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Bloque estético de confirmación cuando el libro ha sido fijado */}
            {libroSeleccionado && (
              <div className="libro-vinculado-badge mt-2">
                <span className="badge-seleccionado">Seleccionado</span>
                <small className="libro-vinculado-texto text-truncate">{libroSeleccionado.titulo}</small>
                <button type="button" className="btn-cambiar-libro" onClick={() => { setLibroSeleccionado(null); setBusqueda(""); }}>Cambiar</button>
              </div>
            )}
          </div>
        )}

        <button type="submit" className="w-100 btn-enviar-noticia mt-2">
          Publicar Noticia
        </button>
      </form>
    </div>
  );
}