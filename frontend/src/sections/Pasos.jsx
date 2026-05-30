import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../assets/css/pasos.css';

gsap.registerPlugin(ScrollTrigger);

export default function Pasos() {
  const sectionRef = useRef(null);
  const pathRef = useRef(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    // Usamos gsap.context para que todas las animaciones se limpien automáticamente
    let ctx = gsap.context(() => {
      const pathLength = path.getTotalLength();
      const icons = sectionRef.current.querySelectorAll('.paso__icono-wrapper');

      // Configuración inicial del path
      gsap.set(path, { strokeDasharray: pathLength, strokeDashoffset: pathLength });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top center",
          end: "bottom center",
          scrub: 1,
        }
      });

      // Animación de la línea
      tl.to(path, {
        strokeDashoffset: 0,
        ease: "none",
        duration: 1
      }, 0);

      // Animación de los iconos
      icons.forEach((icon, index) => {
        const startTimes = [0.02, 0.30, 0.60, 0.80];
        const startTime = startTimes[index];

        tl.to(icon, {
          backgroundColor: "#068187",
          boxShadow: "0 0 50px #00f2ff",
          scale: 1.15,
          duration: 0.1,
        }, startTime);

        tl.to(icon.querySelector('.paso__img'), {
          filter: 'brightness(0) saturate(100%) invert(0%)', // Simula cambio a negro
          opacity: 1,
          duration: 0.1,
        }, startTime);
      });
    }, sectionRef); // El scope es sectionRef

    return () => ctx.revert(); // Limpieza al desmontar el componente
  }, []);

  return (
    <section className="pasos" ref={sectionRef}>
      <div className="container-custom">
        <div className="pasos__content-relative"> 
          <img src="/img/reading.svg" alt="Reading" className="pasos__ilustracion pasos__ilustracion-movil" />
          
          <svg className="pasos__svg-line" viewBox="0 0 500 1000" preserveAspectRatio="none">
            <defs>
              <filter id="energy-distorsion">
                <feTurbulence type="turbulence" baseFrequency="0.5" numOctaves="1" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="15" />
              </filter>
            </defs>

            <path
              ref={pathRef}
              className="mecha-encendida"
              d="M 66 78 Q 50 221 247 188 Q 455 109 439 309 Q 416 460 242 383 Q 28 344 67 519 Q 68 641 245 602 Q 428 559 434 712 Q 396 863 202 881"
              filter="url(#energy-distorsion)"
            />
          </svg>

          <div className="pasos__grid">
            <div className="paso__item item-izquierda">
              <div className="paso__icono-wrapper">
                <img src="/img/user.svg" alt="User" className="paso__img" />
              </div>
              <div className="paso__info">
                <h2 className="paso__titulo">Crea tu cuenta</h2>
                <p className="paso__descripcion">Regístrate en segundos y personaliza tu perfil lector de forma única.</p>
              </div>
            </div>
            <div className="paso__item item-derecha">
              <div className="paso__info text-right">
                <h2 className="paso__titulo">Añade tus libros</h2>
                <p className="paso__descripcion">Marca libros como leídos, en progreso o pendientes en tu biblioteca.</p>
              </div>
              <div className="paso__icono-wrapper">
                <img src="/img/varios-libros.svg" alt="Books" className="paso__img" />
              </div>
            </div>
            <div className="paso__item item-izquierda">
              <div className="paso__icono-wrapper">
                <img src="/img/grafico.svg" alt="Gráfico" className="paso__img" />
              </div>
              <div className="paso__info">
                <h2 className="paso__titulo">Analiza tu lectura</h2>
                <p className="paso__descripcion">Consulta estadísticas detalladas y visualiza tu evolución como lector.</p>
              </div>
            </div>
            <div className="paso__item item-derecha">
              <div className="paso__info text-right">
                <h2 className="paso__titulo">Comparte y participa</h2>
                <p className="paso__descripcion">Conecta con amigos y forma parte activa de grupos de lectura.</p>
              </div>
              <div className="paso__icono-wrapper">
                <img src="/img/conexion.svg" alt="Conexión" className="paso__img" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}