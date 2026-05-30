// src/components/Nosotros.jsx
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import '../assets/css/nosotros.css';

export default function Nosotros() {
  const olaRef = useRef(null);

  // Animación suave de las olas
  useEffect(() => {
    gsap.to(".ola-path", {
      x: 50,
      repeat: -1,
      yoyo: true,
      duration: 3,
      ease: "sine.inOut"
    });
  }, []);

  return (
    <section className="nosotros position-relative overflow-hidden py-5" id="nosotros">
      
      {/* Contenedor fondo olas. Se cambia zIndex a 0 para que no se esconda detrás del background */}
      <div className="nosotros__bg-olas position-absolute w-100 h-100" ref={olaRef} style={{ top: 0, left: 0, zIndex: 0 }}>
        
        {/* OLA PC: Visible solo en pantallas medianas y grandes */}
        <svg viewBox="0 0 1440 600" preserveAspectRatio="none" className="ola-svg w-100 h-100 d-none d-md-block">
          <path 
            className="ola-path ola-fondo"
            d="M-100,350 C200,150 400,550 720,350 C1040,150 1240,550 1540,350" 
            stroke="rgba(158, 188, 182, 0.4)" 
            strokeWidth="200" 
            fill="none" 
          />
          <path 
            className="ola-path ola-principal"
            d="M-100,300 C300,100 500,500 820,300 C1140,100 1340,500 1640,300" 
            stroke="#9EBCB6" 
            strokeWidth="220" 
            fill="none" 
          />
        </svg>

        {/* OLA MÓVIL: Visible solo en pantallas pequeñas */}
        <svg viewBox="0 0 600 1000" preserveAspectRatio="none" className="ola-svg w-100 h-100 d-block d-md-none">
          <path 
            className="ola-path ola-fondo"
            d="M-100,600 C100,400 300,800 700,600" 
            stroke="rgba(158, 188, 182, 0.4)" 
            strokeWidth="300" 
            fill="none" 
          />
          <path 
            className="ola-path ola-principal"
            d="M-100,550 C150,350 350,750 700,550" 
            stroke="#9EBCB6" 
            strokeWidth="320" 
            fill="none" 
          />
        </svg>

      </div>

      {/* Contenedor principal. Se añade zIndex: 1 para asegurar que el texto flote sobre las olas */}
      <div className="container-custom content-front position-relative mt-md-5" style={{ zIndex: 1 }}>
        <div className="row d-flex align-items-center">
          
          {/* Columna izq: Título */}
          <div className="col-12 col-md-5 mb-4 mb-md-0 text-center text-md-start">
            <h2 className="nosotros__titulo display-4 fw-bold">Sobre Nosotros</h2>
          </div>
          
          {/* Columna der: Textos */}
          <div className="col-12 col-md-7">
            <p className="nosotros__parrafo fs-5 mb-3">
              Creamos una plataforma donde puedas organizar tus libros, visualizar tu progreso lector y 
              formar parte de una comunidad que te motiva a leer más y mejor.
            </p>
            <p className="nosotros__parrafo text-muted mb-3">
              Este proyecto nace de la necesidad de tener un espacio sencillo y completo para lectores, 
              creado por estudiantes de desarrollo web que querían unir tecnología, lectura y comunidad en un solo lugar.
            </p>
            <p className="nosotros__parrafo text-muted">
              Cada vez más lectores utilizan la plataforma para seguir sus lecturas, compartir opiniones 
              y participar en grupos que hacen de la lectura una experiencia compartida.
            </p>
          </div>
          
        </div>
      </div>
    </section>
  );
}