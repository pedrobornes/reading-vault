import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import HeaderUsuario from "../sections/HeaderUsuario";
import ActividadUsuario from "../sections/ActividadUsuario";
import { SidebarUsuario } from "../components/SidebarUsuario";
import { API_BASE_URL } from '../apiConfig';
import "../assets/css/perfil.css";

export default function PerfilUsuario() {
  const { idUsuario } = useParams();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [estadoRelacion, setEstadoRelacion] = useState("NINGUNA");
  const [stats, setStats] = useState({
    leidos: 0,
    resenas: 0,
    amigos: 0,
    grupos: 0,
    objetivoReto: 0,
  });
  const [cargando, setCargando] = useState(true);
  const [actividadLibros, setActividadLibros] = useState([]);

  // --- ESTADOS Y FUNCIONES PARA EL TOAST ---
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const mostrarNotificacion = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
  };

  useEffect(() => {
    if (!idUsuario) return;
    window.scrollTo(0, 0);
    setCargando(true);

    const token = localStorage.getItem("token");
    const sesion = localStorage.getItem("usuario");
    if (!token || !sesion) {
      navigate("/login");
      return;
    }

    const userObj = JSON.parse(sesion);
    const headers = { Authorization: `Bearer ${token}` };

    fetch(`${API_BASE_URL}/api/usuarios/${idUsuario}`, { headers })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(async (data) => { 
        setUsuario(data);
        setCargando(false);
      })
      .catch(() => navigate("/"));

    if (userObj.idUsuario !== parseInt(idUsuario)) {
      fetch(
        `${API_BASE_URL}/api/amistades/estado/${userObj.idUsuario}/${idUsuario}`,
        { headers },
      )
        .then((res) => (res.ok ? res.text() : "NINGUNA"))
        .then((estado) => setEstadoRelacion(estado));
    } else {
      setEstadoRelacion("PROPIO");
    }

    fetch(
      `${API_BASE_URL}/api/bibliotecas/usuario/${idUsuario}/completa`,
      { headers },
    )
      .then((res) => (res.ok ? res.json() : []))
      .then((items) => {
        const totalLeidos = items.filter(
          (i) => i.estanteria?.nombre === "Leído",
        ).length;
        setStats((prev) => ({ ...prev, leidos: totalLeidos }));
        const ultimos3 = [...items].sort((a, b) => b.id - a.id).slice(0, 3);
        setActividadLibros(ultimos3);
      });

    fetch(`${API_BASE_URL}/api/reviews/usuario/${idUsuario}/total`, {
      headers,
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((reviews) => {
        setStats((prev) => ({
          ...prev,
          resenas: reviews.filter((r) => r.contenido?.trim()).length,
        }));
      });

    fetch(`${API_BASE_URL}/api/amistades/lista/${idUsuario}`, { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((amigos) =>
        setStats((prev) => ({ ...prev, amigos: amigos.length })),
      );
    
    fetch(`${API_BASE_URL}/api/retos/usuario/${idUsuario}/actual`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error("Sin reto configurado");
        return res.json();
      })
      .then((retoData) => {
        setStats((prev) => ({
          ...prev,
          objetivoReto: retoData.objetivoLibros || 0,
        }));
      })
      .catch(() => {
        setStats((prev) => ({ ...prev, objetivoReto: 0 }));
      });

  }, [idUsuario, navigate]);

  const manejarSolicitudAmistad = () => {
    const token = localStorage.getItem("token");
    const miSesion = JSON.parse(localStorage.getItem("usuario"));

    fetch(`${API_BASE_URL}/api/amistades/enviar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        idRemitente: miSesion.idUsuario,
        idDestinatario: idUsuario
      })
    }).then(res => {
      if (res.ok) {
        setEstadoRelacion("PENDIENTE");
        mostrarNotificacion("Solicitud de amistad enviada", "success");
      } else {
        mostrarNotificacion("No se pudo enviar la solicitud", "error");
      }
    }).catch(err => {
      console.error("Error enviando solicitud:", err);
      mostrarNotificacion("Error de conexión", "error");
    });
  };

  const manejarEliminarAmistad = () => {
    Swal.fire({
      title: "¿Eliminar amigo?",
      text: `¿Estás seguro de que quieres eliminar a ${usuario.nombreUsuario}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#5d4037",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        const miSesion = JSON.parse(localStorage.getItem("usuario"));

        fetch(
          `${API_BASE_URL}/api/amistades/eliminar/${miSesion.idUsuario}/${idUsuario}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        ).then((res) => {
          if (res.ok) {
            setEstadoRelacion("NINGUNA");
            setStats((prev) => ({
              ...prev,
              amigos: Math.max(0, prev.amigos - 1),
            }));
            Swal.fire({
              title: "¡Eliminado!",
              text: "Amistad finalizada.",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            });
          }
        });
      }
    });
  };

  const esDuenio = estadoRelacion === "PROPIO";
  const sonAmigos = estadoRelacion === "ACEPTADA";

  const comprobarPermiso = (nivelSeccion) => {
    if (esDuenio) return true;
    if (!usuario) return false;
    if (usuario.privacidadPerfil === "Privado") return false;
    if (usuario.privacidadPerfil === "Solo Amigos" && !sonAmigos) return false;
    if (nivelSeccion === "Público") return true;
    if (nivelSeccion === "Solo Amigos" && sonAmigos) return true;
    return false;
  };

  if (cargando || !usuario) {
    return (
      <div 
        className="loader-container d-flex flex-column justify-content-center align-items-center text-center" 
        style={{ height: "80vh" }}
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
        <h4 className="loader-texto mt-5 text-muted fw-bold">Abriendo bóveda...</h4>
      </div>
    );
  }

  const tienePermisoDatos = comprobarPermiso(usuario.privacidadDatos);
  const tienePermisoLibros = comprobarPermiso(usuario.privacidadLibros);
  const tienePermisoActividad = comprobarPermiso(usuario.privacidadActividad);

  const FOTO_DEFAULT = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (
    <main className="container-custom py-5">
      <div className="row g-4 d-flex flex-column flex-lg-row">
        
        {/* 1. MÓVIL: Foto y Nombre independientes (Fuera del Header) - Orden 1 */}
        <div className="col-12 d-lg-none order-1 text-center mb-1">
          <img
            src={usuario.fotoPerfil || FOTO_DEFAULT}
            className="rounded-circle shadow-sm"
            alt="Perfil"
            style={{ width: "120px", height: "120px", objectFit: "cover", border: "4px solid white" }}
          />
          <h2 className="mt-3 fw-bold" style={{ color: "var(--color-verde-oscuro)" }}>
            {usuario.nombreUsuario}
          </h2>
        </div>

        {/* 2. Header (Datos personales) - Visible SOLO en móvil, orden 2 */}
        <div className="col-12 d-lg-none order-2 mb-2">
          <HeaderUsuario
            user={usuario}
            sonAmigos={sonAmigos}
            permisoDatos={tienePermisoDatos}
          />
        </div>

        {/* 3. Sidebar (Resumen y Reto) - Orden 3 en móvil, Orden 1 en PC */}
        <div className="col-lg-3 order-3 order-lg-1">
          <SidebarUsuario
            user={usuario}
            stats={stats}
            estadoRelacion={estadoRelacion}
            permisoLibros={tienePermisoLibros}
            permisoDatos={tienePermisoDatos}
            onAccionAmigo={manejarSolicitudAmistad}
            onEliminarAmigo={manejarEliminarAmistad}
          />
        </div>

        {/* 4. Columna Derecha (Actividad) - Orden 4 en móvil, Orden 2 en PC */}
        <div className="col-lg-9 order-4 order-lg-2">
          
          {/* Header (Datos personales) - Visible SOLO en PC */}
          <div className="d-none d-lg-block mb-4">
            <HeaderUsuario
              user={usuario}
              sonAmigos={sonAmigos}
              permisoDatos={tienePermisoDatos}
            />
          </div>

          {tienePermisoActividad ? (
            <ActividadUsuario
              user={usuario}
              libros={actividadLibros}
              idUsuario={idUsuario}
            />
          ) : (
            <div className="perfil-card p-5 text-center border-dashed">
              <i
                className="bi bi-shield-lock-fill text-muted"
                style={{ fontSize: "3rem" }}
              ></i>
              <h4 className="mt-3" style={{ color: "var(--text-titulos)" }}>
                Actividad Privada
              </h4>
              <p className="text-muted mb-0">
                La actividad de lectura y reseñas de este usuario es privada.
              </p>
            </div>
          )}
        </div>

        {/* Toast  */}
        {mensaje.texto && (
          <div className={`vault-toast vault-toast--${mensaje.tipo}`}>
            {mensaje.tipo === "success" 
              ? <i className="bi bi-check-circle-fill me-2"></i> 
              : <i className="bi bi-exclamation-triangle-fill me-2"></i>}
            {mensaje.texto}
          </div>
        )}
      </div>
    </main>
  );
}