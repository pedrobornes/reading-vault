import { useNavigate } from "react-router-dom";
import "../assets/css/sidebarUsuario.css";

export function SidebarUsuario({ 
  user, 
  stats, 
  estadoRelacion, 
  onAccionAmigo, 
  onEliminarAmigo, 
  permisoLibros, 
  permisoDatos 
}) {
  const navigate = useNavigate();
  
  const miSesion = JSON.parse(localStorage.getItem("usuario"));
  const miId = miSesion ? miSesion.idUsuario : null;

  const esMiPropioPerfil = miId && user?.idUsuario === miId;
  const sonAmigos = estadoRelacion === "ACEPTADA";
  const solicitudPendiente = estadoRelacion === "PENDIENTE";

  const leidos = stats?.leidos || 0;
  const resenas = stats?.resenas || 0;
  const amigosCount = stats?.amigos || 0;
  const gruposCount = stats?.grupos || 0;
  const objetivo = stats?.objetivoReto || 20;
  const porcentaje = Math.round((leidos / objetivo) * 100);

  if (!user) return null;

  const FOTO_DEFAULT = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const navegarAmigos = () => {
    if (permisoLibros) {
      navigate(`/usuarios/${user.idUsuario}/amigos`);
    }
  };

  const renderBotonAmistad = () => {
    if (esMiPropioPerfil) return null;

    if (sonAmigos) {
      return (
        <button 
          type="button"
          className="btn btn-outline-success w-100 rounded-pill mt-2 btn-amigo-status"
          onClick={(e) => {
            e.preventDefault();
            onEliminarAmigo();
          }}
        >
          <i className="bi bi-check-lg me-2 icon-check"></i>
          <i className="bi bi-x-lg me-2 icon-x d-none"></i>
          <span className="btn-text">Amigo</span>
        </button>
      );
    }

    if (solicitudPendiente) {
      return (
        <button type="button" className="btn btn-light w-100 rounded-pill disabled mt-2 border">
          <i className="bi bi-clock-history me-2"></i>Pendiente
        </button>
      );
    }

    return (
      <button 
        type="button"
        className="btn btn-vault w-100 rounded-pill mt-2" 
        onClick={onAccionAmigo}
      >
        <i className="bi bi-person-plus-fill me-2"></i>Añadir amigo
      </button>
    );
  };

  return (
    <aside className="sidebar-perfil">
      <div className="text-center mb-2">
        <img
          src={user.fotoPerfil || FOTO_DEFAULT}
          className="foto-perfil-circulo"
          alt="Perfil"
        />
        <h4 className="mt-3 sidebar-nombre-usuario">{user.nombreUsuario}</h4>
        {renderBotonAmistad()}
      </div>

      <div className="perfil-card text-center">
        <h5 className="sidebar-titulo">Resumen</h5>
        {permisoLibros ? (
          <div className="row">
            <div className="col-6 border-end mb-3">
              <p className="small mb-0 text-muted">Leídos</p>
              <span className="fw-bold text-dark">{leidos}</span>
            </div>
            <div className="col-6 mb-3">
              <p className="small mb-0 text-muted">Reseñas</p>
              <span className="fw-bold text-dark">{resenas}</span>
            </div>

            <div 
              className="col-6 border-end stat-clicable" 
              onClick={navegarAmigos}
              title="Ver lista de amigos"
            >
              <p className="small mb-0 text-muted">Amigos</p>
              <span className="fw-bold text-dark">{amigosCount}</span>
            </div>
            
            <div className="col-6">
              <p className="small mb-0 text-muted">Grupos</p>
              <span className="fw-bold text-dark">{gruposCount}</span>
            </div>
          </div>
        ) : (
          <div className="py-2">
            <i className="bi bi-eye-slash text-muted"></i>
            <p className="text-muted small mb-0">Resumen privado</p>
          </div>
        )}
      </div>

      <div className="perfil-card">
        <h5 className="sidebar-titulo">RETO ANUAL</h5>
        {permisoLibros ? (
          <>
            <p className="small text-center mb-2">
              {esMiPropioPerfil ? "Has leído" : `${user.nombreUsuario} ha leído`} <strong>{leidos}</strong> de {objetivo} libros
            </p>
            <div className="progress progress-reto-container mb-3">
              <div
                className="progress-bar progress-reto-bar"
                style={{ width: `${Math.min(porcentaje, 100)}%` }}
              ></div>
            </div>
            
            {esMiPropioPerfil && (
              <button
                type="button"
                className="btn btn-vault w-100"
                onClick={() => navigate("/reto")} 
              >
                Ver mi reto
              </button>
            )}
          </>
        ) : (
          <p className="text-muted small text-center mb-0">Progreso del reto privado</p>
        )}
      </div>
    </aside>
  );
}