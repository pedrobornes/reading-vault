import { useState, useEffect } from "react";
import HeaderUsuario from "../sections/HeaderUsuario";
import ActividadUsuario from "../sections/ActividadUsuario";
import { SidebarUsuario } from "../components/SidebarUsuario";
import "../assets/css/perfil.css"

export default function PerfilUsuario() {
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        // Sacamos los datos que guardó el login
        const sesion = localStorage.getItem("usuario");
        
        if (sesion) {
            const userObj = JSON.parse(sesion);
            
            // Llamamos al backend usando el idUsuario
            const token = localStorage.getItem("token");

            fetch(`http://localhost:8080/api/usuarios/${userObj.idUsuario}`, {
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            })
            .then(res => res.json())
            .then(data => setUsuario(data))
            .catch(err => console.error("Error cargando perfil:", err));
        } else {
            // Si no hay sesión, al login directo
            window.location.href = "/login";
        }
    }, []);

    if (!usuario) return <div style={{padding: '50px'}}>Cargando tu perfil...</div>;

    return (
        <main className="container-custom py-5">
            <div className="row g-4">
                {/* COLUMNA IZQUIERDA (Sidebar) */}
                <div className="col-lg-3">
                    <SidebarUsuario user={usuario} />
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