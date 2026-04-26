export default function HeaderUsuario({ user }) {
  if (!user) return null;
  // Para calcular la edad
  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return "??";

    const hoy = new Date();
    const cumple = new Date(fechaNacimiento);

    let edad = hoy.getFullYear() - cumple.getFullYear();
    const mes = hoy.getMonth() - cumple.getMonth();

    // Ajuste por si aún no ha cumplido años este año
    if (mes < 0 || (mes === 0 && hoy.getDate() < cumple.getDate())) {
      edad--;
    }
    return edad;
  };

  const miSesion = JSON.parse(localStorage.getItem("usuario"));
  const esOtroUsuario = miSesion && miSesion.idUsuario !== user.idUsuario;
  return (
    <div className="perfil-card">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "10px" }}>
            {user.nombreUsuario}
          </h1>
          <p className="mb-1">
            <span className="dato-etiqueta">Edad:</span>
            {calcularEdad(user.fechaNacimiento)}
          </p>
          <p className="mb-1">
            <span className="dato-etiqueta">Localidad:</span>{" "}
            {user.localidad || "Sevilla"}
          </p>
          <p className="mb-1">
            <span className="dato-etiqueta">Género favorito:</span>{" "}
            {user.genero?.nombre || "Misterio"}
          </p>
        </div>

        <div className="text-end">
          {esOtroUsuario ? (
            <p className="small text-muted">
              Última vez en línea: {formatearFecha(user.ultimaConexion)}
            </p>
          ) : (
            <p className="small text-success fw-bold">● En línea ahora</p>
          )}
          <div
            className="logro-box p-3"
            style={{
              backgroundColor: "var(--color-azul-footer)",
              borderRadius: "10px",
            }}
          >
            <h6 className="mb-1">Logro destacado</h6>
            <p className="small mb-0">⭐ 5 años de antigüedad</p>
          </div>
        </div>
      </div>

      <div className="bio-block mt-4">
        “{user.biografia || "Lector apasionado..."}”
      </div>
    </div>
  );
}
