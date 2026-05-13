import { useState } from "react";
import Swal from 'sweetalert2';

export default function AjustesPrivacidad({ user }) {
  const [privacidad, setPrivacidad] = useState({
    perfil: user.privacidadPerfil || "Público",
    actividad: user.privacidadActividad || "Público",
    libros: user.privacidadLibros || "Público",
    datosPersonales: user.privacidadDatos || "Privado",
  });

  const handleChange = (e) => {
    setPrivacidad({
      ...privacidad,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:8080/api/usuarios/${user.idUsuario}/privacidad`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(privacidad),
        }
      );

      if (response.ok) {
        const actualizado = await response.json();
        localStorage.setItem("usuario", JSON.stringify(actualizado));
        
        Swal.fire({
          title: '¡Actualizado!',
          text: 'Preferencias de privacidad guardadas en la Bóveda.',
          icon: 'success',
          confirmButtonColor: 'var(--color-azul-footer)',
          borderRadius: '15px'
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleBorrarCuenta = async () => {
    const result = await Swal.fire({
      title: '¿ESTÁS SEGURO?',
      text: "Esta acción es irreversible y perderás todos tus libros, reseñas y conexiones.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, borrar cuenta',
      cancelButtonText: 'Cancelar',
      borderRadius: '15px'
    });

    if (result.isConfirmed) {
      const { value: palabraClave } = await Swal.fire({
        title: 'Confirmación final',
        text: 'Para confirmar, escribe ELIMINAR en el campo de abajo:',
        input: 'text',
        inputPlaceholder: 'ELIMINAR',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'ELIMINAR DEFINITIVAMENTE',
        cancelButtonText: 'Mejor no',
        borderRadius: '15px',
        inputValidator: (value) => {
          if (value !== 'ELIMINAR') {
            return 'Debes escribir la palabra exacta para continuar';
          }
        }
      });

      if (palabraClave === "ELIMINAR") {
        const token = localStorage.getItem("token");
        try {
          const response = await fetch(
            `http://localhost:8080/api/usuarios/${user.idUsuario}/eliminar`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.ok) {
            Swal.fire({
              title: 'Cuenta eliminada',
              text: 'Tu rastro en la Bóveda ha sido borrado.',
              icon: 'success',
              showConfirmButton: false,
              timer: 2000
            }).then(() => {
              localStorage.clear();
              window.location.href = "/";
            });
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="row g-4">
      <div className="col-lg-8">
        <div className="ajustes-form-container h-100">
          <h4 className="mb-2 fw-bold" style={{ fontFamily: "var(--font-titulos)" }}>
            Privacidad de la Bóveda
          </h4>
          <p className="text-muted small mb-4">
            Configura quién tiene permiso para explorar el contenido de tu biblioteca y perfil.
          </p>

          <div className="row g-4">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="label-ajustes mb-0">Visibilidad del perfil</label>
                <select
                  name="perfil"
                  className="form-select form-select-sm w-auto shadow-sm"
                  value={privacidad.perfil}
                  onChange={handleChange}
                  style={{ borderColor: "var(--accent)" }}
                >
                  <option>Público</option>
                  <option>Solo Amigos</option>
                  <option>Privado</option>
                </select>
              </div>
              <p className="small text-muted ps-1">
                Ajuste maestro. Si es privado, nadie podrá encontrar tu perfil ni ver tu contenido.
              </p>
            </div>

            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="label-ajustes mb-0">Actividad reciente y Reseñas</label>
                <select
                  name="actividad"
                  className="form-select form-select-sm w-auto shadow-sm"
                  value={privacidad.actividad}
                  onChange={handleChange}
                  style={{ borderColor: "var(--accent)" }}
                >
                  <option>Público</option>
                  <option>Solo Amigos</option>
                  <option>Privado</option>
                </select>
              </div>
              <p className="small text-muted ps-1">
                Controla quién ve tus últimos libros añadidos y los comentarios que escribes.
              </p>
            </div>

            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="label-ajustes mb-0">Resumen y Reto Anual</label>
                <select
                  name="libros"
                  className="form-select form-select-sm w-auto shadow-sm"
                  value={privacidad.libros}
                  onChange={handleChange}
                  style={{ borderColor: "var(--accent)" }}
                >
                  <option>Público</option>
                  <option>Solo Amigos</option>
                  <option>Privado</option>
                </select>
              </div>
              <p className="small text-muted ps-1">
                Oculta las estadísticas de tus lecturas (Leídos, Amigos, Grupos) y tu progreso del reto anual.
              </p>
            </div>

            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="label-ajustes mb-0">Información personal</label>
                <select
                  name="datosPersonales"
                  className="form-select form-select-sm w-auto shadow-sm"
                  value={privacidad.datosPersonales}
                  onChange={handleChange}
                  style={{ borderColor: "var(--accent)" }}
                >
                  <option>Público</option>
                  <option>Solo Amigos</option>
                  <option>Privado</option>
                </select>
              </div>
              <p className="small text-muted ps-1">
                Privatiza tu descripción biográfica, localidad, edad y género literario favorito.
              </p>
            </div>
          </div>

          <div className="text-center mt-5">
            <button type="submit" className="btn-add-vault px-5 py-2">
              Guardar preferencias
            </button>
          </div>
        </div>
      </div>

      <div className="col-lg-4 text-center">
        <div className="perfil-card p-4 h-100 d-flex flex-column align-items-center justify-content-between">
          <div>
            <h5 className="mb-3" style={{ fontFamily: "var(--font-titulos)" }}>Seguridad</h5>
            <div
              className="mb-3 bg-light d-flex align-items-center justify-content-center shadow-sm mx-auto"
              style={{ width: "100px", height: "100px", borderRadius: "50%" }}
            >
              <i className="bi bi-shield-check text-success" style={{ fontSize: "2.5rem" }}></i>
            </div>
            <p className="small text-muted mt-3">
              En ReadingVault, tú decides qué partes de tu viaje literario quieres compartir con el mundo.
            </p>
          </div>

          <div className="zona-peligro w-100 p-3 rounded" style={{ backgroundColor: "#fff5f5" }}>
            <p className="small fw-bold text-danger mb-2">Zona Crítica</p>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm w-100 fw-bold"
              onClick={handleBorrarCuenta}
            >
              Borrar cuenta definitivamente
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}