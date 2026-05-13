import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import HeaderUsuario from "../sections/HeaderUsuario";
import ActividadUsuario from "../sections/ActividadUsuario";
import { SidebarUsuario } from "../components/SidebarUsuario";
import "../assets/css/perfil.css";

export default function PerfilUsuario() {
    const { idUsuario } = useParams();
    const navigate = useNavigate();

    const [usuario, setUsuario] = useState(null);
    const [estadoRelacion, setEstadoRelacion] = useState("NINGUNA");
    const [stats, setStats] = useState({ leidos: 0, resenas: 0, amigos: 0, grupos: 0, objetivoReto: 20 });
    const [cargando, setCargando] = useState(true);
    const [actividadLibros, setActividadLibros] = useState([]);

    useEffect(() => {
        if (!idUsuario) return;
        window.scrollTo(0, 0);
        setCargando(true);

        const token = localStorage.getItem("token");
        const sesion = localStorage.getItem("usuario");
        if (!token || !sesion) { navigate("/login"); return; }

        const userObj = JSON.parse(sesion);
        const headers = { 'Authorization': `Bearer ${token}` };

        fetch(`http://localhost:8080/api/usuarios/${idUsuario}`, { headers })
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                setUsuario(data);
                setCargando(false);
            })
            .catch(() => navigate("/"));

        if (userObj.idUsuario !== parseInt(idUsuario)) {
            fetch(`http://localhost:8080/api/amistades/estado/${userObj.idUsuario}/${idUsuario}`, { headers })
                .then(res => res.ok ? res.text() : "NINGUNA")
                .then(estado => setEstadoRelacion(estado));
        } else {
            setEstadoRelacion("PROPIO");
        }

        fetch(`http://localhost:8080/api/bibliotecas/usuario/${idUsuario}/completa`, { headers })
            .then(res => res.ok ? res.json() : [])
            .then(items => {
                const totalLeidos = items.filter(i => i.estanteria?.nombre === "Leído").length;
                setStats(prev => ({ ...prev, leidos: totalLeidos }));
                const ultimos3 = [...items].sort((a, b) => b.id - a.id).slice(0, 3);
                setActividadLibros(ultimos3);
            });

        fetch(`http://localhost:8080/api/reviews/usuario/${idUsuario}/total`, { headers })
            .then(res => res.ok ? res.json() : [])
            .then(reviews => {
                setStats(prev => ({ ...prev, resenas: reviews.filter(r => r.contenido?.trim()).length }));
            });

        fetch(`http://localhost:8080/api/amistades/lista/${idUsuario}`, { headers })
            .then(res => res.ok ? res.json() : [])
            .then(amigos => setStats(prev => ({ ...prev, amigos: amigos.length })));

    }, [idUsuario, navigate]);

    const manejarSolicitudAmistad = () => {
        const token = localStorage.getItem("token");
        const miSesion = JSON.parse(localStorage.getItem("usuario"));

        fetch(`http://localhost:8080/api/amistades/enviar`, {
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
                Swal.fire({
                    title: 'Solicitud enviada',
                    text: 'Se ha enviado la petición de amistad.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        });
    };

    const manejarEliminarAmistad = () => {
        Swal.fire({
            title: '¿Eliminar amigo?',
            text: `¿Estás seguro de que quieres eliminar a ${usuario.nombreUsuario}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#5d4037',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                const token = localStorage.getItem("token");
                const miSesion = JSON.parse(localStorage.getItem("usuario"));

                fetch(`http://localhost:8080/api/amistades/eliminar/${miSesion.idUsuario}/${idUsuario}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(res => {
                    if (res.ok) {
                        setEstadoRelacion("NINGUNA");
                        setStats(prev => ({ ...prev, amigos: Math.max(0, prev.amigos - 1) }));
                        Swal.fire({
                            title: '¡Eliminado!',
                            text: 'Amistad finalizada.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
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
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '80vh' }}>
                <div className="spinner-grow text-success" role="status"></div>
                <p className="mt-3 text-muted">Abriendo bóveda...</p>
            </div>
        );
    }

    const tienePermisoDatos = comprobarPermiso(usuario.privacidadDatos);
    const tienePermisoLibros = comprobarPermiso(usuario.privacidadLibros);
    const tienePermisoActividad = comprobarPermiso(usuario.privacidadActividad);

    return (
        <main className="container-custom py-5">
            <div className="row g-4">
                <div className="col-lg-3">
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
                <div className="col-lg-9">
                    <HeaderUsuario
                        user={usuario}
                        sonAmigos={sonAmigos}
                        permisoDatos={tienePermisoDatos}
                    />

                    {tienePermisoActividad ? (
                        <ActividadUsuario
                            user={usuario}
                            libros={actividadLibros}
                            idUsuario={idUsuario}
                        />
                    ) : (
                        <div className="perfil-card p-5 text-center mt-4 border-dashed">
                            <i className="bi bi-shield-lock-fill text-muted" style={{ fontSize: '3rem' }}></i>
                            <h4 className="mt-3" style={{ color: 'var(--text-titulos)' }}>Actividad Privada</h4>
                            <p className="text-muted mb-0">
                                La actividad de lectura y reseñas de este usuario es privada.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}