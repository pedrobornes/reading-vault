import { Link } from 'react-router-dom';

export default function HeaderUsuario({ user, sonAmigos }) {
  if (!user) return null;

  // 1. Obtener mi sesión para comparar IDs
  const miSesion = JSON.parse(localStorage.getItem("usuario"));
  const esMiPerfil = miSesion && miSesion.idUsuario === user.idUsuario;

  // 2. Función para calcular la edad
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

  // 3. Lógica dinámica para el estado "En línea"
  const obtenerEstadoOnline = (ultimaConexion) => {
    if (!ultimaConexion) return { online: false, texto: "Desconectado" };

    const ultima = new Date(ultimaConexion);
    const ahora = new Date();
    const diferenciaMinutos = (ahora - ultima) / 1000 / 60;

    // Si la actividad fue hace menos de 5 minutos, está online
    if (diferenciaMinutos < 5) {
      return { online: true, texto: "● En línea ahora" };
    }
    
    // Si no, mostramos la fecha y hora de la última vez
    return { 
      online: false, 
      texto: `Última vez: ${ultima.toLocaleDateString()} a las ${ultima.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
    };
  };

  const estado = obtenerEstadoOnline(user.ultimaConexion);

  // 4. Lógica de Privacidad
  const puedeVerDatos = () => {
    if (esMiPerfil) return true; 
    if (user.privacidadDatos === "Público") return true;
    if (user.privacidadDatos === "Solo Amigos" && sonAmigos) return true;
    return false;
  };

  return (
    <div className="perfil-card">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <div className="d-flex align-items-center gap-3 mb-2">
            <h1 style={{ fontSize: "2rem", margin: 0 }}>
              {user.nombreUsuario}
            </h1>

            {esMiPerfil && (
              <Link
                to="/ajustesCuenta"
                className="btn btn-sm btn-outline-secondary py-0 px-2"
                style={{ borderRadius: "15px", fontSize: "0.8rem", height: "22px" }}
              >
                Ajustes de la cuenta
              </Link>
            )}
          </div>

          {/* DATOS PROTEGIDOS POR PRIVACIDAD */}
          {puedeVerDatos() ? (
            <>
              <p className="mb-1">
                <span className="dato-etiqueta">Edad:</span> {calcularEdad(user.fechaNacimiento)}
              </p>
              <p className="mb-1">
                <span className="dato-etiqueta">Localidad:</span> {user.localidad || "No especificada"}
              </p>
            </>
          ) : (
            <p className="small text-muted italic">
              <i className="bi bi-shield-lock me-1"></i> Información de perfil privada
            </p>
          )}

          <p className="mb-1">
            <span className="dato-etiqueta">Género favorito:</span>{" "}
            {user.generosFavoritos && user.generosFavoritos.length > 0 
              ? user.generosFavoritos[0].nombre 
              : "Misterio"}
          </p>
        </div>

        <div className="text-end">
          {/* ESTADO ONLINE DINÁMICO */}
          {esMiPerfil || estado.online ? (
            <p className="small text-success fw-bold">● En línea ahora</p>
          ) : (
            <p className="small text-muted italic">{estado.texto}</p>
          )}
          
          <div className="logro-box p-3 mt-2" style={{ backgroundColor: "var(--color-azul-footer)", borderRadius: "10px" }}>
            <h6 className="mb-1 text-white">Logro destacado</h6>
            <p className="small mb-0 text-white-50">⭐ Miembro veterano</p>
          </div>
        </div>
      </div>

      <div className="bio-block mt-4">
        {puedeVerDatos() ? (
          <span className="fst-italic">“{user.biografia || "Sin biografía disponible..."}”</span>
        ) : (
          <span className="text-muted small italic">La biografía es privada.</span>
        )}
      </div>
    </div>
  );
}