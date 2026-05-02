import React, { useState, useEffect } from "react";
import axios from "axios";
import LibroCard from "../components/LibroCard";
import SidebarGeneros from "../components/SidebarGeneros";
import "../assets/css/buscador.css";

const BuscadorLibros = () => {
  const [libros, setLibros] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [generoActivo, setGeneroActivo] = useState(""); 
  const [orden, setOrden] = useState("relevance"); 
  const [pagina, setPagina] = useState(1); 
  const [tusGeneros, setTusGeneros] = useState([]); 
  const [listaMaestraGeneros, setListaMaestraGeneros] = useState([]);

  useEffect(() => {
    const sesion = localStorage.getItem("usuario");
    const token = localStorage.getItem("token");

    if (sesion && token) {
      const userObj = JSON.parse(sesion);
      
      axios.get(`http://localhost:8080/api/usuarios/${userObj.idUsuario}`, {
        headers: {
          Authorization: `Bearer ${token}` 
        }
      })
      .then(res => {
        if (res.data.generosFavoritos) {
          // Sincronizamos los géneros reales de la base de datos
          setTusGeneros(res.data.generosFavoritos.map(g => g.nombre));
        }
      })
      .catch(err => {
        console.error("Error al sincronizar géneros del usuario:", err);
        if (userObj.generosFavoritos) {
          setTusGeneros(userObj.generosFavoritos.map(g => g.nombre));
        }
      });
    }

    // La lista maestra suele ser pública, así que no suele necesitar token
    axios.get("http://localhost:8080/api/generos")
      .then(res => setListaMaestraGeneros(res.data))
      .catch(err => console.error("Error cargando géneros maestros:", err));
  }, []);

  const obtenerLibros = async (busqueda, generoNombre, ordenSeleccionado, paginaActual) => {
    let query = "";
    
    if (generoNombre) {
      const generoObj = listaMaestraGeneros.find(g => g.nombre === generoNombre);
      const terminoBusqueda = generoObj ? generoObj.nombreIngles : generoNombre;
      query = `subject:${terminoBusqueda}`;
    } else if (busqueda) {
      query = busqueda.trim();
    }

    if (!query) return;

    try {
      // El backend ahora nos devuelve la lista ya filtrada y única por ISBN
      const response = await axios.get(
        `http://localhost:8080/api/libros/buscar?q=${query}&orderBy=${ordenSeleccionado === 'rating' ? 'relevance' : ordenSeleccionado}&pagina=${paginaActual}`
      );
      
      let resultados = response.data;

      // Ordenación local por rating si es necesario
      if (ordenSeleccionado === "rating") {
        resultados = [...resultados].sort((a, b) => (b.valoracion || 0) - (a.valoracion || 0));
      }

      setLibros(resultados);
    } catch (error) {
      console.error("Error al obtener libros:", error);
    }
  };

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
              tusGeneros={tusGeneros} 
              todosLosGeneros={listaMaestraGeneros.map(g => g.nombre)}
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
                libros.map((libro) => (
                  <LibroCard key={libro.isbn} libro={libro} />
                ))
              ) : (
                <p className="libros-grid__mensaje">
                  {textoBusqueda || generoActivo 
                    ? "No se encontraron libros con ISBN disponible." 
                    : "Usa el buscador para encontrar tus libros favoritos."}
                </p>
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
                  disabled={libros.length < 5} 
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