import React from "react";
import "../assets/css/retoHeader.css";

const RetoHeader = () => {
  const añoActual = 2025;

  return (
    <header className="reto-header">
      {/* Contenedor de la Imagen de fondo con Ondas */}
      <div className="reto-header__banner">
        <div className="reto-header__overlay"></div>

        {/* SVG de la onda superior */}
        <svg
          viewBox="0 0 1440 320"
          className="reto-header__wave"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          {/* Onda de fondo (lenta y sutil) */}
          <path
            opacity="0.5"
            fill="var(--color-azul-claro)"
            d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,90.7C640,85,768,107,864,128C960,149,1056,171,1152,149.3C1248,128,1344,64,1392,32L1440,0L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
          {/* Onda principal (más rápida) */}
          <path
            fill="var(--color-azul-claro)"
            d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,218.7C960,235,1056,213,1152,181.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>
      {/* Bloque de Textos */}
      <div className="reto-header__content">
        <div className="reto-header__logo-container">
          <h1 className="reto-header__logo-reading">Reading</h1>
          <h1 className="reto-header__logo-vault">Vault</h1>
        </div>

        <div className="reto-header__info-container">
          <h2 className="reto-header__title">
            TU RETO LECTOR DE <br />
            <span className="reto-header__year">{añoActual}</span>
          </h2>
          <p className="reto-header__subtitle">
            Marca tus objetivos, sigue tu proceso y <br />
            celebra cada libro leído
          </p>
        </div>
      </div>
    </header>
  );
};

export default RetoHeader;
