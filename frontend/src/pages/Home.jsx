import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const [nombreRecomendador, setNombreRecomendador] = useState("ReadingVault"); // Estado dinámico para el texto
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

    // 1. Cargar columna Izquierda (Progreso del usuario y Reto Anual seguro)
    fetch(`http://localhost:8080/api/bibliotecas/usuario/${miSesion.idUsuario}/completa`, { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((items) => {
        const actualmenteLeyendo = items.find((i) => i.estanteria?.nombre === "Leyendo");
        setItemBiblioteca(currentlyReading => actualmenteLeyendo || null);

        const totalLeidosManual = items.filter((i) => i.estanteria?.nombre?.toUpperCase() === "LEÍDO").length;

        return fetch(`http://localhost:8080/api/retos/usuario/${miSesion.idUsuario}`, { headers })
          .then((resReto) => {
            if (!resReto.ok) throw new Error("Reto no creado en base de datos todavía");
            return resReto.json();
          })
          .then((retoData) => {
            setStats({
              leidos: retoData.completados !== undefined ? retoData.completados : totalLeidosManual,
              objetivoReto: retoData.objetivoLibros || miSesion.objetivoLectura || miSesion.objetivoReto || 20,
            });
            setCargandoIzquierda(false);
          })
          .catch(() => {
            setStats({
              leidos: totalLeidosManual,
              objetivoReto: miSesion.objetivoLectura || miSesion.objetivoReto || 20,
            });
            setCargandoIzquierda(false);
          });
      })
      .catch((err) => {
        console.error("Error crítico en columna izquierda:", err);
        setCargandoIzquierda(false);
      });

    // 2. Cargar columna Central
    cargarNoticiasReales();

    // 3. LÓGICA MEJORADA: Sistema de recomendaciones Inteligente (Amigos -> Global)
    fetch("http://localhost:8080/api/libros/buscar?q=libros&isGenero=false", { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (data.length > 0) {
          // Intentamos buscar libros que contengan valoraciones o reseñas de amigos
          // Nota: Ajusta 'valoracionesAmigos' o 'resenas' según la estructura exacta de tu objeto Libro
          const conResenasAmigos = data.filter(libro => 
            libro.valoracionesAmigos?.length > 0 || libro.comentariosAmigos?.length > 0
          );

          if (conResenasAmigos.length > 0) {
            // Plan A: Elegimos un libro puntuado por un amigo al azar
            const randomLibroAmigo = conResenasAmigos[Math.floor(Math.random() * conResenasAmigos.length)];
            setLibroAmigo(randomLibroAmigo);
            
            // Sacamos el nombre del amigo (si está disponible, si no ponemos genérico)
            const nombreAmigo = randomLibroAmigo.valoracionesAmigos?.[0]?.nombreUsuario || "un amigo";
            setNombreRecomendador(`tu amigo ${nombreAmigo}`);
          } else {
            // Plan B: No hay amigos o no tienen reseñas. Filtramos los mejores libros globales de la plataforma
            // Ordenamos por puntuación media de mayor a menor y barajamos los mejores
            const buenosGlobales = data.filter(libro => (libro.puntuacionMedia || libro.puntuacion || 0) >= 4);
            const poolSeleccion = buenosGlobales.length > 0 ? buenosGlobales : data;
            
            const aleatorioGlobal = [...poolSeleccion].sort(() => 0.5 - Math.random())[0];
            setLibroAmigo(aleatorioGlobal);
            setNombreRecomendador("ReadingVault");
          }
        }
      })
      .catch((err) => console.error("Error al procesar el motor de recomendaciones:", err));

    // 4. Cargar columna Derecha: Recuperar el libro del año estático
    cargarLibroDelAnioFijo();

  }, [navigate]);

  // MANEJADOR EXCLUSIVO: Buscador interno para actualizar el libro del año
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
            const resReto = await fetch(`http://localhost:8080/api/retos/usuario/${miSesion.idUsuario}`, { headers });
            if (resReto.ok) {
              const retoData = await resReto.json();
              setStats({
                leidos: retoData.completados !== undefined ? retoData.completados : totalLeidosManual,
                offsetObjetivo: retoData.objetivoLibros || miSesion.objetivoLectura || miSesion.objetivoReto || 20
              });
            } else {
              setStats({ leidos: totalLeidosManual, objetivoReto: miSesion.objetivoLectura || miSesion.objetivoReto || 20 });
            }
          } catch (e) {
            setStats({ leidos: totalLeidosManual, objetivoReto: miSesion.objetivoLectura || miSesion.objetivoReto || 20 });
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
            <div className="leyendo">
              <h3 className="leyendo__titulo">Leyendo actualmente</h3>
              {libroLeyendo ? (
                <div className="leyendo__libro" onClick={handleActualizarProgreso}>
                  <picture className="libro__picture">
                    <img src={libroLeyendo.portada || libroLeyendo.fotoPortada || "https://via.placeholder.com/150x200?text=Sin+Portada"} alt={libroLeyendo.titulo} className="libro__portada" />
                  </picture>
                  <div className="libro__info">
                    <h4 className="libro__titulo">{libroLeyendo.titulo}</h4>
                    <h4 className="libro__escritor">{libroLeyendo.autor || "Autor Desconocido"}</h4>
                    <div className="libro__progreso">
                      <span className="progreso__actual">Página {pagActual} / {pagTotales}</span>
                      <div className="progress-container mt-2">
                        <div className="progress-bar-fill" style={{ width: `${Math.min(porcentajeLibro, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted small py-3">No estás leyendo ningún libro.</div>
              )}
            </div>

            <div className="reto">
              <h3 className="reto__titulo">Reto del año</h3>
              <p className="reto__progreso-texto">{stats.leidos} de {stats.objetivoReto} libros leídos</p>
              <div className="progress-container-reto">
                <div className="progress-bar-fill" style={{ width: `${Math.min(porcentajeReto, 100)}%` }}></div>
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
              <div className="recomendacion">
                <h3 className="recomendacion__titulo">¡Te recomendamos!</h3>
                <div className="recomendacion__bloque-info">
                  <picture className="recomendacion__picture">
                    <img src={libroAmigo.portada || libroAmigo.fotoPortada || "https://via.placeholder.com/150x200?text=Sin+Portada"} alt={libroAmigo.titulo} className="recomendacion__portada" />
                  </picture>
                  <div className="recomendacion__textos">
                    <h4 className="recomendacion__libro">{libroAmigo.titulo}</h4>
                    <h4 className="recomendacion__autor">{libroAmigo.autor || "Autor Desconocido"}</h4>
                  </div>
                </div>
                {/* Imprime de forma limpia la procedencia de la valoración sin harcodear */}
                <p className="recomendacion__amigo">Selección de {nombreRecomendador}</p>
                <div className="recomendacion__boton">
                  <Link to={`/libro/${libroAmigo.isbn}`} className="recomendacion__enlace">Recomendaciones de tus amigos</Link>
                </div>
              </div>
            )}

            {libroAnio && (
              <div className="libroAño">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h3 className="recomendacion__titulo m-0">¡Libro del año!</h3>
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

                <div className="recomendacion__bloque-info">
                  <picture className="recomendacion__picture">
                    <img src={libroAnio.portada || libroAnio.fotoPortada || "https://via.placeholder.com/150x200?text=Sin+Portada"} alt={libroAnio.titulo} className="recomendacion__portada" />
                  </picture>
                  <div className="recomendacion__textos">
                    <h4 className="recomendacion__libro">{libroAnio.titulo}</h4>
                    <h4 className="recomendacion__autor">{libroAnio.autor || "Autor Desconocido"}</h4>
                  </div>
                </div>
                <div className="recomendacion__boton">
                  <Link to={`/libro/${libroAnio.isbn}`} className="recomendacion__enlace">Ver más recomendaciones</Link>
                </div>
              </div>
            )}
          </section>
        </aside>

      </div>
    </div>
  );
}