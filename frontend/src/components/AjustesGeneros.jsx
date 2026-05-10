import { useState, useEffect } from "react";
import "../assets/css/ajustes.css"; 

// Recibimos onUpdate para sincronizar el estado con el componente padre
export default function AjustesGeneros({ user, onUpdate }) {
  // Estados
  const [generosDisponibles, setGenerosDisponibles] = useState([]);
  const [generosSeleccionados, setGenerosSeleccionados] = useState([]);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  useEffect(() => {
    // Pide todos los géneros al backend (MySQL)
    fetch("http://localhost:8080/api/generos")
      .then(res => res.json())
      .then(data => setGenerosDisponibles(data))
      .catch(err => console.error("Error cargando géneros:", err));

    // Carga favoritos del usuario si ya los tiene
    if (user && user.generosFavoritos) {
      // Extraemos solo los nombres para pasarlos al estado
      const nombres = user.generosFavoritos.map(g => g.nombre);
      setGenerosSeleccionados(nombres);
    }
  }, [user]); // Al depender de user, se refresca si el padre actualiza los datos

  // Toast de notificación
  const mostrarNotificacion = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
  };

  // Lógica de selección/deselección de géneros
  const toggleGenero = (nombreGenero) => {
    if (generosSeleccionados.includes(nombreGenero)) {
      setGenerosSeleccionados(generosSeleccionados.filter(g => g !== nombreGenero));
    } else {
      setGenerosSeleccionados([...generosSeleccionados, nombreGenero]);
    }
  };

  // Envío a Spring Boot
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:8080/api/usuarios/${user.idUsuario}/generos`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(generosSeleccionados),
      });

      if (response.ok) {
        const usuarioActualizado = await response.json();
        
        // Actualizamos el localStorage para que el Buscador lo lea al instante
        localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));

        if (onUpdate) {
          onUpdate(usuarioActualizado);
        }

        mostrarNotificacion("¡Tus géneros favoritos han sido guardados!", "success");
      } else {
        mostrarNotificacion("Error al guardar los géneros", "error");
      }
    } catch (error) {
      mostrarNotificacion("Error de conexión", "error");
    }
  };

  return (
    <div className="ajustes-form-container">
      {/* Toast */}
      {mensaje.texto && (
        <div className={`vault-toast vault-toast--${mensaje.tipo}`}>
          {mensaje.tipo === "success" ? <i className="bi bi-check-circle-fill me-2"></i> : <i className="bi bi-exclamation-triangle-fill me-2"></i>}
          {mensaje.texto}
        </div>
      )}

      <h4 className="mb-3 fw-bold">Tus Géneros Favoritos</h4>
      <p className="text-muted mb-4">
        Selecciona los géneros que más te gustan. Usaremos esto para recomendarte libros en el buscador.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="d-flex flex-wrap gap-2 mb-5">
          {generosDisponibles.map((genero) => (
            <button
              key={genero.idGenero} // Usamos el ID real de la BD como key
              type="button"
              onClick={() => toggleGenero(genero.nombre)}
              className={`btn rounded-pill px-4 py-2 fw-medium border ${
                generosSeleccionados.includes(genero.nombre) 
                  ? "btn-genero-activo" 
                  : "btn-genero-inactivo"
              }`}
            >
              {genero.nombre}
            </button>
          ))}
        </div>

        <div className="text-center">
          <button type="submit" className="btn-vault px-5 py-2 shadow">
            Guardar preferencias
          </button>
        </div>
      </form>
    </div>
  );
}