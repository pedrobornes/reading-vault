import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import NoticiaCard from "../components/NoticiaCard";
import CrearNoticiaAdmin from "../components/CrearNoticiaAdmin";
import { API_BASE_URL } from '../apiConfig';
import "../assets/css/home.css";

export default function Home() {
  const navigate = useNavigate();
  const [busquedaLibro, setBusquedaLibro] = useState('');
  const [resultadosLibros, setResultadosLibros] = useState([]);
  const [isBuscando, setIsBuscando] = useState(false);
  // --- ESTADOS COLUMNA IZQUIERDA ---
  //const [itemBiblioteca, setItemBiblioteca] = useState(null);
  const [stats, setStats] = useState({ leidos: 0, objetivoReto: 0 });
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

  // --- ESTADOS PARA EL SLIDER Y MODAL ---
  const [librosLeyendo, setLibrosLeyendo] = useState([]);
  const [indiceLibro, setIndiceLibro] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paso, setPaso] = useState(1);
  const [nuevaPagina, setNuevaPagina] = useState(0);
  const [puntuacion, setPuntuacion] = useState(0);
  const [isEditando, setIsEditando] = useState(false);

  // --- CONTROL DE SESIÓN ---
  const sesion = localStorage.getItem("usuario");
  const token = localStorage.getItem("token");
  const miSesion = sesion ? JSON.parse(sesion) : null;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Toast
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const toastTimeoutRef = useRef(null);
  const mostrarNotificacion = (texto, tipo) => {
    // Si ya había una notificación a punto de borrarse, cancelamos su temporizador
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    
    // Mostramos el mensaje nuevo
    setMensaje({ texto, tipo });
    
    // 3 segundos
    toastTimeoutRef.current = setTimeout(() => {
      setMensaje({ texto: "", tipo: "" });
    }, 3000);
  };
  
  const handleBuscarLibroDinamico = (e) => {
    setBusquedaLibro(e.target.value);
  };

  useEffect(() => {
    const buscar = async () => {
      if (busquedaLibro.trim().length < 3) {
        setResultadosLibros([]);
        return;
      }

      setIsBuscando(true);

      try {
        const res = await fetch(
          `${API_BASE_URL}/api/libros/buscar?q=${encodeURIComponent(busquedaLibro.trim())}`,
          { headers }
        );
        const data = await res.json();
        setResultadosLibros(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsBuscando(false);
      }
    };

    const timeout = setTimeout(() => {
      buscar();
    }, 400);

    return () => clearTimeout(timeout);
  }, [busquedaLibro, token]);

  // Comprobación de privilegios de administrador
  const esAdmin = miSesion?.rol === "ADMIN";

  // Carga las noticias guardadas en el backend
  const cargarNoticiasReales = () => {
    fetch(`${API_BASE_URL}0/api/noticias`, { headers })
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
    fetch(`${API_BASE_URL}/api/libros/libro-anio`, { headers })
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

    // CARGA COLUMNA IZQUIERDA: Progreso de lectura y Reto Anual seguro
    fetch(
      `${API_BASE_URL}/api/bibliotecas/usuario/${miSesion.idUsuario}/completa`,
      { headers },
    )
      .then((res) => (res.ok ? res.json() : []))
      .then((items) => {
        const actualmenteLeyendo = items.filter(
          (i) => i.estanteria?.nombre === "Leyendo",
        );
        setLibrosLeyendo(actualmenteLeyendo);
        setIndiceLibro(0);

        const totalLeidosManual = items.filter(
          (i) => i.estanteria?.nombre?.toUpperCase() === "LEÍDO",
        ).length;

        return fetch(
          `${API_BASE_URL}/api/retos/usuario/${miSesion.idUsuario}/actual`,
          { headers },
        )
          .then((resReto) => {
            if (!resReto.ok)
              throw new Error("Reto no creado en base de datos todavía");
            return resReto.json();
          })
          .then((retoData) => {
            setStats({
              leidos:
                retoData.completados !== undefined
                  ? retoData.completados
                  : totalLeidosManual,
              objetivoReto: retoData.objetivoLibros || 0,
            });
            setCargandoIzquierda(false);
          })
          .catch(() => {
            setStats({
              leidos: totalLeidosManual,
              objetivoReto: 0,
            });
            setCargandoIzquierda(false);
          });
      })
      .catch((err) => {
        console.error("Error crítico en columna izquierda:", err);
        setCargandoIzquierda(false);
      });

    // CARGA COLUMNA CENTRAL: Noticias
    cargarNoticiasReales();

    // MOTOR DE RECOMENDACIONES
    fetch(`${API_BASE_URL}/api/reviews/recomendacion-amigo/${miSesion.idUsuario}`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error("Sin recomendaciones de amigos");
        return res.json();
      })
      .then((data) => {
        setLibroAmigo({
          isbn: data.libro.isbn,
          titulo: data.libro.titulo,
          autor: data.libro.autor,
          portada: data.libro.fotoPortada || data.libro.portada,
        });
        setNombreRecomendador(`tu amigo ${data.nombreAmigo || "un amigo"}`);
      })
      .catch(() => {
        fetch(`${API_BASE_URL}/api/libros/recomendacion-aleatoria`, { headers })
          .then((res) => {
            if (!res.ok) throw new Error("No hay libros destacados en el servidor");
            return res.json();
          })
          .then((libroOptimo) => {
            setLibroAmigo({
              isbn: libroOptimo.isbn,
              titulo: libroOptimo.titulo,
              autor: libroOptimo.autor,
              portada: libroOptimo.fotoPortada || libroOptimo.portada,
            });
            setNombreRecomendador("ReadingVault");
          })
          .catch((err) => {
            console.error("Error cargando la recomendación del sistema:", err);
            setLibroAmigo(null);
          });
      })
      .finally(() => {
        setCargandoDerecha(false);
      });

    // CARGA COLUMNA DERECHA: Libro del año
    cargarLibroDelAnioFijo();
  }, [navigate]);

  // Cambiar el libro del año (Solo Administradores)
  const asignarLibroAnio = async (objetoLibro) => {
    try {
      // SINCRONIZAR SI NO EXISTE EN LOCAL
      if (!objetoLibro.idLibro) {
        await fetch(`${API_BASE_URL}/api/libros/sincronizar`, {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(objetoLibro),
        });
      }

      // RECUPERAR LIBRO LOCAL
      const params = new URLSearchParams();
      if (objetoLibro.isbn) params.append("isbn", objetoLibro.isbn);
      if (objetoLibro.titulo) params.append("titulo", objetoLibro.titulo);
      if (objetoLibro.autor) params.append("autor", objetoLibro.autor);

      const resLocal = await fetch(
        `${API_BASE_URL}/api/libros/buscar-unico?${params.toString()}`,
        { headers }
      );
      const libroLocalizado = await resLocal.json();

      // MARCAR LIBRO DEL AÑO
      const resMarcar = await fetch(
        `${API_BASE_URL}/api/libros/${libroLocalizado.idLibro}/marcar-libro-anio`,
        {
          method: "PUT",
          headers,
        }
      );

      if (resMarcar.ok) {
        mostrarNotificacion("Libro del año actualizado con éxito", "success");
        setLibroAnio(libroLocalizado);
        setBusquedaLibro('');
        setResultadosLibros([]);
        setIsEditando(false);
      } else {
        mostrarNotificacion("Error al actualizar el libro", "error");
      }
    } catch (err) {
      console.error(err);
      mostrarNotificacion("Error de conexión", "error");
    }
  };

  // Actualizador manual del contador de páginas leídas
  const handleActualizarProgreso = async () => {
    if (!itemBiblioteca) return;
    const paginasTotales = itemBiblioteca.libro.paginas || 300;

    const { value: nuevaPagina } = await Swal.fire({
      title: "Actualizar progreso",
      text: `¿Por qué página vas? (Total: ${paginasTotales})`,
      input: "number",
      inputValue:
        itemBiblioteca.paginaActual || itemBiblioteca.progresoActual || 0,
      inputPlaceholder: "Introduce la página actual",
      showCancelButton: true,
      confirmButtonColor: "#4B5043",
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      borderRadius: "15px",
      inputValidator: (value) => {
        if (!value || value < 0 || value > paginasTotales) {
          return `Introduce un número válido entre 0 y ${paginasTotales}`;
        }
      },
    });

    if (nuevaPagina !== undefined) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/bibliotecas/actualizar-progreso`,
          {
            method: "PUT",
            headers: headers,
            body: JSON.stringify({
              idLibroEstanteria: itemBiblioteca.id,
              paginaActual: parseInt(nuevaPagina),
            }),
          },
        );

        if (response.ok) {
          Swal.fire({
            title: "¡Progreso guardado!",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });

          const resLibros = await fetch(
            `${API_BASE_URL}/api/bibliotecas/usuario/${miSesion.idUsuario}/completa`,
            { headers },
          );
          const items = resLibros.ok ? await resLibros.json() : [];
          const libroActualizado = items.find(
            (i) => i.id === itemBiblioteca.id,
          );
          setItemBiblioteca(libroActualizado || null);

          const totalLeidosManual = items.filter(
            (i) => i.estanteria?.nombre?.toUpperCase() === "LEÍDO",
          ).length;

          try {
            const resReto = await fetch(
              `${API_BASE_URL}/api/retos/usuario/${miSesion.idUsuario}/actual`,
              { headers },
            );
            if (resReto.ok) {
              const retoData = await resReto.json();
              setStats({
                leidos:
                  retoData.completados !== undefined
                    ? retoData.completados
                    : totalLeidosManual,
                objetivoReto:
                  retoData.objetivoLibros || miSesion.objetivoLectura || 20,
              });
            } else {
              setStats({
                leidos: totalLeidosManual,
                objetivoReto: miSesion.objetivoLectura || 20,
              });
            }
          } catch (e) {
            setStats({
              leidos: totalLeidosManual,
              objetivoReto: miSesion.objetivoLectura || 20,
            });
          }
        }
      } catch (error) {
        console.error("Error al actualizar el progreso:", error);
      }
    }
  };

  // Esperamos a que TODAS las columnas terminen de cargar usando || (OR)
  if (cargandoIzquierda || cargandoCentro || cargandoDerecha) {
    return (
      <div
        className="loader-container d-flex flex-column justify-content-center align-items-center text-center w-100"
        style={{ minHeight: "80vh" }}
      >
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
        <h4 className="loader-texto mt-5 text-muted fw-bold">
          Preparando tu espacio literario...
        </h4>
      </div>
    );
  }

  // --- VARIABLES DEL SLIDER ---
  const itemBiblioteca = librosLeyendo[indiceLibro];
  const libroLeyendo = itemBiblioteca?.libro;
  const pagActual =
    itemBiblioteca?.paginaActual || itemBiblioteca?.progresoActual || 0;
  const pagTotales = libroLeyendo?.paginas || 1;
  const porcentajeLibro = Math.round((pagActual / pagTotales) * 100);
  const porcentajeReto =
    stats.objetivoReto > 0
      ? Math.round((stats.leidos / stats.objetivoReto) * 100)
      : 0;

  // --- FUNCIONES DEL SLIDER ---
  const anteriorLibro = () => {
    setIndiceLibro((prev) =>
      prev === 0 ? librosLeyendo.length - 1 : prev - 1,
    );
  };

  const siguienteLibro = () => {
    setIndiceLibro((prev) =>
      prev === librosLeyendo.length - 1 ? 0 : prev + 1,
    );
  };

  // --- FUNCIONES DEL MODAL DE PROGRESO ---
  const abrirModalProgreso = () => {
    setNuevaPagina(pagActual);
    setPaso(1);
    setIsModalOpen(true);
  };

  const guardarProgresoParcial = () => {
    if (nuevaPagina >= pagTotales) {
      setNuevaPagina(pagTotales);
      setPaso(2);
      return;
    }

    fetch(`${API_BASE_URL}/api/bibliotecas/actualizar-progreso`, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        idLibroEstanteria: itemBiblioteca.id,
        paginaActual: nuevaPagina,
      }),
    }).then((res) => {
      if (res.ok) {
        const nuevosLibros = [...librosLeyendo];
        nuevosLibros[indiceLibro].progresoActual = nuevaPagina;
        nuevosLibros[indiceLibro].paginaActual = nuevaPagina;
        setLibrosLeyendo(nuevosLibros);
        setIsModalOpen(false);
      }
    });
  };

  const guardarLibroTerminado = () => {
    fetch(`${API_BASE_URL}/api/bibliotecas/actualizar-estanteria`, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        idLibroEstanteria: itemBiblioteca.id,
        nuevoNombreEstanteria: "Leído",
      }),
    }).then((res) => {
      if (res.ok) {
        fetch(`${API_BASE_URL}/api/reviews`, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({
            idUsuario: miSesion.idUsuario,
            idLibro: libroLeyendo.idLibro,
            puntuacion: puntuacion,
          }),
        })
          .then((resReview) => {
            const librosRestantes = librosLeyendo.filter(
              (_, index) => index !== indiceLibro,
            );
            setLibrosLeyendo(librosRestantes);
            setIndiceLibro(0);
            setIsModalOpen(false);
            setPuntuacion(0); 
          })
          .catch((err) =>
            console.error("Error al guardar la valoración:", err),
          );
      }
    });
  };

  return (
    <div className="container-custom py-5">
      {mensaje.texto && (
        <div className={`vault-toast vault-toast--${mensaje.tipo}`}>
          {mensaje.tipo === "success" ? (
            <i className="bi bi-check-circle-fill me-2"></i>
          ) : (
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
          )}
          {mensaje.texto}
        </div>
      )}
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
                  <i
                    className="bi bi-bookshelf"
                    style={{
                      fontSize: "2rem",
                      color: "var(--color-verde-oscuro)",
                    }}
                  ></i>
                </div>
                <span className="mis-libros-card__btn-texto">
                  Ver mis estanterías
                </span>
              </div>
            </div>

            {/* Bloque Leyendo actualmente */}
            <div className="leyendo position-relative">
              <h3 className="leyendo__titulo">Leyendo actualmente</h3>

              {libroLeyendo ? (
                <div className="leyendo__libro flex-column align-items-center text-center">
                  {/* CONTROLES DEL SLIDER */}
                  <div className="d-flex justify-content-center align-items-center w-100 position-relative mb-3">
                    {librosLeyendo.length > 1 && (
                      <button
                        onClick={anteriorLibro}
                        className="btn btn-sm btn-light shadow-sm rounded-circle position-absolute"
                        style={{
                          width: "35px",
                          height: "35px",
                          zIndex: 2,
                          left: "0px",
                        }}
                      >
                        <i className="bi bi-chevron-left text-secondary"></i>
                      </button>
                    )}

                    <picture
                      className="libro__picture mx-auto"
                      onClick={() => navigate(`/libro/${libroLeyendo.isbn}`)}
                      style={{ cursor: "pointer", transition: "0.3s" }}
                    >
                      <img
                        src={
                          libroLeyendo.portada ||
                          libroLeyendo.fotoPortada ||
                          "https://via.placeholder.com/150x200?text=Sin+Portada"
                        }
                        alt={libroLeyendo.titulo}
                        className="libro__portada shadow-sm"
                      />
                    </picture>

                    {librosLeyendo.length > 1 && (
                      <button
                        onClick={siguienteLibro}
                        className="btn btn-sm btn-light shadow-sm rounded-circle position-absolute"
                        style={{
                          width: "35px",
                          height: "35px",
                          zIndex: 2,
                          right: "0px",
                        }}
                      >
                        <i className="bi bi-chevron-right text-secondary"></i>
                      </button>
                    )}
                  </div>
                  {/* FIN CONTROLES */}

                  <div className="libro__info w-100">
                    <div
                      onClick={() => navigate(`/libro/${libroLeyendo.isbn}`)}
                      style={{ cursor: "pointer" }}
                      className="mb-3"
                    >
                      <h4 className="libro__titulo mb-1">
                        {libroLeyendo.titulo}
                      </h4>
                      <h4 className="libro__escritor m-0">
                        {libroLeyendo.autor || "Autor Desconocido"}
                      </h4>
                    </div>

                    <div
                      className="libro__progreso mt-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        abrirModalProgreso(); 
                      }}
                      style={{ cursor: "pointer" }}
                      title="Haga clic para actualizar su página actual"
                    >
                      <span className="progreso__actual d-block mb-1">
                        Página {pagActual} / {pagTotales}
                      </span>
                      <div className="progress-container">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${Math.min(porcentajeLibro, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted small py-3">
                  No estás leyendo ningún libro.
                </div>
              )}
            </div>

            {/* --- MODAL FLOTANTE DE PROGRESO --- */}
            {isModalOpen && (
              <div className="modal-overlay">
                <div className="modal-progreso-nuevo">
                  {paso === 1 ? (
                    <>
                      <h3 className="modal-titulo">Actualizar progreso</h3>
                      <p className="text-center text-muted">
                        {libroLeyendo.titulo}
                      </p>
                      <div className="modal-inputs-wrapper justify-content-center my-4">
                        <div className="input-group-custom">
                          <input
                            type="number"
                            className="modal-input-num"
                            value={nuevaPagina}
                            onChange={(e) =>
                              setNuevaPagina(Number(e.target.value))
                            }
                          />
                          <span className="separador">de</span>
                          <span className="total-badge">{pagTotales}</span>
                        </div>
                      </div>
                      <div className="modal-botones">
                        <button
                          className="btn-cancelar"
                          onClick={() => setIsModalOpen(false)}
                        >
                          Cancelar
                        </button>
                        <button
                          className="btn-guardar-progreso"
                          onClick={guardarProgresoParcial}
                        >
                          Guardar
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="modal-puntuacion text-center">
                      <h3 className="modal-titulo">¡Libro Terminado!</h3>
                      <p>
                        ¿Qué te ha parecido{" "}
                        <strong>{libroLeyendo?.titulo}</strong>?
                      </p>
                      <div className="estrellas-wrapper my-4">
                        {[1, 2, 3, 4, 5].map((estrella) => (
                          <i
                            key={estrella}
                            className={`bi ${puntuacion >= estrella ? "bi-star-fill text-warning" : "bi-star text-secondary"} estrella-icon`}
                            style={{
                              fontSize: "2rem",
                              cursor: "pointer",
                              margin: "0 5px",
                            }}
                            onClick={() => setPuntuacion(estrella)}
                          ></i>
                        ))}
                      </div>
                      <button
                        className="btn-guardar-progreso w-100"
                        onClick={guardarLibroTerminado}
                      >
                        Finalizar lectura
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bloque Reto del año */}
            <div
              className="reto"
              onClick={() => navigate("/reto")}
              style={{ cursor: "pointer" }}
            >
              <h3 className="reto__titulo">Reto del año</h3>

              {stats.objetivoReto > 0 ? (
                <>
                  <p className="reto__progreso-texto">
                    {stats.leidos} de {stats.objetivoReto} libros leídos
                  </p>
                  <div className="progress-container-reto">
                    <div
                      className="progress-bar-fill-reto"
                      style={{ width: `${Math.min(porcentajeReto, 100)}%` }}
                    ></div>
                    <span className="reto__porcentaje">{porcentajeReto}%</span>
                  </div>
                </>
              ) : (
                <div className="text-center mt-3">
                  <i
                    className="bi bi-trophy text-warning mb-2"
                    style={{ fontSize: "2rem" }}
                  ></i>
                  <p
                    className="text-muted fw-bold mb-1"
                    style={{ fontSize: "0.95rem" }}
                  >
                    ¡Aún no tienes tu reto!
                  </p>
                  <p className="text-muted small mb-0">
                    Pulsa aquí para configurarlo y marcarte un objetivo anual.
                  </p>
                </div>
              )}
            </div>
          </section>
        </aside>

        {/* --- COLUMNA CENTRAL --- */}
        <main className="home-grid__main">
          <section className="noticias">
            <div className="noticias__bienvenida">
              <h3 className="bienvenida__titulo">
                Bienvenido a Reading
                <span className="bienvenida__titulo--verde">Vault</span>
              </h3>
              <p className="bienvenida__texto">
                Encuentra tus libros favoritos, únete a una comunidad y gestiona
                tu biblioteca personal
              </p>
            </div>

            {esAdmin && (
              <CrearNoticiaAdmin 
                onNoticiaCreada={cargarNoticiasReales} 
                mostrarNotificacion={mostrarNotificacion} 
              />
            )}

            <h1 className="noticias__titulo">NOTICIAS</h1>
            <div className="noticias__feed">
              {librosNoticias.length > 0 ? (
                librosNoticias
                  .slice(0, limiteNoticias)
                  .map((noticia, index) => (
                    <NoticiaCard
                      key={noticia.idNoticia || index}
                      noticia={noticia}
                      esAdmin={esAdmin}
                      onNoticiaModificada={cargarNoticiasReales}
                      mostrarNotificacion={mostrarNotificacion}
                    />
                  ))
              ) : (
                <div className="text-center text-muted small py-3 bg-white rounded-3">
                  No hay noticias disponibles.
                </div>
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
                      src={
                        libroAmigo.portada ||
                        libroAmigo.fotoPortada ||
                        "https://via.placeholder.com/150x200?text=Sin+Portada"
                      }
                      alt={libroAmigo.titulo}
                      className="recomendacion__portada"
                    />
                  </picture>

                  <div className="recomendacion__textos w-100 mb-3">
                    <h4 className="recomendacion__libro mb-1">
                      {libroAmigo.titulo}
                    </h4>
                    <h4 className="recomendacion__autor">
                      {libroAmigo.autor || "Autor Desconocido"}
                    </h4>
                  </div>
                </div>

                <p className="recomendacion__amigo m-0">
                  Selección de {nombreRecomendador}
                </p>
              </div>
            )}

            {libroAnio && (
              <div
                className="libroAño text-center"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/libro/${libroAnio.isbn}`)}
              >
                <div className="libro-anio-titulo-admin d-flex align-items-center justify-content-center flex-nowrap gap-2" onClick={(e) => e.stopPropagation()}>
                  <h3 className="recomendacion__titulo m-0" style={{ background: 'none', padding: 0 }}>¡Libro del año!</h3>
                  {esAdmin && (
                    <button onClick={() => setIsEditando(true)} className="btn btn-sm btn-light text-warning border-0 shadow-sm" title="Cambiar Libro del Año">
                      <i className="bi bi-trophy-fill" style={{ color: "#ffc107" }}></i>
                    </button>
                  )}
                </div>
                <div className="d-flex flex-column align-items-center mt-3">
                  <picture className="recomendacion__picture mb-3">
                    <img src={libroAnio.portada || libroAnio.fotoPortada || "https://via.placeholder.com/150x200?text=Sin+Portada"} alt={libroAnio.titulo} className="recomendacion__portada" />
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

      {/* --- MODAL FLOTANTE PARA CAMBIAR LIBRO DEL AÑO (CENTRAL) --- */}
      {isEditando && (
        <div className="modal-overlay">
          <div className="modal-custom" style={{ maxWidth: '500px', width: '90%', padding: '24px', borderRadius: '12px', backgroundColor: '#fff' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="m-0 fw-bold">🏆 Buscar nuevo Libro del Año</h4>
              <button className="btn btn-sm btn-outline-danger border-0" onClick={() => {
                setIsEditando(false);
                setBusquedaLibro('');
                setResultadosLibros([]);
              }}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Input del buscador */}
            <input
              type="text"
              className="form-control input-vault mb-3"
              placeholder="Escribe el título del libro..."
              value={busquedaLibro}
              onChange={handleBuscarLibroDinamico}
              autoFocus
            />

            {/* Indicador de carga */}
            {isBuscando && <div className="text-center text-muted small my-3">Buscando libros...</div>}

            {/* Lista de resultados con portada, título y autor */}
            {resultadosLibros.length > 0 && (
              <ul className="list-group shadow-sm" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {resultadosLibros.map((lib) => (
                  <li
                    key={lib.idLibro || lib.isbn}
                    className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-2"
                    onClick={() => asignarLibroAnio(lib)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={lib.portada || lib.fotoPortada || "https://via.placeholder.com/50x75?text=Sin+Portada"}
                      alt={lib.titulo}
                      style={{ width: '50px', height: '75px', objectFit: 'cover', borderRadius: '5px' }}
                    />
                    <div className="d-flex flex-column text-start">
                      <span className="fw-bold text-dark">{lib.titulo}</span>
                      <span className="text-muted small">{lib.autor || "Autor Desconocido"}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Mensaje de sin resultados */}
            {busquedaLibro.trim().length >= 3 && resultadosLibros.length === 0 && !isBuscando && (
              <div className="text-center text-muted small my-3">No se encontró ningún libro.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}