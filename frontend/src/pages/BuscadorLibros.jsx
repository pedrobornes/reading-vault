import React, { useState } from "react";
import axios from "axios";
import LibroCard from "../components/LibroCard";
import SidebarGeneros from "../components/SidebarGeneros";
import "../assets/css/buscador.css";

// Mapeo géneros
const mapaGeneros = {
  "Arte": "art", "Autoayuda": "self-help", "Biografía": "biography",
  "Ciencia Ficción": "science fiction", "Clásicos": "classics", "Crimen": "crime",
  "Fantasía": "fantasy", "Ficción": "fiction", "Historia": "history",
  "Comedia": "humor", "Infantil": "juvenile fiction", "Misterio": "mystery",
  "Novela": "fiction", "Paranormal": "body, mind & spirit", "Poesía": "poetry",
  "Romance": "romance", "Suspense": "suspense", "Terror": "horror", "Thriller": "thriller"
};

const BuscadorLibros = () => {
  const [libros, setLibros] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [generoActivo, setGeneroActivo] = useState(""); 
  const [orden, setOrden] = useState("relevance"); 
  const [pagina, setPagina] = useState(1); 

  // Simula géneros vacíos por usuario no logueado
  const tusGeneros = []; 

  // Petición a API y ordenación
  const obtenerLibros = async (busqueda, genero, ordenSeleccionado, paginaActual) => {
    let query = "";
    if (genero) {
      query = `subject:${mapaGeneros[genero] || genero}`;
    } else if (busqueda) {
      query = busqueda.trim();
    }

    if (!query) return;

    try {
      const response = await axios.get(
        `http://localhost:8080/api/libros/buscar?q=${query}&orderBy=relevance&pagina=${paginaActual}`
      );
      
      let resultados = response.data;
      if (ordenSeleccionado === "rating") {
        resultados = [...resultados].sort((a, b) => (b.valoracion || 0) - (a.valoracion || 0));
      }
      setLibros(resultados);
    } catch (error) {
      console.error("Error al obtener libros:", error);
    }
  };

  // Eventos de búsqueda
  const ejecutarBusqueda = (e) => {
    e.preventDefault();
    setGeneroActivo(""); 
    setPagina(1);
    obtenerLibros(textoBusqueda, "", orden, 1);
  };

  const buscarPorGenero = (generoEspanol) => {
    setTextoBusqueda(""); 
    setGeneroActivo(generoEspanol);
    setPagina(1);
    obtenerLibros("", generoEspanol, orden, 1);
  };

  const cambiarOrden = (e) => {
    const nuevoOrden = e.target.value;
    setOrden(nuevoOrden);
    setPagina(1);
    obtenerLibros(textoBusqueda, generoActivo, nuevoOrden, 1);
  };

  // Navegación de páginas
  const cambiarPagina = (nuevaPagina) => {
    setPagina(nuevaPagina);
    obtenerLibros(textoBusqueda, generoActivo, orden, nuevaPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const renderNumerosPagina = () => {
    const paginas = [];
    const maxPaginasVisibles = 5;
    let inicio = Math.max(1, pagina - 2);
    let fin = inicio + maxPaginasVisibles - 1;

    for (let i = inicio; i <= fin; i++) {
      paginas.push(
        <button
          key={i}
          className={`btn ${pagina === i ? 'btn-success' : 'btn-outline-success'} mx-1`}
          onClick={() => cambiarPagina(i)}
        >
          {i}
        </button>
      );
    }
    return paginas;
  };

  return (
    <div className="buscador-page">
      <div className="container-custom">
        <div className="row">
          <aside className="col-md-3">
            <SidebarGeneros
              tusGeneros={tusGeneros} // Pasamos el array vacío
              todosLosGeneros={Object.keys(mapaGeneros)}
              onGeneroClick={buscarPorGenero}
              generoActivo={generoActivo}
            />
          </aside>

          <main className="col-md-9">
            <div className="header-buscador">
              <h2 className="header-buscador__titulo">Encuentra tu próxima lectura</h2>
              <p className="header-buscador__subtitulo">Busca por título, autor o explora nuestros géneros</p>
            </div>
            <div className="search-bar">
              <form className="search-bar__form" onSubmit={ejecutarBusqueda}>
                <div className="search-bar__icon"><i className="bi bi-search"></i></div>
                <input
                  type="text"
                  className="search-bar__input"
                  placeholder="Busca por título, autor o género..."
                  value={textoBusqueda}
                  onChange={(e) => setTextoBusqueda(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="search-bar__button">Buscar</button>
              </form>
            </div>

            <div className="sort-section d-flex align-items-center mb-4">
              <span className="me-2">Ordenar por:</span>
              <select className="sort-section__select" value={orden} onChange={cambiarOrden}>
                <option value="relevance">Relevancia</option>
                <option value="rating">Mejor valorados</option>
              </select>
            </div>

            <div className="libros-grid">
              {libros.length > 0 ? (
                libros.map((libro, index) => <LibroCard key={index} libro={libro} />)
              ) : (
                <p className="libros-grid__mensaje">Usa el buscador para encontrar tus libros favoritos.</p>
              )}
            </div>

            {libros.length > 0 && (
              <div className="pagination-wrapper d-flex justify-content-center align-items-center mt-5 mb-5 gap-2">
                <button 
                  className="btn btn-outline-success" 
                  onClick={() => cambiarPagina(pagina - 1)} 
                  disabled={pagina === 1}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>

                <div className="d-none d-sm-flex">
                   {renderNumerosPagina()}
                </div>

                <button 
                  className="btn btn-outline-success" 
                  onClick={() => cambiarPagina(pagina + 1)}
                  disabled={libros.length < 12} 
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default BuscadorLibros;