import React, { useState } from "react";
import RetoHeader from "../components/RetoHeader";
import "../assets/css/paginaReto.css";

const Reto = () => {
  const [paginasPasadas, setPaginasPasadas] = useState([]);
const ULTIMA_PAGINA_ID = 3;
  const manejarPasoPagina = (id) => {
   if (id !== ULTIMA_PAGINA_ID && !paginasPasadas.includes(id)) {
      setPaginasPasadas([...paginasPasadas, id]);
    }
  };

  const reiniciarLibro = () => setPaginasPasadas([]);

  return (
    <div className="pagina-reto">
      <RetoHeader />

      <main className="reto-main-content">
        {/* TARJETA 3 - ESTADÍSTICAS (FONDO) */}
       <section
          className={`reto-card ultima-hoja ${paginasPasadas.includes(3) ? "pagina-pasada" : ""}`}
          style={{ zIndex: 1 }}
          onClick={() => manejarPasoPagina(3)}
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
                  12
                </h4>
                <p style={{ fontSize: "1.2rem" }}>Libros leídos</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                reiniciarLibro();
              }}
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
                  paddingTop: "20px"
                }}
              >
                Has devorado un total de <strong>4000 páginas</strong>
              </p>
              <p
                style={{
                  fontSize: "1rem",
                  color: "var(--color-verde-oscuro)",
                  paddingTop: "20px"
                }}
              >
                Eso es una media de 18 páginas al día. ¡Sigue así!
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
          {/* El título ahora tiene su propio contenedor blanco arriba */}
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
                  paddingTop: "20px"
                }}
              >
                Te quedan sólo <strong>2 libros</strong> para completar el
                desafío de este año.
              </p>

              <div className="reto-progress-bar">
                <div
                  className="reto-progress-bar__fill"
                  style={{ width: "80%" }}
                ></div>
              </div>
              <p
                style={{
                  fontSize: "1rem",
                  color: "var(--color-verde-oscuro)",
                  paddingTop: "20px"
                }}
              >
                18 leídos de 20 
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="reto-footer">{/* Tu footer normal */}</footer>
    </div>
  );
};

export default Reto;
