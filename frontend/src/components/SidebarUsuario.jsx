import { useNavigate } from "react-router-dom";

export function SidebarUsuario({ user, stats, sonAmigos }) {
  const navigate = useNavigate(); //
  // Recuperamos la sesion
  const miSesion = JSON.parse(localStorage.getItem("usuario"));
  const miId = miSesion ? miSesion.idUsuario : null;

  const leidos = stats?.leidos || 0;
  const resenas = stats?.resenas || 0;
  const objetivo = stats?.objetivoReto || 20;

  // Calculo para el porcentaje del reto
  const porcentaje = Math.round((leidos / objetivo) * 100);
  if (!user) return null;

  const FOTO_DEFAULT = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const puedeVer = (nivelPrivacidad) => {
    if (miId && user.idUsuario === miId) return true;
    if (nivelPrivacidad === "Público") return true;
    if (nivelPrivacidad === "Solo Amigos" && sonAmigos) return true;
    return false;
  };

  return (
    <aside className="sidebar-perfil">
      <div className="text-center mb-4">
        <img
          src={user.fotoPerfil || FOTO_DEFAULT}
          className="foto-perfil-circulo"
          alt="Perfil"
        />
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
              Has leído <strong>{leidos}</strong> de {objetivo} libros
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
                  width: `${porcentaje}%`,
                  backgroundColor: "var(--color-amarillo)",
                  borderRadius: "10px",
                  transition: "width 1s ease-in-out",
                }}
              ></div>
            </div>
            <button
              className="btn btn-vault w-100"
              onClick={() => navigate("/reto")} 
            >
              Ver mi reto
            </button>
          </>
        ) : (
          <p className="text-muted small text-center mb-0">Actividad privada</p>
        )}
      </div>
    </aside>
  );
}
