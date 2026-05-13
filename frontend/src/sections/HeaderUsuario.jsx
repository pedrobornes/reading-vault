import { Link } from 'react-router-dom';

export default function HeaderUsuario({ user, sonAmigos, permisoDatos }) {
  if (!user) return null;

  const miSesion = JSON.parse(localStorage.getItem("usuario"));
  const esMiPerfil = miSesion && miSesion.idUsuario === user.idUsuario;

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return "??";
    const hoy = new Date();
    const cumple = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - cumple.getFullYear();
    const mes = hoy.getMonth() - cumple.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < cumple.getDate())) {
      edad--;
    }
    return edad;
  };

  const obtenerEstadoOnline = (ultimaConexion) => {
    if (!ultimaConexion) return { online: false, texto: "Desconectado" };

    const ultima = new Date(ultimaConexion);
    const ahora = new Date();
    
    // Calculamos la diferencia en minutos para el estado "En línea"
    const diferenciaMinutos = (ahora - ultima) / 1000 / 60;
    if (diferenciaMinutos < 5) return { online: true, texto: "● En línea ahora" };

    // Comparamos si la fecha es hoy
    const esHoy = ultima.getDate() === ahora.getDate() &&
                 ultima.getMonth() === ahora.getMonth() &&
                 ultima.getFullYear() === ahora.getFullYear();

    if (esHoy) {
      return { online: false, texto: "Última vez: Hoy" };
    } else {
      return { online: false, texto: `Última vez: ${ultima.toLocaleDateString()}` };
    }
  };

  const estado = obtenerEstadoOnline(user.ultimaConexion);

  return (
    <div 
      className="perfil-card shadow-sm" 
      style={{ 
        borderLeft: "5px solid var(--color-azul-footer)",
        position: "relative" 
      }}
    >
      <div 
        style={{ 
          position: "absolute", 
          top: "20px", 
          right: "25px", 
          textAlign: "right" 
        }}
      >
        {esMiPerfil || estado.online ? (
          <span className="small text-success fw-bold" style={{ whiteSpace: 'nowrap' }}>
            ● En línea ahora
          </span>
        ) : (
          <span className="small text-muted italic" style={{ whiteSpace: 'nowrap' }}>
            {estado.texto}
          </span>
        )}
      </div>

      <div className="header-info-container">
        <div className="d-flex align-items-center gap-3 mb-3">
          <h1 style={{ fontSize: "2.2rem", margin: 0, color: "var(--color-marron-oscuro)" }}>
            {user.nombreUsuario}
          </h1>

          {esMiPerfil && (
            <Link
              to="/ajustesCuenta"
              className="btn btn-sm btn-outline-secondary py-0 px-3"
              style={{ borderRadius: "15px", fontSize: "0.75rem", height: "24px", lineHeight: "22px" }}
            >
              Ajustes de la cuenta
            </Link>
          )}
        </div>

        {permisoDatos ? (
          <>
            <div className="d-flex flex-wrap gap-4 mb-2">
              <p className="mb-1">
                <span className="dato-etiqueta fw-bold">Edad:</span> {calcularEdad(user.fechaNacimiento)}
              </p>
              <p className="mb-1">
                <span className="dato-etiqueta fw-bold">Localidad:</span> {user.localidad || "No especificada"}
              </p>
            </div>

            <div className="mb-2 d-flex align-items-center gap-2 flex-wrap">
              <span className="dato-etiqueta fw-bold">Géneros favoritos:</span>
              {user.generosFavoritos && user.generosFavoritos.length > 0 ? (
                user.generosFavoritos.map((genero) => (
                  <span 
                    key={genero.idGenero || genero.id} 
                    className="badge bg-light text-dark border shadow-sm"
                    style={{ fontSize: '0.75rem', fontWeight: '500' }}
                  >
                    {genero.nombre}
                  </span>
                ))
              ) : (
                <span className="text-muted small">No definidos</span>
              )}
            </div>

            <div className="bio-block mt-3 p-2 rounded" style={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
              <span className="fst-italic text-muted">
                “{user.biografia || "Este lector prefiere dejar su historia en blanco..."}”
              </span>
            </div>
          </>
        ) : (
          <div className="mt-2 p-3 border rounded bg-light">
            <p className="small text-muted italic mb-0">
              <i className="bi bi-shield-lock-fill me-2"></i> 
              La información personal de este perfil es privada.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}