import React, { useState, useEffect } from "react";
import RetoHeader from "../components/RetoHeader";
import "../assets/css/paginaReto.css";

const Reto = () => {
  const [paginasPasadas, setPaginasPasadas] = useState([]);
  const [datosReto, setDatosReto] = useState({
    leidos: 0,
    objetivo: 0,
    paginasTotales: 0,
    diasSeguidos: 0,
  });
  const [librosPendientes, setLibrosPendientes] = useState([]);
  const [librosLeyendo, setLibrosLeyendo] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [libroSeleccionado, setLibroSeleccionado] = useState(null);
  const [nuevaPagina, setNuevaPagina] = useState(0);
  const [paso, setPaso] = useState(1);
  const [puntuacion, setPuntuacion] = useState(0);

  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const mostrarNotificacion = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
  };

  const ULTIMA_PAGINA_ID = 3;

  useEffect(() => {
    const sesion = JSON.parse(localStorage.getItem("usuario"));
    if (sesion) {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Llamamos a tu tabla reto_lectura para sacar el objetivo del año actual
      fetch(`http://localhost:8080/api/retos/usuario/${sesion.idUsuario}/actual`, { headers })
        .then((res) => res.json())
        .then((retoData) => {
          
          // 2. Cargamos el resto de libros de las estanterías del usuario
          return fetch(`http://localhost:8080/api/bibliotecas/usuario/${sesion.idUsuario}/completa`, { headers })
            .then((res) => res.json())
            .then((items) => {
              const librosLeidos = items.filter(item => item.estanteria?.nombre === "Leído");
              const sumaPaginas = librosLeidos.reduce((acc, item) => acc + (item.libro?.paginas || 0), 0);
              const librosActivos = items.filter(item => item.estanteria?.nombre === "Leyendo");
              const pendientes = items.filter(item => item.estanteria?.nombre === "Pendiente");

              setLibrosLeyendo(librosActivos);
              setLibrosPendientes(pendientes);
              
              setDatosReto({
                leidos: librosLeidos.length,
                paginasTotales: sumaPaginas,
                objetivo: retoData.objetivoLibros || 0, 
                diasSeguidos: sesion?.rachaActual || 0,
              });
            });
        })
        .catch((err) => console.error("Error cargando reto histórico:", err));
    }
  }, []);

  const [nuevoObjetivo, setNuevoObjetivo] = useState("");

  const crearRetoAnual = () => {
    const num = parseInt(nuevoObjetivo);
    if (isNaN(num) || num <= 0) {
      mostrarNotificacion("Introduce un número de libros válido", "error");
      return;
    }

    const token = localStorage.getItem("token");
    const sesion = JSON.parse(localStorage.getItem("usuario"));

    // Hacemos la petición a tu RetoLecturaController
    fetch(`http://localhost:8080/api/retos/usuario/${sesion.idUsuario}`, {
      method: "POST", // Mandamos un POST para crear o actualizar el registro
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ objetivoLibros: num }),
    })
      .then((res) => res.json())
      .then((retoGuardado) => {
        // Actualizamos el estado visual al instante
        setDatosReto((prev) => ({
          ...prev,
          objetivo: retoGuardado.objetivoLibros,
        }));

        mostrarNotificacion("¡Reto anual guardado en el histórico!", "success");
      })
      .catch((err) => {
        console.error("Error al crear reto histórico:", err);
        mostrarNotificacion("No se pudo guardar el reto", "error");
      });
  };

  const finalizarLibro = () => {
    if (libroSeleccionado) {
      setNuevaPagina(libroSeleccionado.libro.paginas);
      setPaso(2);
    }
  };

  const guardarProgresoParcial = () => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:8080/api/bibliotecas/actualizar-progreso`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idLibroEstanteria: libroSeleccionado.id,
        paginaActual: nuevaPagina,
      }),
    }).then((res) => {
      if (res.ok) {
        setLibrosLeyendo((prev) =>
          prev.map((l) =>
            l.id === libroSeleccionado.id
              ? { ...l, progresoActual: nuevaPagina }
              : l,
          ),
        );
        setIsModalOpen(false);
        mostrarNotificacion("¡Progreso guardado!", "success");
      }
    });
  };

  const guardarTodo = () => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:8080/api/bibliotecas/actualizar-estanteria`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idLibroEstanteria: libroSeleccionado.id,
        nuevoNombreEstanteria: "Leído",
      }),
    }).then((res) => {
      if (res.ok) {
        setLibrosLeyendo((prev) =>
          prev.filter((l) => l.id !== libroSeleccionado.id),
        );
        setDatosReto((prev) => ({
          ...prev,
          leidos: prev.leidos + 1,
          paginasTotales: prev.paginasTotales + libroSeleccionado.libro.paginas,
        }));
        setIsModalOpen(false);
        setPaso(1);
        setLibroSeleccionado(null);
        mostrarNotificacion("¡Libro completado!", "success");
      }
    });
  };

  const manejarPasoPagina = (id) => {
    if (id !== ULTIMA_PAGINA_ID && !paginasPasadas.includes(id)) {
      setPaginasPasadas([...paginasPasadas, id]);
    }
  };

  const reiniciarLibro = () => setPaginasPasadas([]);
  const librosRestantes = Math.max(datosReto.objetivo - datosReto.leidos, 0);
  const porcentaje = datosReto.objetivo > 0 
    ? Math.min((datosReto.leidos / datosReto.objetivo) * 100, 100)
    : 0;

  return (
    <div className="pagina-reto">
      <RetoHeader />

      <main className="reto-main-content">
        {datosReto.objetivo === 0 ? (
          <section className="reto-setup-card">
            <div
              className="reto-card__icon-circle"
              style={{ width: "100px", height: "100px", fontSize: "3rem" }}
            >
              <i
                className="bi bi-trophy-fill"
                style={{ color: "var(--color-amarillo)" }}
              ></i>
            </div>
            <h2 className="text-verde mt-4">
              ¡Aún no tienes tu reto de lectura anual!
            </h2>
            <p className="text-muted">
              ¿Cuántos libros te propones leer este año {new Date().getFullYear()}?
            </p>

            <div className="setup-input-group mt-4">
              <input
                type="number"
                className="modal-input-num"
                value={nuevoObjetivo}
                onChange={(e) => setNuevoObjetivo(e.target.value)}
              />
              <button className="btn-progreso" onClick={crearRetoAnual}>
                <span>Empezar Desafío</span>
              </button>
            </div>
          </section>
        ) : (
          <>
            {/* TARJETA 3 - ESTADÍSTICAS */}
            <section
              className={`reto-card ultima-hoja ${paginasPasadas.includes(3) ? "pagina-pasada" : ""}`}
              style={{ zIndex: 1 }}
            >
              <div className="reto-card__title-container">
                <h3 className="reto-card__title">Estado de tu Vault</h3>
              </div>

              <div className="reto-card__body flex-column align-items-center">
                <div className="stats-mini-grid">
                  <div className="stat-item">
                    <span
                      className="stat-value"
                      style={{ color: "var(--color-amarillo)" }}
                    >
                      {datosReto.diasSeguidos}🔥
                    </span>
                    <span className="stat-label">Días racha</span>
                  </div>
                  <div className="stat-item">
                    <span
                      className="stat-value"
                      style={{ color: "var(--color-salmon)" }}
                    >
                      {datosReto.leidos}
                    </span>
                    <span className="stat-label">Leídos</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">
                      {librosPendientes.length}
                    </span>
                    <span className="stat-label">Pendientes</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{librosLeyendo.length}</span>
                    <span className="stat-label">Leyendo</span>
                  </div>
                </div>

                <button
                  onClick={reiniciarLibro}
                  className="btn-add-progress"
                  style={{ marginTop: "30px", width: "80%" }}
                >
                  Cerrar Libro
                </button>
              </div>
            </section>

            {/* TARJETA 2 - PÁGINAS */}
            <section
              className={`reto-card ${paginasPasadas.includes(2) ? "pagina-pasada" : ""}`}
              style={{ zIndex: 2 }}
              onClick={() => manejarPasoPagina(2)}
            >
              <div className="reto-card__title-container">
                <h3 className="reto-card__title">Análisis de Lectura</h3>
              </div>

              <div className="reto-card__body">
                <div
                  className="reto-card__data"
                  style={{ flex: 1, marginLeft: "30px" }}
                >
                  <div className="stats-mini-grid">
                    <div
                      className="stat-item"
                      style={{ gridColumn: "1 / -1", padding: "20px" }}
                    >
                      <span
                        className="stat-value"
                        style={{
                          fontSize: "2.5rem",
                          color: "var(--color-verde-oscuro)",
                        }}
                      >
                        {datosReto.paginasTotales}
                      </span>
                      <span className="stat-label">Páginas totales leídas</span>
                    </div>

                    <div className="stat-item">
                      <span className="stat-value-sm">
                        {datosReto.leidos > 0
                          ? Math.round(
                              datosReto.paginasTotales / datosReto.leidos,
                            )
                          : 0}
                      </span>
                      <span className="stat-label-sm">
                        Media de páginas por libro
                      </span>
                    </div>

                    <div className="stat-item">
                      <span className="stat-value-sm">
                        {Math.round(datosReto.paginasTotales / 30)}
                      </span>
                      <span className="stat-label-sm">
                        Media de páginas leídas por día
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* TARJETA 1 - PROGRESO */}
            <section
              className={`reto-card ${paginasPasadas.includes(1) ? "pagina-pasada" : ""}`}
              style={{ zIndex: 3 }}
              onClick={() => manejarPasoPagina(1)}
            >
              <div className="reto-card__title-container">
                <h3 className="reto-card__title">Progreso de tu reto</h3>
              </div>
              <div className="reto-card__body">
                <div className="reto-card__icon-circle">
                  <i className="bi bi-trophy"></i>
                </div>
                <div className="reto-card__data">
                  <p className="texto-principal">
                    ¡Has leído{" "}
                    <strong>
                      {datosReto.leidos} de {datosReto.objetivo}
                    </strong>{" "}
                    libros!
                  </p>
                  <div className="reto-progress-bar">
                    <div
                      className="reto-progress-bar__fill"
                      style={{ width: `${porcentaje}%` }}
                    ></div>
                  </div>
                  <p className="texto-secundario" style={{ marginTop: "20px" }}>
                    Te quedan sólo <strong>{librosRestantes} libros</strong>{" "}
                    para el desafío de este año.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <section className="reto-banner">
        <div className="reto-banner__textboton">
          <div className="reto-banner__text">
            <h2 className="text-verde">Cada página cuenta,</h2>
            <h2 className="text-amarillo">tú marcas el ritmo</h2>
          </div>
          <div className="reto-banner__button-wrapper">
            <button
              className="btn-progreso"
              onClick={() => {
                setIsModalOpen(true);
                setPaso(1);
              }}
            >
              <span>Añadir progreso de lectura</span>
            </button>
          </div>
        </div>
      </section>

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-progreso-nuevo">
            {paso === 1 ? (
              <>
                <h3 className="modal-titulo">¿Por qué página vas?</h3>
                <div className="modal-body-custom">
                  <select
                    className="modal-select"
                    value={libroSeleccionado?.id || ""}
                    onChange={(e) => {
                      const lib = librosLeyendo.find(
                        (l) => String(l.id) === String(e.target.value),
                      );
                      if (lib) {
                        setLibroSeleccionado(lib);
                        setNuevaPagina(lib.progresoActual || 0);
                      }
                    }}
                  >
                    <option value="">Selecciona un libro...</option>
                    {librosLeyendo.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.libro.titulo}
                      </option>
                    ))}
                  </select>

                  {libroSeleccionado && (
                    <div className="modal-inputs-wrapper">
                      <div className="input-group-custom">
                        <input
                          type="number"
                          className="modal-input-num"
                          value={nuevaPagina}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              setNuevaPagina("");
                              return;
                            }
                            const num = parseInt(val);
                            if (!isNaN(num)) setNuevaPagina(num);
                          }}
                        />
                        <span className="separador">de</span>
                        <span className="total-badge">
                          {libroSeleccionado.libro.paginas || 0}
                        </span>
                      </div>
                      <button
                        className="btn-finalizar-directo"
                        onClick={finalizarLibro}
                      >
                        <i className="bi bi-check-circle-fill"></i> ¡Ya lo he
                        terminado!
                      </button>
                    </div>
                  )}
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
                    onClick={() => {
                      if (nuevaPagina >= libroSeleccionado.libro.paginas)
                        finalizarLibro();
                      else guardarProgresoParcial();
                    }}
                  >
                    Guardar
                  </button>
                </div>
              </>
            ) : (
              <div className="modal-puntuacion text-center">
                <h3 className="modal-titulo">¡Enhorabuena!</h3>
                <p>
                  ¿Qué te ha parecido{" "}
                  <strong>{libroSeleccionado?.libro.titulo}</strong>?
                </p>
                <div className="estrellas-wrapper my-4">
                  {[1, 2, 3, 4, 5].map((estrella) => (
                    <i
                      key={estrella}
                      className={`bi ${puntuacion >= estrella ? "bi-star-fill" : "bi-star"} estrella-icon`}
                      onClick={() => setPuntuacion(estrella)}
                    ></i>
                  ))}
                </div>
                <button
                  className="btn-guardar-progreso w-100"
                  onClick={guardarTodo}
                >
                  Finalizar lectura
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOAST */}
      {mensaje.texto && (
        <div className={`vault-toast vault-toast--${mensaje.tipo}`}>
          <i
            className={`bi ${mensaje.tipo === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"} me-2`}
          ></i>
          {mensaje.texto}
        </div>
      )}
    </div>
  );
};

export default Reto;