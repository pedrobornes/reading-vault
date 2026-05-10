import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderUsuario from "../sections/HeaderUsuario";
import ActividadUsuario from "../sections/ActividadUsuario";
import { SidebarUsuario } from "../components/SidebarUsuario";
import "../assets/css/perfil.css";

export default function PerfilUsuario() {
    const { idUsuario } = useParams(); 
    const navigate = useNavigate();

    const [usuario, setUsuario] = useState(null);
    const [estadoRelacion, setEstadoRelacion] = useState("NINGUNA");
    const [stats, setStats] = useState({ leidos: 0, resenas: 0, objetivoReto: 20 });
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        setUsuario(null);
        setCargando(true);

        const token = localStorage.getItem("token");
        const sesion = localStorage.getItem("usuario");

        if (!token || !sesion) {
            navigate("/login");
            return;
        }

        const userObj = JSON.parse(sesion);
        const headers = { 'Authorization': `Bearer ${token}` };

        // 1. Datos del Usuario
        fetch(`http://localhost:8080/api/usuarios/${idUsuario}`, { headers })
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                setUsuario(data);
                setCargando(false);
            })
            .catch(() => navigate("/"));

        // 2. Verificar Relación
        if (userObj.idUsuario !== parseInt(idUsuario)) {
            fetch(`http://localhost:8080/api/amistades/estado/${userObj.idUsuario}/${idUsuario}`, { headers })
                .then(res => res.ok ? res.text() : "NINGUNA")
                .then(estado => setEstadoRelacion(estado))
                .catch(() => setEstadoRelacion("NINGUNA"));
        } else {
            setEstadoRelacion("PROPIO");
        }

        // 3. Stats
        fetch(`http://localhost:8080/api/bibliotecas/usuario/${idUsuario}/completa`, { headers })
            .then(res => res.ok ? res.json() : [])
            .then(items => {
                const totalLeidos = items.filter(i => i.estanteria?.nombre === "Leído").length;
                setStats(prev => ({ ...prev, leidos: totalLeidos }));
            });

        fetch(`http://localhost:8080/api/reviews/usuario/${idUsuario}/total`, { headers })
            .then(res => res.ok ? res.json() : [])
            .then(reviews => {
                const totalResenas = reviews.filter(r => r.contenido?.trim()).length;
                setStats(prev => ({ ...prev, resenas: totalResenas }));
            });

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
            if(res.ok) setEstadoRelacion("PENDIENTE");
        });
    };

    if (cargando || !usuario) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '80vh' }}>
                <div className="spinner-grow text-success" role="status"></div>
                <p className="mt-3 text-muted">Abriendo bóveda de lectura...</p>
            </div>
        );
    }

    return (
        <main className="container-custom py-5">
            <div className="row g-4">
                <div className="col-lg-3">
                    <SidebarUsuario 
                        user={usuario} 
                        stats={stats} 
                        estadoRelacion={estadoRelacion}
                        onAccionAmigo={manejarSolicitudAmistad}
                    />
                </div>
                <div className="col-lg-9">
                    <HeaderUsuario user={usuario} sonAmigos={estadoRelacion === "ACEPTADA"} />
                    <ActividadUsuario user={usuario} sonAmigos={estadoRelacion === "ACEPTADA"} />
                </div>
            </div>
        </main>
    );
}