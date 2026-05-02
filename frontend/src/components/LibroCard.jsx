import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/libroCard.css";

const LibroCard = ({ libro }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [estanteriaActual, setEstanteriaActual] = useState(null);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const navigate = useNavigate();
  const usuarioSesion = JSON.parse(localStorage.getItem("usuario"));

  useEffect(() => {
    setEstanteriaActual(null);
    setShowMenu(false);

    const verificarEstadoLibro = async () => {
      if (!usuarioSesion) return;

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:8080/api/bibliotecas/estado?idUsuario=${usuarioSesion.idUsuario}&titulo=${encodeURIComponent(libro.titulo)}&autor=${encodeURIComponent(libro.autor)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.ok) {
          const data = await response.json();
          if (data && data.nombreEstanteria) {
            setEstanteriaActual(data.nombreEstanteria);
          }
        }
      } catch (error) {
        console.error("Error al sincronizar estado:", error);
      }
    };

    verificarEstadoLibro();
  }, [libro, usuarioSesion?.idUsuario]);

  // Función para ir al detalle
  const irADetalle = () => {
    navigate(`/libro/${libro.isbn}`, { state: { libro } });
  };

  const mostrarNotificacion = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
  };

  const añadirABiblioteca = async (nombreEstanteria) => {
    if (!usuarioSesion) {
      alert("Debes iniciar sesión.");
      return;
    }

    const payload = {
      idUsuario: usuarioSesion.idUsuario,
      nombreEstanteria: nombreEstanteria,
      libro: {
        titulo: libro.titulo,
        autor: libro.autor,
        portada: libro.portada,
        description: libro.descripcion || libro.description || "Sin descripción disponible."
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
        setShowMenu(false);
        mostrarNotificacion(`Libro movido a ${nombreEstanteria}`, "success");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const eliminarDeBiblioteca = async (e) => {
    if (e) e.stopPropagation(); // Evita que el clic en eliminar active la navegación de la card

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
        setShowMenu(false);
        mostrarNotificacion("Libro eliminado del Vault", "success");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const renderEstrellas = (rating) => {
    const estrellas = [];
    const ratingRedondeado = Math.round(rating || 0);
    for (let i = 1; i <= 5; i++) {
      estrellas.push(
        <i key={i} className={`bi bi-star${i <= ratingRedondeado ? "-fill" : ""}`}></i>
      );
    }
    return estrellas;
  };

  const getClaseBoton = () => {
    if (estanteriaActual === "Pendiente") return "btn-add-vault--pendiente";
    if (estanteriaActual === "Leyendo") return "btn-add-vault--leyendo";
    if (estanteriaActual === "Leído") return "btn-add-vault--leido";
    return ""; 
  };

  return (
    <>
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

      {/* TODA LA CARD ES CLICABLE */}
      <div className="libro-card" onClick={irADetalle} style={{ cursor: 'pointer' }}>
        <div className="libro-card__contenedor-imagen">
          <img
            src={libro.portada || "https://via.placeholder.com/100x150?text=Sin+Portada"}
            alt={libro.titulo}
            className="libro-card__imagen"
          />
        </div>

        <div className="libro-card__estrellas">{renderEstrellas(libro.valoracion)}</div>

        <h4 className="libro-card__titulo">{libro.titulo}</h4>
        <p className="libro-card__autor">{libro.autor}</p>

        {/* DETENEMOS LA PROPAGACIÓN AQUÍ PARA QUE EL BOTÓN Y MENÚ NO DISPAREN EL CLIC DE LA CARD */}
        <div className="libro-card__acciones" onClick={(e) => e.stopPropagation()}>
          <button
            className={`btn-add-vault ${getClaseBoton()}`}
            onClick={() => setShowMenu(!showMenu)}
          >
            {estanteriaActual ? estanteriaActual : "Añadir a mi Vault"}
            <i className={`bi bi-chevron-${showMenu ? "up" : "down"} ms-2`}></i>
          </button>

          {showMenu && (
            <div className="menu-desplegable">
              <div className="menu-desplegable__item" onClick={() => añadirABiblioteca("Pendiente")}>
                <i className="bi bi-clock me-2 text-warning"></i> Pendiente
                {estanteriaActual === "Pendiente" && <i className="bi bi-check ms-auto"></i>}
              </div>

              <div className="menu-desplegable__item" onClick={() => añadirABiblioteca("Leyendo")}>
                <i className="bi bi-book-half me-2 text-primary"></i> Leyendo
                {estanteriaActual === "Leyendo" && <i className="bi bi-check ms-auto"></i>}
              </div>

              <div className="menu-desplegable__item" onClick={() => añadirABiblioteca("Leído")}>
                <i className="bi bi-check-circle-fill me-2 text-success"></i> Leído
                {estanteriaActual === "Leído" && <i className="bi bi-check ms-auto"></i>}
              </div>

              {estanteriaActual && (
                <div className="menu-desplegable__item menu-desplegable__item--eliminar" onClick={eliminarDeBiblioteca}>
                  <i className="bi bi-trash3 me-2"></i> Eliminar del Vault
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LibroCard;