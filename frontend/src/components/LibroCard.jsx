import React from "react";

const LibroCard = ({ libro }) => {
  // Función para generar las estrellas dinámicas
  const renderEstrellas = (rating) => {
    const estrellas = [];
    // Redondeamos al número entero más cercano para simplificar
    const ratingRedondeado = Math.round(rating || 0);

    for (let i = 1; i <= 5; i++) {
      if (i <= ratingRedondeado) {
        // Estrella rellena
        estrellas.push(<i key={i} className="bi bi-star-fill"></i>);
      } else {
        // Estrella vacía
        estrellas.push(<i key={i} className="bi bi-star"></i>);
      }
    }
    return estrellas;
  };

  return (
    <div
      style={estiloCard}
      onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
      onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      <div style={estiloContenedorImagen}>
        <img
          src={libro.portada || "https://via.placeholder.com/100x150?text=Sin+Portada"}
          alt={libro.titulo}
          style={estiloImagen}
        />
      </div>

      {/* Estrellas dinámicas basadas en la valoración de Google */}
      <div style={estiloEstrellas}>
        {renderEstrellas(libro.valoracion)}
        {libro.valoracion > 0 && (
          <span style={estiloNumero}>({libro.valoracion})</span>
        )}
      </div>

      <h4 style={estiloTituloLibro}>{libro.titulo}</h4>
      <p style={estiloAutorLibro}>{libro.autor}</p>
    </div>
  );
};

// --- ESTILOS ---
const estiloCard = {
  backgroundColor: "#A8CBBF",
  padding: "15px",
  borderRadius: "15px",
  textAlign: "center",
  transition: "0.3s",
  cursor: "pointer",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  height: "100%",
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

const estiloEstrellas = {
  color: "#FFCC66",
  marginBottom: "5px",
  fontSize: "1rem",
  display: "flex",
  justifyContent: "center",
  gap: "2px",
};

const estiloNumero = {
  fontSize: "0.75rem",
  color: "#555",
  marginLeft: "5px",
  alignSelf: "center",
};

const estiloTituloLibro = {
  fontSize: "0.95rem",
  margin: "5px 0",
  fontWeight: "bold",
  color: "#333",
  display: "-webkit-box",
  WebkitLineClamp: "2",
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const estiloAutorLibro = { fontSize: "0.85rem", color: "#555" };

export default LibroCard;