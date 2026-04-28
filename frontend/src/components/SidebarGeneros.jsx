import React from 'react';
import '../assets/css/buscador.css';

// Componente para mostrar los géneros
const SidebarGeneros = ({ tusGeneros, todosLosGeneros, onGeneroClick, generoActivo }) => {
  return (
    <div className="sidebar-custom">
      
      {/* Sección: Tus Géneros */}
      <h3 className="sidebar-custom__title">Tus géneros</h3>
      <hr className="sidebar-custom__divider" />
      
      {/* Verifica si hay géneros favoritos */}
      {tusGeneros && tusGeneros.length > 0 ? (
        <ul className="sidebar-custom__list">
          {tusGeneros.map((genero, idx) => (
            <li 
              key={`tus-${idx}`} 
              className={`sidebar-custom__item ${generoActivo === genero ? "active" : ""}`}
              onClick={() => onGeneroClick(genero)}
            >
              {genero}
            </li>
          ))}
        </ul>
      ) : (
        <p className="sidebar-custom__empty">Aún no tienes favoritos</p>
      )}

      {/* Sección: Todos los Géneros */}
      <h3 className="sidebar-custom__title mt-5">Todos los géneros</h3>
      <hr className="sidebar-custom__divider" />
      
      <ul className="sidebar-custom__list">
        {todosLosGeneros.map((genero, idx) => (
          <li 
            key={`todos-${idx}`}
            className={`sidebar-custom__item ${generoActivo === genero ? "active" : ""}`}
            onClick={() => onGeneroClick(genero)}
          >
            {genero}
          </li>
        ))}
      </ul>
      
    </div>
  );
};

export default SidebarGeneros;