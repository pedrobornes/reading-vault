import React, { useState, useEffect } from "react";
import axios from "axios";
import LibroCard from "../components/LibroCard";
import SidebarGeneros from "../components/SidebarGeneros";
import "../assets/css/buscador.css";

const BuscadorLibros = () => {
  // Estados de la vista
  const [libros, setLibros] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [generoActivo, setGeneroActivo] = useState("");
  const [orden, setOrden] = useState("relevance");
  const [pagina, setPagina] = useState(1);

  // Estados de datos
  const [tusGeneros, setTusGeneros] = useState([]);
  const [listaMaestraGeneros, setListaMaestraGeneros] = useState([]);

  // --- NUEVO ESTADO PARA CONTROLAR LA CARGA (SPINNER) ---
  const [cargando, setCargando] = useState(false);

  // Carga inicial de géneros
  useEffect(() => {
    const sesion = localStorage.getItem("usuario");
    const token = localStorage.getItem("token");

    if (sesion && token) {
      const userObj = JSON.parse(sesion);

      axios
        .get(`http://localhost:8080/api/usuarios/${userObj.idUsuario}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data.generosFavoritos) {
            setTusGeneros(res.data.generosFavoritos.map((g) => g.nombre));
          }
        })
        .catch((err) => {
          console.error("Error al sincronizar géneros:", err);
          if (userObj.generosFavoritos) {
            setTusGeneros(userObj.generosFavoritos.map((g) => g.nombre));
          }
        });
    }

    axios
      .get("http://localhost:8080/api/generos")
      .then((res) => setListaMaestraGeneros(res.data))
      .catch((err) => console.error("Error cargando géneros:", err));
  }, []);

  // Función principal de búsqueda MODIFICADA con 'cargando'
  const obtenerLibros = async (
    busqueda,
    generoNombre,
    ordenSeleccionado,
    paginaActual,
  ) => {
    let query = "";

    if (generoNombre) {
      query = generoNombre;
    } else if (busqueda) {
      query = busqueda.trim();
    }

    if (!query) {
      setLibros([]);
      return;
    }

    // --- ACTIVAMOS EL SPINNER ANTES DE LA PETICIÓN ---
    setCargando(true);

    try {
      const response = await axios.get(
        `http://localhost:8080/api/libros/buscar`,
        {
          params: {
            q: query,
            pagina: paginaActual,
            isGenero: !!generoNombre,
            orderBy: ordenSeleccionado,
          },
        },
      );

      setLibros(response.data);
    } catch (error) {
      console.error("Error al obtener libros:", error);
      setLibros([]);
    } finally {
      
      setCargando(false);
    }
  };

  // Disparador de búsqueda por texto
  const ejecutarBusqueda = (e) => {
    e.preventDefault();
    if (!textoBusqueda.trim()) return;

    setGeneroActivo("");
    setPagina(1);
    obtenerLibros(textoBusqueda, "", orden, 1);
  };

  // Disparador de búsqueda por botón de género
  const buscarPorGenero = (generoEspanol) => {
    setTextoBusqueda("");
    setGeneroActivo(generoEspanol);
    setPagina(1);
    obtenerLibros("", generoEspanol, orden, 1);
  };

  // Selector de ordenación
  const cambiarOrden = (e) => {
    const nuevoOrden = e.target.value;
    setOrden(nuevoOrden);
    setPagina(1);
    obtenerLibros(textoBusqueda, generoActivo, nuevoOrden, 1);
  };

  // Paginación
  const cambiarPagina = (nuevaPagina) => {
    setPagina(nuevaPagina);
    obtenerLibros(textoBusqueda, generoActivo, orden, nuevaPagina);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Renderizado de botones de paginación
  const renderNumerosPagina = () => {
    // Si tenemos menos de 12 libros, es que estamos en la última página.
    // Solo mostramos hasta la página actual.
    const esUltimaPagina = libros.length < 12;
    
    // Si estamos en la página 1 y hay menos de 12 libros, solo mostramos la página 1.
    if (pagina === 1 && esUltimaPagina) {
        return <button className="btn btn-success mx-1">1</button>;
    }

    const paginas = [];
    // Calculamos el límite: si es la última página, el límite es la página actual
    const limite = esUltimaPagina ? pagina : pagina + 2; 

    // Empezamos desde 1 o desde (pagina - 1) para que siempre se vea la actual
    let inicio = Math.max(1, pagina - 1);

    for (let i = inicio; i <= limite; i++) {
      paginas.push(
        <button
          key={i}
          className={`btn ${pagina === i ? "btn-success" : "btn-outline-success"} mx-1`}
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
              todosLosGeneros={listaMaestraGeneros.map((g) => g.nombre)}
              onGeneroClick={buscarPorGenero}
              generoActivo={generoActivo}
            />
          </aside>

          <main className="col-md-9">
            <div className="header-buscador">
              <h2 className="header-buscador__titulo">
                Encuentra tu próxima lectura
              </h2>
              <p className="header-buscador__subtitulo">
                Busca por título, autor o explora nuestros géneros
              </p>
            </div>

            <div className="search-bar">
              <form className="search-bar__form" onSubmit={ejecutarBusqueda}>
                <div className="search-bar__icon">
                  <i className="bi bi-search"></i>
                </div>
                <input
                  type="text"
                  className="search-bar__input"
                  placeholder="Busca por título, autor o género..."
                  value={textoBusqueda}
                  onChange={(e) => setTextoBusqueda(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="search-bar__button">
                  Buscar
                </button>
              </form>
            </div>

            <div className="sort-section d-flex align-items-center mb-4">
              <span className="me-2 ordenacion">Ordenar por:</span>
              <select
                className="sort-section__select"
                value={orden}
                onChange={cambiarOrden}
              >
                <option value="relevance">Relevancia</option>
                <option value="rating">Mejor valorados</option>
              </select>
            </div>

            {/* --- LÓGICA DE RENDERIZADO CONDICIONAL --- */}

            {cargando ? (
              <div className="loader-container text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "400px" }}>
                <div className="book">
                  <div className="inner">
                    <div className="left"></div>
                    <div className="middle"></div>
                    <div className="right"></div>
                  </div>
                  <ul>{[...Array(18)].map((_, i) => <li key={i}></li>)}</ul>
                </div>
                <h4 className="loader-texto mt-5">Cargando biblioteca...</h4>
              </div>
            ) : (
              <>
                <div className="libros-grid">
                  {/* PROTECCIÓN: Usamos Array.isArray para evitar que explote si no es un array */}
                  {Array.isArray(libros) && libros.length > 0 ? (
                    libros.map((libro, index) => (
                      <LibroCard
                        key={libro.idLibro || libro.isbn || index}
                        libro={libro}
                      />
                    ))
                  ) : (
                    <p className="libros-grid__mensaje">
                      {textoBusqueda || generoActivo
                        ? "No se encontraron libros."
                        : "Usa el buscador para encontrar tus libros favoritos."}
                    </p>
                  )}
                </div>

                {/* Solo mostramos paginación si tenemos libros y el array es válido */}
                {Array.isArray(libros) && libros.length > 0 && (
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
                      // Si el servidor devuelve menos de 12, es que ya no hay más páginas
                      disabled={libros.length < 12} 
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default BuscadorLibros;
