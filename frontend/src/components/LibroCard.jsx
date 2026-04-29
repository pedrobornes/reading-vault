import React, { useState } from "react";
import "../assets/css/libroCard.css";

const LibroCard = ({ libro }) => {
  const [showMenu, setShowMenu] = useState(false);
  // Estado que guarda el nombre de la estantería actual
  const [estanteriaActual, setEstanteriaActual] = useState(
    libro.nombreEstanteria || null,
  );
  const usuarioSesion = JSON.parse(localStorage.getItem("usuario"));

  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const mostrarNotificacion = (texto, tipo) => {
    setMensaje({ texto, tipo });
    // Se limpia solo a los 3 segundos
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
  };

  const añadirABiblioteca = async (nombreEstanteria) => {
    if (!usuarioSesion) {
      alert("Debes iniciar sesión para añadir libros.");
      return;
    }

    const payload = {
      idUsuario: usuarioSesion.idUsuario,
      nombreEstanteria: nombreEstanteria,
      libro: {
        titulo: libro.titulo,
        autor: libro.autor,
        portada: libro.portada,
      },
    };

    try {
      const response = await fetch(
        `http://localhost:8080/api/bibliotecas/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        setEstanteriaActual(nombreEstanteria); // Actualizamos la estantería visualmente
        setShowMenu(false);
        mostrarNotificacion(`Libro añadido a ${nombreEstanteria}`, "success");
      } else {
        const errorMsg = await response.text();
        alert("Error: " + errorMsg);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const eliminarDeBiblioteca = async (e) => {
    e.stopPropagation(); // Evitamos que cierre el menú antes de tiempo
    try {
      const response = await fetch(
        `http://localhost:8080/api/bibliotecas/remove?idUsuario=${usuarioSesion.idUsuario}&titulo=${encodeURIComponent(libro.titulo)}&autor=${encodeURIComponent(libro.autor)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
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
        <i
          key={i}
          className={`bi bi-star${i <= ratingRedondeado ? "-fill" : ""}`}
        ></i>,
      );
    }
    return estrellas;
  };

  return (
    <>
      {/* Toast*/}
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
      <div style={estiloCard} className="libro-card">
        <div style={estiloContenedorImagen}>
          <img
            src={
              libro.portada ||
              "https://via.placeholder.com/100x150?text=Sin+Portada"
            }
            alt={libro.titulo}
            style={estiloImagen}
          />
        </div>

        <div style={estiloEstrellas}>{renderEstrellas(libro.valoracion)}</div>

        <h4 style={estiloTituloLibro}>{libro.titulo}</h4>
        <p style={estiloAutorLibro}>{libro.autor}</p>

        <div
          style={{
            marginTop: "auto",
            paddingTop: "15px",
            position: "relative",
          }}
        >
          {/* BOTÓN PRINCIPAL: Cambia de color si ya está añadido */}
          <button
            style={{
              ...estiloBotonDropdown,
              backgroundColor: estanteriaActual
                ? "var(--color-verde-oscuro)"
                : "var(--color-salmon)",
            }}
            className="btn-add-vault"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            {estanteriaActual ?  estanteriaActual : "Añadir a mi Vault"}
            <i className={`bi bi-chevron-${showMenu ? "up" : "down"} ms-2`}></i>
          </button>

          {/* MENÚ DESPLEGABLE: Siempre disponible para cambiar o eliminar */}
          {showMenu && (
            <div style={estiloMenuAñadir} className="menu-desplegable">
              <div
                style={estiloItem}
                onClick={() => añadirABiblioteca("Pendiente")}
              >
                <i
                  className="bi bi-clock me-2"
                  style={{ color: "#d97706" }}
                ></i>{" "}
                Pendiente
                {estanteriaActual === "Pendiente" && (
                  <i className="bi bi-check ms-auto"></i>
                )}
              </div>

              <div
                style={estiloItem}
                onClick={() => añadirABiblioteca("Leyendo")}
              >
                <i
                  className="bi bi-book-half me-2"
                  style={{ color: "#2563eb" }}
                ></i>{" "}
                Leyendo
                {estanteriaActual === "Leyendo" && (
                  <i className="bi bi-check ms-auto"></i>
                )}
              </div>

              <div
                style={estiloItem}
                onClick={() => añadirABiblioteca("Leído")}
              >
                <i
                  className="bi bi-check-circle-fill me-2"
                  style={{ color: "#16a34a" }}
                ></i>{" "}
                Leído
                {estanteriaActual === "Leído" && (
                  <i className="bi bi-check ms-auto"></i>
                )}
              </div>

              {estanteriaActual && (
                <div
                  style={estiloItemEliminar}
                  onClick={eliminarDeBiblioteca}
                  className="opcion-eliminar"
                >
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

// --- TODOS LOS ESTILOS DEFINIDOS ---
const estiloCard = {
  backgroundColor: "#A8CBBF",
  padding: "20px",
  borderRadius: "15px",
  textAlign: "center",
  boxShadow: "var(--shadow)",
  height: "100%",
  display: "flex",
  flexDirection: "column",
};
const estiloContenedorImagen = {
  backgroundColor: "white",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "10px",
  display: "flex",
  justifyContent: "center",
};
const estiloImagen = { width: "100%", height: "180px", objectFit: "contain" };
const estiloBotonDropdown = {
  width: "100%",
  padding: "10px",
  borderRadius: "25px",
  border: "none",
  backgroundColor: "var(--color-salmon)",
  color: "white",
  fontFamily: "var(--font-titulos)",
  fontSize: "0.9rem",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "var(--shadow)",
};
const estiloMenuAñadir = {
  position: "absolute",
  bottom: "110%", // Un pelín más separado del botón
  left: "0",
  right: "0",
  backgroundColor: "#ffffff",
  borderRadius: "15px", // Más redondeado, más moderno
  boxShadow: "0 10px 25px rgba(0,0,0,0.15)", // Sombra más profunda
  marginBottom: "10px",
  zIndex: 100,
  overflow: "hidden",
  border: "1px solid rgba(0,0,0,0.05)",
  padding: "5px 0", // Espaciado interno arriba y abajo
};
const estiloItem = {
  padding: "12px 20px",
  fontFamily: "var(--font-body)",
  fontSize: "0.9rem",
  color: "#334155", // Un gris azulado más profesional
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  transition: "background-color 0.2s ease",
  borderBottom: "1px solid #f1f5f9",
};

const estiloItemEliminar = {
  ...estiloItem,
  color: "#ef4444", // Rojo vibrante
  borderBottom: "none",
  fontWeight: "600",
  backgroundColor: "#fef2f2", // Fondo ligeramente rosado
};
const estiloEstrellas = {
  color: "var(--color-amarillo)",
  marginBottom: "5px",
  display: "flex",
  justifyContent: "center",
  gap: "2px",
};
const estiloTituloLibro = {
  fontSize: "0.95rem",
  fontWeight: "bold",
  color: "var(--color-marron-oscuro)",
  fontFamily: "var(--font-titulos)",
};
const estiloAutorLibro = {
  fontSize: "0.85rem",
  color: "var(--color-marron-medio)",
  fontFamily: "var(--font-body)",
};

const estiloVaultToast = {
  position: "fixed",
  top: "20px",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 2000, // Muy alto para que salga por encima de todo
  padding: "12px 24px",
  borderRadius: "12px",
  color: "white",
  fontWeight: "500",
  display: "flex",
  alignItems: "center",
  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  fontFamily: "var(--font-body)",
  minWidth: "300px",
  justifyContent: "center",
};

const estiloToastSuccess = {
  ...estiloVaultToast,
  backgroundColor: "#155724", // Verde éxito
};

const estiloToastError = {
  ...estiloVaultToast,
  backgroundColor: "#630A10", // El granate exacto de tu foto
};

const estiloBotonEliminar = {
  width: "45px",
  height: "45px",
  borderRadius: "12px",
  border: "none",
  backgroundColor: "var(--color-rojo-vino)",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: "1.2rem",
  transition: "0.2s",
  boxShadow: "var(--shadow)",
};
export default LibroCard;
