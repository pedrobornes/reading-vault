import { useState, useEffect } from "react"; 
import EditarPerfilForm from "../components/EditarPerfilForm";
import AjustesPrivacidad from "../components/AjustesPrivacidad"; 
import { API_BASE_URL } from '../apiConfig';
import AjustesGeneros from "../components/AjustesGeneros"; 

export default function AjustesCuenta() {
  const [pestañaActiva, setPestañaActiva] = useState("perfil");
  const [usuario, setUsuario] = useState(null); 
  const actualizarEstadoUsuario = (nuevosDatos) => {
    setUsuario(nuevosDatos);
  };

  useEffect(() => {
    // Saca ID de sesión
    const sesion = localStorage.getItem("usuario");
    
    if (sesion) {
      const userObj = JSON.parse(sesion);
      const token = localStorage.getItem("token");

      // Petición al backend
      fetch(`${API_BASE_URL}/api/usuarios/${userObj.idUsuario}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setUsuario(data))
      .catch(err => console.error("Error cargando ajustes:", err));
    }
  }, []);

  if (!usuario) {
    return (
      <div className="loader-container d-flex flex-column justify-content-center align-items-center text-center w-100" style={{ minHeight: "60vh" }}>
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
        <h4 className="loader-texto mt-5 text-muted fw-bold">Cargando tus ajustes...</h4>
      </div>
    );
  }

  return (
    <main className="container-custom py-5">
      <h1 className="mb-4" style={{ fontFamily: 'var(--font-titulos)' }}>Ajustes de la cuenta</h1>
      
      <ul className="nav nav-tabs border-0 mb-4" role="tablist">
        {/* Pestaña Perfil */}
        <li className="nav-item">
          <button 
            className={`nav-link text-dark ${pestañaActiva === 'perfil' ? 'active fw-bold' : ''}`}
            style={{ border: 'none', backgroundColor: 'transparent', borderBottom: pestañaActiva === 'perfil' ? '2px solid var(--accent)' : 'none' }}
            onClick={() => setPestañaActiva("perfil")}
          >
            Perfil
          </button>
        </li>

        {/* Pestaña Géneros */}
        <li className="nav-item">
          <button 
            className={`nav-link text-dark ${pestañaActiva === 'generos' ? 'active fw-bold' : ''}`}
            style={{ border: 'none', backgroundColor: 'transparent', borderBottom: pestañaActiva === 'generos' ? '2px solid var(--accent)' : 'none' }}
            onClick={() => setPestañaActiva("generos")}
          >
            Géneros
          </button>
        </li>

        {/* Pestaña Cuenta */}
        <li className="nav-item">
          <button 
            className={`nav-link text-dark ${pestañaActiva === 'cuenta' ? 'active fw-bold' : ''}`}
            style={{ border: 'none', backgroundColor: 'transparent', borderBottom: pestañaActiva === 'cuenta' ? '2px solid var(--accent)' : 'none' }}
            onClick={() => setPestañaActiva("cuenta")}
          >
            Privacidad
          </button>
        </li>
      </ul>

      {/* Renderizado condicional de componentes */}
      <div className="perfil-card p-4">
        {pestañaActiva === "perfil" && (
          <EditarPerfilForm user={usuario} onUpdate={actualizarEstadoUsuario} />
        )}
        {pestañaActiva === "generos" && (
          <AjustesGeneros user={usuario} onUpdate={actualizarEstadoUsuario} />
        )}
        {pestañaActiva === "cuenta" && (
          <AjustesPrivacidad user={usuario} onUpdate={actualizarEstadoUsuario} />
        )}
      </div>
    </main>
  );
}