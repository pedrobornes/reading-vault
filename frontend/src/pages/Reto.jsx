import React, { useState, useEffect } from "react";
import RetoHeader from "../components/RetoHeader";
import "../assets/css/paginaReto.css";

const Reto = () => {
  const [paginasPasadas, setPaginasPasadas] = useState([]);
  const [datosReto, setDatosReto] = useState({
    leidos: 0,
    objetivo: 20,
    paginasTotales: 0,
    diasSeguidos: 0, //futuro
  });

  const ULTIMA_PAGINA_ID = 3;

  useEffect(() => {
    const sesion = JSON.parse(localStorage.getItem("usuario"));
    if (sesion) {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Obtener libros para calcular progreso y páginas totales
      fetch(
        `http://localhost:8080/api/bibliotecas/usuario/${sesion.idUsuario}/completa`,
        { headers },
      )
        .then((res) => res.json())
        .then((items) => {
          // Filtramos por libros en estantería "Leído"
          const librosLeidos = items.filter(
            (item) => item.estanteria?.nombre === "Leído",
          );

          // Sumamos todas las páginas de los libros leídos
          const sumaPaginas = librosLeidos.reduce(
            (acc, item) => acc + (item.libro?.paginas || 0),
            0,
          );

          setDatosReto((prev) => ({
            ...prev,
            leidos: librosLeidos.length,
            paginasTotales: sumaPaginas,
          }));
        })
        .catch((err) => console.error("Error cargando reto:", err));
    }
  }, []);

  const manejarPasoPagina = (id) => {
    if (id !== ULTIMA_PAGINA_ID && !paginasPasadas.includes(id)) {
      setPaginasPasadas([...paginasPasadas, id]);
    }
  };

  const reiniciarLibro = () => setPaginasPasadas([]);

  const librosRestantes = Math.max(datosReto.objetivo - datosReto.leidos, 0);
  const porcentaje = Math.min(
    (datosReto.leidos / datosReto.objetivo) * 100,
    100,
  );
  const mediaPaginas =
    datosReto.leidos > 0 ? Math.round(datosReto.paginasTotales / 30) : 0; // Media ejemplo (último mes)

  return (
    <div className="pagina-reto">
      <RetoHeader />

      <main className="reto-main-content">
        {/* TARJETA 3 - ESTADÍSTICAS (FONDO) */}
        <section
          className={`reto-card ultima-hoja ${paginasPasadas.includes(3) ? "pagina-pasada" : ""}`}
          style={{ zIndex: 1 }}
        >
          <div className="reto-card__title-container">
            <h3 className="reto-card__title">Estadísticas de lectura</h3>
          </div>
          <div className="reto-card__body flex-column align-items-center">
            <div className="d-flex justify-content-around w-100 mt-5">
              <div className="text-center">
                <h4
                  style={{ color: "var(--color-amarillo)", fontSize: "3rem" }}
                >
                  47
                </h4>
                <p style={{ fontSize: "1.2rem" }}>Días seguidos</p>
              </div>
              <div className="text-center">
                <h4 style={{ color: "var(--color-salmon)", fontSize: "3rem" }}>
                  {datosReto.leidos}
                </h4>
                <p style={{ fontSize: "1.2rem" }}>Libros leídos</p>
              </div>
            </div>
            <button
              onClick={reiniciarLibro}
              className="btn-add-progress"
              style={{ marginTop: "50px" }}
            >
              Cerrar Libro
            </button>
          </div>
        </section>

        {/* TARJETA 2 - PÁGINAS (MEDIO) */}
        <section
          className={`reto-card ${paginasPasadas.includes(2) ? "pagina-pasada" : ""}`}
          style={{ zIndex: 2 }}
          onClick={() => manejarPasoPagina(2)}
        >
          <div className="reto-card__title-container">
            <h3 className="reto-card__title">Páginas leídas en total</h3>
          </div>
          <div className="reto-card__body">
            <div className="reto-card__icon-circle">
              <i className="bi bi-text-paragraph"></i>
            </div>
            <div className="reto-card__data" style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: "1.3rem",
                  color: "var(--color-verde-oscuro)",
                  paddingTop: "20px",
                }}
              >
                Has devorado un total de{" "}
                <strong>{datosReto.paginasTotales} páginas</strong>
              </p>
              <p
                style={{
                  fontSize: "1rem",
                  color: "var(--color-verde-oscuro)",
                  paddingTop: "20px",
                }}
              >
                Eso es una media increíble. ¡Sigue así, devora-libros!
              </p>
            </div>
          </div>
        </section>

        {/* TARJETA 1 - PROGRESO (ARRIBA) */}
        <section
          className={`reto-card ${paginasPasadas.includes(1) ? "pagina-pasada" : ""}`}
          style={{ zIndex: 3 }}
          onClick={() => manejarPasoPagina(1)}
        >
          <div className="reto-card__title-container">
            <h3 className="reto-card__title">Progreso de tu reto</h3>
          </div>

          <div className="reto-card__body">
            <div className="reto-card__icon-circle">
              <i className="bi bi-book"></i>
            </div>

            <div className="reto-card__data" style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: "1.3rem",
                  color: "var(--color-verde-oscuro)",
                  paddingTop: "20px",
                }}
              >
                {librosRestantes > 0 ? (
                  <>
                    Te quedan sólo <strong>{librosRestantes} libros</strong>{" "}
                    para completar el desafío.
                  </>
                ) : (
                  <strong>¡Felicidades! Has completado tu reto anual.</strong>
                )}
              </p>

              <div className="reto-progress-bar">
                <div
                  className="reto-progress-bar__fill"
                  style={{ width: `${porcentaje}%` }}
                ></div>
              </div>
              <p
                style={{
                  fontSize: "1rem",
                  color: "var(--color-verde-oscuro)",
                  paddingTop: "20px",
                }}
              >
                {datosReto.leidos} leídos de {datosReto.objetivo}
              </p>
            </div>
          </div>
        </section>
      </main>
      <section className="reto-banner">
        <div className="reto-banner__textboton">
          <div className="reto-banner__text">
            <h2 className="text-verde">Cada página cuenta,</h2>
            <h2 className="text-amarillo">tú marcas el ritmo</h2>
          </div>
          <div className="reto-banner__button-wrapper">
            <button className="btn-progreso">
              <span>Añadir progreso de lectura</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Reto;
