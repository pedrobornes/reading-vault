import React, { useState, useEffect } from "react";
import HeaderUsuario from "../sections/HeaderUsuario";
import ActividadUsuario from "../sections/ActividadUsuario";
import { SidebarUsuario } from "../components/SidebarUsuario";
import "../assets/css/perfil.css";

export default function PerfilUsuario() {
    const [usuario, setUsuario] = useState(null);
    const [stats, setStats] = useState({
        leidos: 0,
        resenas: 0,
        objetivoReto: 20 // Valor por defecto
    });

    useEffect(() => {
        const sesion = localStorage.getItem("usuario");
        const token = localStorage.getItem("token");

        // 1. Validación de seguridad inicial
        if (!sesion || !token) {
            window.location.href = "/login";
            return;
        }

        const userObj = JSON.parse(sesion);
        const headers = { 'Authorization': `Bearer ${token}` };

        // 2. Petición de datos del Usuario con manejo de errores de Token
        fetch(`http://localhost:8080/api/usuarios/${userObj.idUsuario}`, { headers })
            .then(res => {
                if (!res.ok) {
                    if (res.status === 401 || res.status === 403) {
                        localStorage.clear();
                        window.location.href = "/login";
                    }
                    throw new Error("Error en la respuesta del servidor");
                }
                return res.json();
            })
            .then(data => setUsuario(data))
            .catch(err => {
                console.error("Error cargando perfil:", err);
                window.location.href = "/login";
            });

        // 3. Petición de Biblioteca (Estadísticas de Libros)
        fetch(`http://localhost:8080/api/bibliotecas/usuario/${userObj.idUsuario}/completa`, { headers })
            .then(res => res.ok ? res.json() : [])
            .then(items => {
                const totalLeidos = items.filter(
                    (item) => item.estanteria && item.estanteria.nombre === "Leído"
                ).length;
                setStats(prev => ({ ...prev, leidos: totalLeidos }));
            })
            .catch(err => console.error("Error biblioteca:", err));

        // 4. Petición de Reseñas
        fetch(`http://localhost:8080/api/reviews/usuario/${userObj.idUsuario}/total`, { headers })
            .then(res => res.ok ? res.json() : [])
            .then(reviews => {
                const totalResenas = reviews.filter(
                    (r) => r.contenido && r.contenido.trim() !== ""
                ).length;
                setStats(prev => ({ ...prev, resenas: totalResenas }));
            })
            .catch(err => console.error("Error reviews:", err));

    }, []);

    // Loader mientras el usuario principal no llega
    if (!usuario) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <main className="container-custom py-5">
            <div className="row g-4">
                {/* COLUMNA IZQUIERDA (Sidebar con estadísticas) */}
                <div className="col-lg-3">
                    <SidebarUsuario user={usuario} stats={stats} />
                </div>

                {/* COLUMNA DERECHA (Contenido Principal) */}
                <div className="col-lg-9">
                    <HeaderUsuario user={usuario} />
                    <ActividadUsuario user={usuario} />
                </div>
            </div>
        </main>
    );
}