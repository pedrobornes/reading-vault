import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; 
import { API_BASE_URL } from '../apiConfig';
import "../assets/css/actividadUsuario.css";

// TRUNCAR LAS RESEÑAS CON "LEER MÁS"
function TextoResenaTruncado({ texto }) {
    const [expandido, setExpandido] = useState(false);
    const limiteCaracteres = 500; // Límite idéntico al de la vista de detalle

    if (!texto) return null;

    // Si el texto es inferior al límite, se renderiza normal
    if (texto.length <= limiteCaracteres) {
        return <p className="resena-texto mb-0">"{texto}"</p>;
    }

    // Si supera el límite, calculamos el fragmento recortado
    const textoMostrado = expandido ? texto : texto.substring(0, limiteCaracteres) + "...";

    return (
        <div className="perfil-texto-resena">
            <p className="resena-texto mb-1">"{textoMostrado}"</p>
            <button 
                className="p-0 border-0 bg-transparent text-primary small fw-bold" 
                onClick={() => setExpandido(!expandido)}
                style={{ fontSize: '0.85rem' }}
            >
                {expandido ? "Ver menos ▲" : "Leer más ▼"}
            </button>
        </div>
    );
}

export default function ActividadUsuario({ libros, idUsuario }) {
    const [resenas, setResenas] = useState([]);
    const [visibles, setVisibles] = useState(2);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        if (!idUsuario || idUsuario === "undefined") return;

        const token = localStorage.getItem("token");
        fetch(`${API_BASE_URL}/api/reviews/usuario/${idUsuario}/total`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.ok ? res.json() : [])
        .then(data => {
            const filtradas = data
                .filter(r => r.contenido?.trim())
                .sort((a, b) => b.idReview - a.idReview);
            setResenas(filtradas);
            setCargando(false);
        });
    }, [idUsuario]);

    const renderEstrellas = (puntuacion) => {
        return [...Array(5)].map((_, i) => (
            <i 
                key={i} 
                className={`bi ${i < puntuacion ? 'bi-star-fill' : 'bi-star'} me-1`} 
                style={{ color: 'var(--color-amarillo)', fontSize: '0.9rem' }}
            ></i>
        ));
    };

    return (
        <div className="actividad-container">
            <h3 className="mb-4">Actividad reciente</h3>
            
            <div className="row g-4 mb-5">
                {libros && libros.length > 0 ? (
                    libros.map((item) => (
                        <div className="col-md-4" key={item.id}>
                            <Link 
                                to={`/libro/${item.libro?.isbn}`} 
                                state={{ libro: item.libro }} 
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <div className="libro-resumen-card">
                                    <img 
                                        src={item.libro?.fotoPortada || "/img/default-book.png"} 
                                        alt={item.libro?.titulo} 
                                        className="portada-resumen"
                                    />
                                    <div className="text-center w-100">
                                        <strong className="titulo-resumen d-block text-truncate">
                                            {item.libro?.titulo}
                                        </strong>
                                        <p className="fecha-resumen mb-2">
                                            {item.fecha ? `Añadido el ${item.fecha}` : 'Añadido recientemente'}
                                        </p>
                                        <span className="badge rounded-pill px-3 py-2" style={{ 
                                            backgroundColor: item.estanteria?.nombre === 'Leído' ? '#68c768' : 
                                                            item.estanteria?.nombre === 'Leyendo' ? '#5d8cca' : 'var(--accent)',
                                            fontSize: '0.65rem'
                                        }}>
                                            {item.estanteria?.nombre.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))
                ) : (
                    <div className="col-12"><p className="text-muted small ps-2">No hay libros recientes.</p></div>
                )}
            </div>

            <h5 className="resenas-header mb-4">Últimas reseñas</h5>
            <div className="list-group list-group-flush gap-3">
                {resenas.slice(0, visibles).map((r) => (
                    <div key={r.idReview} className="list-group-item resena-item shadow-sm">
                        <div className="d-flex justify-content-between align-items-start">
                            <div className="me-3">
                                <Link 
                                    to={`/libro/${r.libro?.isbn}`} 
                                    state={{ libro: r.libro }}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <h6 className="resena-libro-titulo">{r.libro?.titulo}</h6>
                                </Link>
                                <div className="mb-1">
                                    {renderEstrellas(r.puntuacion)}
                                </div>
                            </div>
                            <small className="text-muted fw-bold text-nowrap flex-shrink-0">{r.fecha}</small>
                        </div>
                        <TextoResenaTruncado texto={r.contenido} />
                    </div>
                ))}
            </div>

            {resenas.length > visibles && (
                <div className="btn-cargar-mas-wrapper">
                    <button className="btn-cargar-mas" onClick={() => setVisibles(prev => prev + 3)}> 
                        Cargar más reseñas 
                    </button>
                </div>
            )}
        </div>
    );
}