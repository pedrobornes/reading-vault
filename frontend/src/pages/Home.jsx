import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import NoticiaCard from "../components/NoticiaCard";
import CrearNoticiaAdmin from "../components/CrearNoticiaAdmin";
import "../assets/css/home.css";

export default function Home() {
  const navigate = useNavigate();

  // --- ESTADOS COLUMNA IZQUIERDA ---
  const [itemBiblioteca, setItemBiblioteca] = useState(null);
  const [stats, setStats] = useState({ leidos: 0, objetivoReto: 20 });
  const [cargandoIzquierda, setCargandoIzquierda] = useState(true);

  // --- ESTADOS COLUMNA CENTRAL ---
  const [librosNoticias, setLibrosNoticias] = useState([]);
  const [limiteNoticias, setLimiteNoticias] = useState(3); 
  const [cargandoCentro, setCargandoCentro] = useState(true);

  // --- ESTADOS COLUMNA DERECHA ---
  const [libroAmigo, setLibroAmigo] = useState(null);
  const [nombreRecomendador, setNombreRecomendador] = useState("ReadingVault"); 
  const [libroAnio, setLibroAnio] = useState(null);
  const [cargandoDerecha, setCargandoDerecha] = useState(true);

  // --- CONTROL DE SESIÓN ---
  const sesion = localStorage.getItem("usuario");
  const token = localStorage.getItem("token");
  const miSesion = sesion ? JSON.parse(sesion) : null;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Comprobación de privilegios de administrador
  const esAdmin = miSesion?.rol === "ADMIN";

  // Carga las noticias guardadas en el backend
  const cargarNoticiasReales = () => {
    fetch("http://localhost:8080/api/noticias", { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setLibrosNoticias(data); 
        setCargandoCentro(false);
      })
      .catch((err) => {
        console.error("Error al cargar noticias reales:", err);
        setCargandoCentro(false);
      });
  };

  // Carga el libro fijado en base de datos como libro del año
  const cargarLibroDelAnioFijo = () => {
    fetch("http://localhost:8080/api/libros/libro-anio", { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setLibroAnio(data);
        setCargandoDerecha(false);
      })
      .catch((err) => {
        console.error("Error al cargar el libro del año fijo:", err);
        setCargandoDerecha(false);
      });
  };

  useEffect(() => {
    if (!token || !miSesion) {
      navigate("/login");
      return;
    }

    // 1. CARGA COLUMNA IZQUIERDA: Progreso de lectura y Reto Anual seguro
    fetch(`http://localhost:8080/api/bibliotecas/usuario/${miSesion.idUsuario}/completa`, { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((items) => {
        const actualmenteLeyendo = items.find((i) => i.estanteria?.nombre === "Leyendo");
        setItemBiblioteca(currentlyReading => actualmenteLeyendo || null);

        const totalLeidosManual = items.filter((i) => i.estanteria?.nombre?.toUpperCase() === "LEÍDO").length;

        return fetch(`http://localhost:8080/api/retos/usuario/${miSesion.idUsuario}/actual`, { headers })
          .then((resReto) => {
            if (!resReto.ok) throw new Error("Reto no creado en base de datos todavía");
            return resReto.json();
          })
          .then((retoData) => {
            setStats({
              leidos: retoData.completados !== undefined ? retoData.completados : totalLeidosManual,
              objetivoReto: retoData.objetivoLibros || miSesion.objetivoLectura || 20,
            });
            setCargandoIzquierda(false);
          })
          .catch(() => {
            setStats({
              leidos: totalLeidosManual,
              objetivoReto: miSesion.objetivoLectura || 20,
            });
            setCargandoIzquierda(false);
          });
      })
      .catch((err) => {
        console.error("Error crítico en columna izquierda:", err);
        setCargandoIzquierda(false);
      });

    // 2. CARGA COLUMNA CENTRAL: Noticias
    cargarNoticiasReales();

    // 3. MOTOR DE RECOMENDACIONES: Llamada limpia al método específico del backend
    fetch(`http://localhost:8080/api/reviews/recomendacion-amigo/${miSesion.idUsuario}`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error("Sin recomendaciones de amigos");
        return res.json();
      })
      .then((data) => {
        setLibroAmigo({
          isbn: data.libro.isbn,
          titulo: data.libro.titulo,
          autor: data.libro.autor,
          portada: data.libro.fotoPortada || data.libro.portada
        });
        setNombreRecomendador(`tu amigo ${data.nombreAmigo || "un amigo"}`);
      })
      .catch(() => {
        fetch("http://localhost:8080/api/libros/buscar?q=libros&isGenero=false", { headers })
          .then((res) => (res.ok ? res.json() : []))
          .then((todosLosLibros) => {
            const buenosGlobales = todosLosLibros.filter(l => (l.puntuacionMedia || l.valoracion || 0) >= 4);
            const poolSeleccion = buenosGlobales.length > 0 ? buenosGlobales : todosLosLibros;
            const aleatorioGlobal = [...poolSeleccion].sort(() => 0.5 - Math.random())[0];
            
            setLibroAmigo(aleatorioGlobal);
            setNombreRecomendador("ReadingVault");
          });
      });

    // 4. CARGA COLUMNA DERECHA: Libro del año
    cargarLibroDelAnioFijo();

  }, [navigate]);

  // MANEJADOR EXCLUSIVO: Cambiar el libro del año (Solo Administradores)
  const handleCambiarLibroAnioAdmin = async () => {
    const { value: textoBusqueda } = await Swal.fire({
      title: '🏆 Seleccionar Libro del Año',
      text: 'Introduce el título para buscar en el catálogo:',
      input: 'text',
      inputPlaceholder: 'Ej: El Imperio Final...',
      showCancelButton: true,
      confirmButtonColor: '#4B5043',
      cancelButtonText: 'Cancelar'
    });

    if (!textoBusqueda || !textoBusqueda.trim()) return;

    fetch(`http://localhost:8080/api/libros/buscar?q=${textoBusqueda.trim()}&isGenero=false`, { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then(async (librosEncontrados) => {
        if (librosEncontrados.length === 0) {
          Swal.fire('Sin resultados', 'No se encontró ningún libro.', 'info');
          return;
        }

        const opciones = {};
        librosEncontrados.forEach((lib) => {
          opciones[lib.idLibro || lib.isbn] = `${lib.titulo} - ${lib.autor}`;
        });

        const { value: idSeleccionado } = await Swal.fire({
          title: 'Selecciona el ejemplar',
          input: 'select',
          inputOptions: opciones,
          inputPlaceholder: 'Selecciona un libro...',
          showCancelButton: true,
          confirmButtonColor: '#4B5043',
          cancelButtonText: 'Cancelar'
        });

        if (idSeleccionado) {
          const objetoLibro = librosEncontrados.find(l => (l.idLibro || l.isbn) === idSeleccionado);
          
          if (!objetoLibro.idLibro) {
            await fetch("http://localhost:8080/api/libros/sincronizar", {
              method: "POST",
              headers: headers,
              body: JSON.stringify(objetoLibro)
            });
          }

          fetch(`http://localhost:8080/api/libros/buscar-unico?isbn=${objetoLibro.isbn}`, { headers })
            .then(res => res.json())
            .then(libroLocalizado => {
              fetch(`http://localhost:8080/api/libros/${libroLocalizado.idLibro}/marcar-libro-anio`, {
                method: "PUT",
                headers: headers
              }).then((res) => {
                if (res.ok) {
                  Swal.fire('¡Fijado!', 'El libro del año ha sido modificado.', 'success');
                  cargarLibroDelAnioFijo(); 
                }
              });
            });
        }
      })
      .catch((err) => console.error("Error en flujo de asignación destacado:", err));
  };

  // Actualizador manual del contador de páginas leídas
  const handleActualizarProgreso = async () => {
    if (!itemBiblioteca) return;
    const paginasTotales = itemBiblioteca.libro.paginas || 300;

    const { value: nuevaPagina } = await Swal.fire({
      title: 'Actualizar progreso',
      text: `¿Por qué página vas? (Total: ${paginasTotales})`,
      input: 'number',
      inputValue: itemBiblioteca.paginaActual || itemBiblioteca.progresoActual || 0,
      inputPlaceholder: 'Introduce la página actual',
      showCancelButton: true,
      confirmButtonColor: '#4B5043',
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      borderRadius: '15px',
      inputValidator: (value) => {
        if (!value || value < 0 || value > paginasTotales) {
          return `Introduce un número válido entre 0 y ${paginasTotales}`;
        }
      }
    });

    if (nuevaPagina !== undefined) {
      try {
        const response = await fetch(`http://localhost:8080/api/bibliotecas/actualizar-progreso`, {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify({ 
            idLibroEstanteria: itemBiblioteca.id,
            paginaActual: parseInt(nuevaPagina) 
          })
        });

        if (response.ok) {
          Swal.fire({ title: '¡Progreso guardado!', icon: 'success', timer: 1500, showConfirmButton: false });
          
          const resLibros = await fetch(`http://localhost:8080/api/bibliotecas/usuario/${miSesion.idUsuario}/completa`, { headers });
          const items = resLibros.ok ? await resLibros.json() : [];
          const libroActualizado = items.find((i) => i.id === itemBiblioteca.id);
          setItemBiblioteca(libroActualizado || null);

          const totalLeidosManual = items.filter((i) => i.estanteria?.nombre?.toUpperCase() === "LEÍDO").length;

          try {
            const resReto = await fetch(`http://localhost:8080/api/retos/usuario/${miSesion.idUsuario}/actual`, { headers });
            if (resReto.ok) {
              const retoData = await resReto.json();
              setStats({
                leidos: retoData.completados !== undefined ? retoData.completados : totalLeidosManual,
                objectiveReto: retoData.objetivoLibros || miSesion.objetivoLectura || 20
              });
            } else {
              setStats({ leidos: totalLeidosManual, objetivoReto: miSesion.objetivoLectura || 20 });
            }
          } catch (e) {
            setStats({ leidos: totalLeidosManual, objetivoReto: miSesion.objetivoLectura || 20 });
          }
        }
      } catch (error) {
        console.error("Error al actualizar el progreso:", error);
      }
    }
  };

  if (cargandoIzquierda && cargandoCentro && cargandoDerecha) {
    return <div className="text-center py-5 text-muted">Cargando tu espacio literario...</div>;
  }

  const libroLeyendo = itemBiblioteca?.libro;
  const pagActual = itemBiblioteca?.paginaActual || itemBiblioteca?.progresoActual || 0;
  const pagTotales = libroLeyendo?.paginas || 1;
  const porcentajeLibro = Math.round((pagActual / pagTotales) * 100);
  const porcentajeReto = stats.objetivoReto > 0 ? Math.round((stats.leidos / stats.objetivoReto) * 100) : 0;

  return (
    <div className="container-custom py-5">
      <div className="home-grid">
        
        {/* --- COLUMNA IZQUIERDA --- */}
        <aside className="home-grid__sidebar-left">
          <section className="infoUsuario">
            
            {/* NUEVO BLOQUE: Enlace directo a Mis Libros */}
            <div 
              className="mis-libros-card"
              onClick={() => navigate("/mislibros")}
              style={{ cursor: "pointer" }}
            >
              <h3 className="mis-libros-card__titulo">Mi biblioteca</h3>
              <div className="mis-libros-card__cuerpo text-center py-2">
                <div className="mis-libros-card__icono mb-2">
                  <i className="bi bi-bookshelf" style={{ fontSize: "2rem", color: "var(--color-verde-oscuro)" }}></i>
                </div>
                <span className="mis-libros-card__btn-texto">Ver mis estanterías</span>
              </div>
            </div>

            {/* Bloque Leyendo actualmente */}
            <div className="leyendo">
              <h3 className="leyendo__titulo">Leyendo actualmente</h3>
              {libroLeyendo ? (
                <div className="leyendo__libro flex-column align-items-center text-center">
                  
                  <picture 
                    className="libro__picture mb-3" 
                    onClick={() => navigate(`/libro/${libroLeyendo.isbn}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <img src={libroLeyendo.portada || libroLeyendo.fotoPortada || "https://via.placeholder.com/150x200?text=Sin+Portada"} alt={libroLeyendo.titulo} className="libro__portada" />
                  </picture>

                  <div className="libro__info w-100">
                    <div 
                      onClick={() => navigate(`/libro/${libroLeyendo.isbn}`)} 
                      style={{ cursor: "pointer" }}
                      className="mb-3"
                    >
                      <h4 className="libro__titulo mb-1">{libroLeyendo.titulo}</h4>
                      <h4 className="libro__escritor m-0">{libroLeyendo.autor || "Autor Desconocido"}</h4>
                    </div>

                    <div 
                      className="libro__progreso mt-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActualizarProgreso();
                      }}
                      style={{ cursor: "pointer" }}
                      title="Haga clic para actualizar su página actual"
                    >
                      <span className="progreso__actual d-block mb-1">Página {pagActual} / {pagTotales}</span>
                      <div className="progress-container">
                        <div className="progress-bar-fill" style={{ width: `${Math.min(porcentajeLibro, 100)}%` }}></div>
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                <div className="text-center text-muted small py-3">No estás leyendo ningún libro.</div>
              )}
            </div>

            {/* Bloque Reto del año */}
            <div 
              className="reto" 
              onClick={() => navigate("/reto")}
              style={{ cursor: "pointer" }}
            >
              <h3 className="reto__titulo">Reto del año</h3>
              <p className="reto__progreso-texto">{stats.leidos} de {stats.objetivoReto} libros leídos</p>
              <div className="progress-container-reto">
                <div className="progress-bar-fill-reto" style={{ width: `${Math.min(porcentajeReto, 100)}%` }}></div>
                <span className="reto__porcentaje">{porcentajeReto}%</span>
              </div>
            </div>
          </section>
        </aside>

        {/* --- COLUMNA CENTRAL --- */}
        <main className="home-grid__main">
          <section className="noticias">
            <div className="noticias__bienvenida">
              <h3 className="bienvenida__titulo">Bienvenido a ReadingVault</h3>
              <p className="bienvenida__texto">Encuentra tus libros favoritos, únete a una comunidad y gestiona tu biblioteca personal</p>
            </div>
            
            {esAdmin && <CrearNoticiaAdmin onNoticiaCreada={cargarNoticiasReales} />}

            <h1 className="noticias__titulo">NOTICIAS</h1>
            <div className="noticias__feed">
              {librosNoticias.length > 0 ? (
                librosNoticias.slice(0, limiteNoticias).map((noticia, index) => (
                  <NoticiaCard 
                    key={noticia.idNoticia || index} 
                    noticia={noticia} 
                    esAdmin={esAdmin} 
                    onNoticiaModificada={cargarNoticiasReales} 
                  />
                ))
              ) : (
                <div className="text-center text-muted small py-3 bg-white rounded-3">No hay noticias disponibles.</div>
              )}
            </div>

            {librosNoticias.length > limiteNoticias && (
              <div className="noticias__footer text-center mt-4">
                <button 
                  className="noticias__btn-ver-mas" 
                  onClick={() => setLimiteNoticias((prev) => prev + 3)}
                >
                  Ver más
                </button>
              </div>
            )}
          </section>
        </main>

        {/* --- COLUMNA DERECHA --- */}
        <aside className="home-grid__sidebar-right">
          <section className="recomendaciones">
            {libroAmigo && (
              <div 
                className="recomendacion text-center" 
                onClick={() => navigate(`/libro/${libroAmigo.isbn}`)}
                style={{ cursor: "pointer" }} 
              >
                <h3 className="recomendacion__titulo">¡Te recomendamos!</h3>
                
                <div className="d-flex flex-column align-items-center">
                  <picture className="recomendacion__picture mb-3">
                    <img 
                      src={libroAmigo.portada || libroAmigo.fotoPortada || "https://via.placeholder.com/150x200?text=Sin+Portada"} 
                      alt={libroAmigo.titulo} 
                      className="recomendacion__portada" 
                    />
                  </picture>
                  
                  <div className="recomendacion__textos w-100 mb-3">
                    <h4 className="recomendacion__libro mb-1">{libroAmigo.titulo}</h4>
                    <h4 className="recomendacion__autor">{libroAmigo.autor || "Autor Desconocido"}</h4>
                  </div>
                </div>
                
                <p className="recomendacion__amigo m-0">Selección de {nombreRecomendador}</p>
              </div>
            )}

            {libroAnio && (
              <div 
                className="libroAño text-center"
                onClick={() => navigate(`/libro/${libroAnio.isbn}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="libro-anio-titulo-admin" onClick={(e) => e.stopPropagation()}>
                  <h3 className="recomendacion__titulo m-0" style={{ background: 'none', padding: 0, margin: 0 }}>¡Libro del año!</h3>
                  {esAdmin && (
                    <button 
                      onClick={handleCambiarLibroAnioAdmin}
                      className="btn btn-sm btn-light text-warning border-0 shadow-sm d-flex align-items-center justify-content-center"
                      title="Cambiar Libro del Año"
                      style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "rgba(255, 193, 7, 0.1)" }}
                    >
                      <i className="bi bi-trophy-fill" style={{ color: "#ffc107" }}></i>
                    </button>
                  )}
                </div>

                <div className="d-flex flex-column align-items-center mt-3">
                  <picture className="recomendacion__picture mb-3">
                    <img 
                      src={libroAnio.portada || libroAnio.fotoPortada || "https://via.placeholder.com/150x200?text=Sin+Portada"} 
                      alt={libroAnio.titulo} 
                      className="recomendacion__portada" 
                    />
                  </picture>
                  <div className="recomendacion__textos w-100">
                    <h4 className="recomendacion__libro mb-1">{libroAnio.titulo}</h4>
                    <h4 className="recomendacion__autor m-0">{libroAnio.autor || "Autor Desconocido"}</h4>
                  </div>
                </div>
              </div>
            )}
          </section>
        </aside>

      </div>
    </div>
  );
}