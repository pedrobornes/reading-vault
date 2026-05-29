import React, { useState, useEffect } from "react";
import SideBarBiblioteca from "../components/SideBarBiblioteca";
import EstanteriaSeccion from "../sections/EstanteriaSeccion";
import LibroCard from "../components/LibroCard";
import { API_BASE_URL } from '../apiConfig';
import "../assets/css/misLibros.css";

const MisLibros = () => {
  const [biblioteca, setBiblioteca] = useState([]);
  const [vista, setVista] = useState("todas");

  const [cargando, setCargando] = useState(true);

  // Estados para la paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const librosPorPagina = 9;

  useEffect(() => {
    cargarDatos();
    window.scrollTo({
    top: 0,
    behavior: "smooth" // Esto hace que suba "deslizando" y no de golpe
  });
    
    
    
  }, [vista, paginaActual]);

  const cargarDatos = async () => {
    
    setCargando(true); 
    const sesion = JSON.parse(localStorage.getItem("usuario"));
    const token = localStorage.getItem("token");
    
    if (sesion && token) {
      try {
        //await new Promise(resolve => setTimeout(resolve, 3000));
        
        const response = await fetch(
          `${API_BASE_URL}/api/bibliotecas/usuario/${sesion.idUsuario}/completa`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await response.json();
        setBiblioteca(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setCargando(false);
      }
    } else {
      setCargando(false);
    }
  };

  const filtrar = (nombre) =>
    biblioteca.filter((item) => item.estanteria?.nombre === nombre);

  // Lógica de Paginación
  const librosFiltrados = filtrar(vista);
  const totalPaginas = Math.ceil(librosFiltrados.length / librosPorPagina);
  const ultimoIndice = paginaActual * librosPorPagina;
  const primerIndice = ultimoIndice - librosPorPagina;
  const librosPaginados = librosFiltrados.slice(primerIndice, ultimoIndice);

  if (cargando) {
    return (
      <div className="loader-container d-flex flex-column justify-content-center align-items-center text-center w-100" style={{ minHeight: "80vh" }}>
        <div className="book">
          <div className="inner">
            <div className="left"></div>
            <div className="middle"></div>
            <div className="right"></div>
          </div>
          <ul>
            {[...Array(18)].map((_, i) => (
              <li key={i}></li>
            ))}
          </ul>
        </div>
        <h4 className="loader-texto mt-5 text-muted fw-bold">Desempolvando tus estanterías...</h4>
      </div>
    );
  }

  return (
    <div className="biblioteca-layout container-custom">
      <SideBarBiblioteca vistaActual={vista} setVistaActual={setVista} />

      <main className="biblioteca-content">
        {vista === "todas" ? (
          <>
            <EstanteriaSeccion
              titulo="Leyendo"
              libros={filtrar("Leyendo")}
              alVerMas={() => setVista("Leyendo")}
            />
            <EstanteriaSeccion
              titulo="Pendientes"
              libros={filtrar("Pendiente")}
              alVerMas={() => setVista("Pendiente")}
            />
            <EstanteriaSeccion
              titulo="Leídos"
              libros={filtrar("Leído")}
              alVerMas={() => setVista("Leído")}
            />
          </>
        ) : (
          <div className="vista-listado-completo">
            <h2 className="titulo-seccion-biblioteca mb-4">
              Estantería: {vista}
            </h2>

            <div className="libros-grid-total">
              {librosPaginados.map((item) => {
                const libroAjustado = {
                  ...item.libro,
                  portada:
                    item.libro.portada ||
                    item.libro.fotoPortada ||
                    item.libro.imagen,
                };
                return <LibroCard key={item.id} libro={libroAjustado} />;
              })}
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="paginacion-wrapper">
                <button
                  disabled={paginaActual === 1}
                  onClick={() => setPaginaActual(paginaActual - 1)}
                  className="btn-flecha"
                >
                  <i className="bi bi-chevron-left"></i>
                </button>

                {[...Array(totalPaginas)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPaginaActual(i + 1)}
                    className={`btn-numero ${paginaActual === i + 1 ? "active" : ""}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  disabled={paginaActual === totalPaginas}
                  onClick={() => setPaginaActual(paginaActual + 1)}
                  className="btn-flecha"
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            )}

            {/* Botón Volver Abajo */}
            <div className="footer-listado">
              <button
                className="btn-volver-vault-footer"
                onClick={() => setVista("todas")}
              >
                <i className="bi bi-arrow-left"></i> Volver a mi Vault
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MisLibros;
