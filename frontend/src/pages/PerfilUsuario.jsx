import { useState, useEffect } from "react";
import HeaderUsuario from "../sections/HeaderUsuario";
import ActividadUsuario from "../sections/ActividadUsuario";
import { SidebarUsuario } from "../components/SidebarUsuario";
import "../assets/css/perfil.css";

export default function PerfilUsuario() {
  const [usuario, setUsuario] = useState(null);
  
 
  const [stats, setStats] = useState({
    leidos: 0,
    resenas: 0,
    objetivoReto: 20 
  });

  useEffect(() => {
    const sesion = localStorage.getItem("usuario");
    if (sesion) {
      const userObj = JSON.parse(sesion);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

     
      fetch(`http://localhost:8080/api/usuarios/${userObj.idUsuario}`, { headers })
        .then((res) => res.json())
        .then((data) => setUsuario(data));

      fetch(`http://localhost:8080/api/bibliotecas/usuario/${userObj.idUsuario}/completa`, { headers })
        .then((res) => res.json())
        .then((items) => {
          const totalLeidos = items.filter(
            (item) => item.estanteria && item.estanteria.nombre === "Leído",
          ).length;

          setStats((prev) => ({ ...prev, leidos: totalLeidos }));
        })
        .catch((err) => console.error("Error biblioteca:", err));

      fetch(`http://localhost:8080/api/reviews/usuario/${userObj.idUsuario}/total`, { headers })
        .then((res) => res.json())
        .then((reviews) => {
          const totalResenas = reviews.filter(
            (r) => r.contenido && r.contenido.trim() !== "",
          ).length;
          setStats((prev) => ({ ...prev, resenas: totalResenas }));
        })
        .catch((err) => console.error("Error reviews:", err));
    } else {
        window.location.href = "/login";
    }
  }, []);

  if (!usuario)
    return <div style={{ padding: "50px" }}>Cargando tu perfil...</div>;

  return (
    <main className="container-custom py-5">
      <div className="row g-4">
        <div className="col-lg-3">
 
          <SidebarUsuario user={usuario} stats={stats} />
        </div>

        <div className="col-lg-9">
          <HeaderUsuario user={usuario} />
          <ActividadUsuario user={usuario} />
        </div>
      </div>
    </main>
  );
}