import { useNavigate } from "react-router-dom";

export function SidebarUsuario({ user, stats, estadoRelacion, onAccionAmigo }) {
  const navigate = useNavigate();
  
  // Recuperamos la sesión actual para comparar IDs
  const miSesion = JSON.parse(localStorage.getItem("usuario"));
  const miId = miSesion ? miSesion.idUsuario : null;

  // Comprobamos los estados de la relación
  const esMiPropioPerfil = miId && user?.idUsuario === miId;
  const sonAmigos = estadoRelacion === "ACEPTADA";
  const solicitudPendiente = estadoRelacion === "PENDIENTE";

  const leidos = stats?.leidos || 0;
  const resenas = stats?.resenas || 0;
  const objetivo = stats?.objetivoReto || 20;
  const porcentaje = Math.round((leidos / objetivo) * 100);

  if (!user) return null;

  const FOTO_DEFAULT = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  // Lógica de privacidad simplificada
  const puedeVer = (nivelPrivacidad) => {
    if (esMiPropioPerfil) return true;
    if (nivelPrivacidad === "Público") return true;
    if (nivelPrivacidad === "Solo Amigos" && sonAmigos) return true;
    return false;
  };

  // Función para renderizar el botón de amistad según el estado
  const renderBotonAmistad = () => {
    if (esMiPropioPerfil) return null; // No sale nada en mi propio perfil

    if (sonAmigos) {
      return (
        <button className="btn btn-outline-success w-100 rounded-pill disabled mt-2">
          <i className="bi bi-check-lg me-2"></i>Amigo
        </button>
      );
    }

    if (solicitudPendiente) {
      return (
        <button className="btn btn-light w-100 rounded-pill disabled mt-2 border">
          <i className="bi bi-clock-history me-2"></i>Pendiente
        </button>
      );
    }

    return (
      <button 
        className="btn btn-vault w-100 rounded-pill mt-2" 
        onClick={onAccionAmigo}
      >
        <i className="bi bi-person-plus-fill me-2"></i>Añadir amigo
      </button>
    );
  };

  return (
    <aside className="sidebar-perfil">
      <div className="text-center mb-4">
        <img
          src={user.fotoPerfil || FOTO_DEFAULT}
          className="foto-perfil-circulo"
          alt="Perfil"
        />
        
        {/* Renderizamos el botón de amistad debajo de la foto si no es mi perfil */}
        {renderBotonAmistad()}
      </div>

      {/* Bloque Resumen */}
      <div className="perfil-card text-center">
        <h5 className="sidebar-titulo">Resumen</h5>
        {puedeVer(user.privacidadPerfil) ? (
          <div className="row">
            <div className="col-6 border-end mb-3">
              <p className="small mb-0 text-muted">Leídos</p>
              <span className="fw-bold text-dark">{leidos}</span>
            </div>
            <div className="col-6 mb-3">
              <p className="small mb-0 text-muted">Reseñas</p>
              <span className="fw-bold text-dark">{resenas}</span>
            </div>
            <div className="col-6 border-end">
              <p className="small mb-0 text-muted">Siguiendo</p>
              <span className="fw-bold text-dark">142</span>
            </div>
            <div className="col-6">
              <p className="small mb-0 text-muted">Seguidores</p>
              <span className="fw-bold text-dark">89</span>
            </div>
          </div>
        ) : (
          <div className="py-2">
            <i className="bi bi-lock-fill text-muted"></i>
            <p className="text-muted small mb-0">Contenido privado</p>
          </div>
        )}
      </div>

      {/* Bloque Reto Anual */}
      <div className="perfil-card">
        <h5 className="sidebar-titulo">RETO ANUAL</h5>
        {puedeVer(user.privacidadLibros) ? (
          <>
            <p className="small text-center mb-2">
              {esMiPropioPerfil ? "Has leído" : `${user.nombre} ha leído`} <strong>{leidos}</strong> de {objetivo} libros
            </p>
            <div
              className="progress mb-3"
              style={{
                height: "12px",
                backgroundColor: "#e9ecef",
                borderRadius: "10px",
              }}
            >
              <div
                className="progress-bar"
                style={{
                  width: `${Math.min(porcentaje, 100)}%`,
                  backgroundColor: "var(--color-amarillo)",
                  borderRadius: "10px",
                  transition: "width 1s ease-in-out",
                }}
              ></div>
            </div>
            
            {esMiPropioPerfil && (
              <button
                className="btn btn-vault w-100"
                onClick={() => navigate("/reto")} 
              >
                Ver mi reto
              </button>
            )}
          </>
        ) : (
          <p className="text-muted small text-center mb-0">Actividad privada</p>
        )}
      </div>
    </aside>
  );
}