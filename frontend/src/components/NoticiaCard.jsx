import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; 
import Swal from "sweetalert2";

// Añadimos mostrarNotificacion a los props recibidos
export default function NoticiaCard({ noticia, esAdmin, onNoticiaModificada, mostrarNotificacion }) {
  const token = localStorage.getItem("token");

  // --- ESTADOS PARA LA EDICIÓN INTERNA ---
  const [editando, setEditando] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState(noticia.titulo);
  const [nuevoContenido, setNuevoContenido] = useState(noticia.contenido);
  // Guardamos el libro asociado actual en un estado para poder cambiarlo dinámicamente en el formulario
  const [libroSeleccionado, setLibroSeleccionado] = useState(noticia.libro);

  // --- ESTADOS DEL BUSCADOR INTERNO EN EDICIÓN ---
  const [busqueda, setBusqueda] = useState("");
  const [librosFiltrados, setLibrosFiltrados] = useState([]);

  // URL de la portada para el modo vista
  const urlPortada = libroSeleccionado?.fotoPortada || libroSeleccionado?.portada;

  // Sincroniza el buscador en tiempo real dentro del formulario de edición
  useEffect(() => {
    if (!editando || busqueda.trim().length < 3) {
      setLibrosFiltrados([]);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    fetch(`http://localhost:8080/api/libros/buscar?q=${busqueda}&isGenero=false`, { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setLibrosFiltrados(data))
      .catch((err) => console.error("Error buscando libros al editar:", err));
  }, [busqueda, editando, token]);

  // Formateador de fecha nativo (AAAA-MM-DD -> DD/MM/AAAA)
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "";
    const partes = fechaStr.split("-");
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fechaStr;
  };

  // Lógica para confirmar los cambios vía PUT
  const handleGuardarEdicion = (e) => {
    e.preventDefault();
    
    // Construimos el cuerpo mandando los textos y la estructura completa del libro actual del estado
    const noticiaActualizada = {
      titulo: nuevoTitulo,
      contenido: nuevoContenido,
      libro: libroSeleccionado ? {
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

    fetch(`http://localhost:8080/api/noticias/${noticia.idNoticia}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(noticiaActualizada)
    }).then((res) => {
      if (res.ok) {
        if (mostrarNotificacion) {
          mostrarNotificacion("La noticia se ha modificado correctamente.", "success");
        }
        setEditando(false);
        setBusqueda("");
        if (onNoticiaModificada) onNoticiaModificada();
      } else {
        if (mostrarNotificacion) {
          mostrarNotificacion("Error al modificar la noticia.", "error");
        }
      }
    }).catch(() => {
      if (mostrarNotificacion) {
        mostrarNotificacion("Error de conexión.", "error");
      }
    });
  };

  // Lógica para eliminar la noticia
  const handleEliminar = () => {
    // Swal para la pregunta de confirmación (Sí/Cancelar)
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#650D1B", 
      cancelButtonColor: "#4B5043",
      confirmButtonText: "Sí, borrar",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://localhost:8080/api/noticias/${noticia.idNoticia}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }).then((res) => {
          if (res.ok) {
            if (mostrarNotificacion) {
              mostrarNotificacion("La noticia ha sido eliminada.", "success");
            }
            if (onNoticiaModificada) onNoticiaModificada();
          } else {
            if (mostrarNotificacion) {
              mostrarNotificacion("Error al eliminar la noticia.", "error");
            }
          }
        }).catch(() => {
          if (mostrarNotificacion) {
            mostrarNotificacion("Error de conexión.", "error");
          }
        });
      }
    });
  };

  // --- RENDER EN MODO EDICIÓN ---
  if (editando) {
    return (
      <div className="noticia-card mb-4 shadow-sm p-3 bg-white rounded">
        <form onSubmit={handleGuardarEdicion}>
          <div className="mb-2">
            <label className="form-label small fw-bold">Editar Título</label>
            <input type="text" className="form-control form-control-sm" value={nuevoTitulo} onChange={(e) => setNuevoTitulo(e.target.value)} required />
          </div>

          {/* ASISTENTE DE LIBRO DENTRO DEL EDITOR */}
          <div className="mb-2 position-relative">
            <label className="form-label small fw-bold d-block">Libro Vinculado</label>
            
            {libroSeleccionado ? (
              <div className="p-2 rounded d-flex align-items-center justify-content-between mb-2" style={{ backgroundColor: "rgba(155, 196, 188, 0.15)", border: "1px solid rgba(155, 196, 188, 0.3)" }}>
                <small className="text-truncate fw-bold text-dark">✓ {libroSeleccionado.titulo}</small>
                <button type="button" className="btn btn-xs btn-link text-danger p-0 ms-2 text-decoration-none small" onClick={() => { setLibroSeleccionado(null); setBusqueda(""); }}>
                  Quitar libro
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Buscar nuevo libro para asociar..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                {/* Desplegable de resultados flotantes */}
                {librosFiltrados.length > 0 && (
                  <ul className="position-absolute w-100 bg-white border rounded shadow-sm p-0 m-0 custom-dropdown-list" style={{ zIndex: 100, maxHeight: "200px", overflowY: "auto", listStyle: "none" }}>
                    {librosFiltrados.map((lib, idx) => (
                      <li 
                        key={lib.isbn || idx} 
                        className="p-2 border-bottom small custom-dropdown-item" 
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setLibroSeleccionado(lib);
                          setLibrosFiltrados([]);
                          setBusqueda("");
                        }}
                      >
                        <strong>{lib.titulo}</strong> <span className="text-muted">por {lib.autor}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold">Editar Contenido</label>
            <textarea className="form-control form-control-sm" rows="3" value={nuevoContenido} onChange={(e) => setNuevoContenido(e.target.value)} required />
          </div>

          <div className="d-flex gap-2 justify-content-end">
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => { setEditando(false); setLibroSeleccionado(noticia.libro); }}>Cancelar</button>
            <button type="submit" className="btn btn-sm text-white" style={{ backgroundColor: "var(--color-verde-oscuro)" }}>Guardar Cambios</button>
          </div>
        </form>
      </div>
    );
  }

  // --- RENDER EN MODO VISTA ---
  return (
    <div className="noticia-card mb-4 shadow-sm p-3 bg-white rounded position-relative">
      
      {/* Botones flotantes de administración */}
      {esAdmin && (
        <div className="position-absolute top-0 end-0 mt-2 me-2 d-flex gap-1" style={{ zIndex: 10 }}>
          <button onClick={() => setEditando(true)} className="btn btn-sm btn-light text-primary border-0 shadow-sm" title="Editar noticia">
            <i className="bi bi-pencil-square"></i>
          </button>
          <button onClick={handleEliminar} className="btn btn-sm btn-light text-danger border-0 shadow-sm" title="Eliminar noticia">
            <i className="bi bi-trash"></i>
          </button>
        </div>
      )}

      {/* TÍTULO Y FECHA EN COLUMNA ADAPTATIVA */}
      <div className={`noticia-header mb-3 d-flex w-100 ${
        esAdmin 
          ? "flex-column gap-1 pe-5 align-items-start" 
          : "justify-content-between align-items-center" 
      }`}>
        
        {/* Renderizado del Título */}
        <h3 className="noticia-titulo-principal m-0">{noticia.titulo}</h3>
        
        {/* Renderizado de la Fecha */}
        {noticia.fecha && (
          <span className="text-muted small fw-bold flex-shrink-0">
            <i className="bi bi-calendar3 me-1"></i> {formatearFecha(noticia.fecha)}
          </span>
        )}

      </div>

      {/* LIBRO ASOCIADO */}
      {libroSeleccionado && (
        <div className="noticia-libro-vinculado mb-3 p-2 rounded d-flex align-items-center gap-3" style={{ backgroundColor: "rgba(155, 196, 188, 0.1)", border: "1px solid rgba(155, 196, 188, 0.25)" }}>
          <Link to={`/libro/${libroSeleccionado.isbn}`} className="d-flex align-items-center gap-3 text-decoration-none text-dark w-100 noticia-libro-enlace">
            {urlPortada ? (
              <img src={urlPortada} alt="" className="noticia-libro-img rounded shadow-sm" style={{ width: "50px", height: "75px", objectFit: "cover" }} />
            ) : (
              <div className="noticia-libro-img-placeholder bg-light d-flex align-items-center justify-content-center rounded" style={{ width: "50px", height: "75px" }}><i className="bi bi-book text-muted"></i></div>
            )}
            <div className="text-truncate flex-grow-1">
              <h5 className="m-0 noticia-libro-titulo text-truncate" style={{ fontSize: "0.95rem", fontWeight: "700" }}>{libroSeleccionado.titulo}</h5>
              <p className="m-0 text-muted small">por {libroSeleccionado.autor || "Autor desconocido"}</p>
            </div>
          </Link>
        </div>
      )}

      {/* TEXTO O CUERPO DE LA NOTICIA */}
      <p className="noticia-contenido text-justify m-0" style={{ fontSize: "0.95rem", lineHeight: "150%" }}>
        {noticia.contenido}
      </p>

    </div>
  );
}