// src/components/Nosotros.jsx
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import '../assets/css/nosotros.css';

export default function Nosotros() {
  const olaRef = useRef(null);

  useEffect(() => {
    // Animación sutil para que las olas parezcan vivas
    gsap.to(".ola-path", {
      x: 20,
      repeat: -1,
      yoyo: true,
      duration: 3,
      ease: "sine.inOut"
    });
  }, []);

  return (
    <section className="nosotros" id="nosotros">
      {/* Fondo con doble ola para mayor profundidad visual */}
      <div className="nosotros__bg-olas" ref={olaRef}>
        <svg viewBox="0 0 1440 600" preserveAspectRatio="none" className="ola-svg">
          {/* Ola de fondo (más clara) */}
          <path 
            className="ola-path ola-fondo"
            d="M-100,350 C200,150 400,550 720,350 C1040,150 1240,550 1540,350" 
            stroke="rgba(158, 188, 182, 0.4)" 
            strokeWidth="200" 
            fill="none" 
          />
          {/* Ola principal (más marcada) */}
          <path 
            className="ola-path ola-principal"
            d="M-100,300 C300,100 500,500 820,300 C1140,100 1340,500 1640,300" 
            stroke="#9EBCB6" 
            strokeWidth="220" 
            fill="none" 
          />
        </svg>
      </div>

      <div className="container-custom content-front">
        <div className="nosotros__layout">
          <div className="nosotros__col-izq">
            <h2 className="nosotros__titulo">Sobre Nosotros</h2>
          </div>
          
          <div className="nosotros__col-der">
            <p className="nosotros__parrafo">
              Creamos una plataforma donde puedas organizar tus libros, visualizar tu progreso lector y 
              formar parte de una comunidad que te motiva a leer más y mejor.
            </p>
            <p className="nosotros__parrafo">
              Este proyecto nace de la necesidad de tener un espacio sencillo y completo para lectores, 
              creado por estudiantes de desarrollo web que querían unir tecnología, lectura y comunidad en un solo lugar.
            </p>
            <p className="nosotros__parrafo">
              Cada vez más lectores utilizan la plataforma para seguir sus lecturas, compartir opiniones 
              y participar en grupos que hacen de la lectura una experiencia compartida.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}