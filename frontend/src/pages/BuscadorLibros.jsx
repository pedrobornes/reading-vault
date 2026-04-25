import React, { useState } from 'react';
import axios from 'axios';

const BuscadorLibros = () => {
    const [libros, setLibros] = useState([]);
    const [textoBusqueda, setTextoBusqueda] = useState('');

    const ejecutarBusqueda = async (e) => {
        e.preventDefault();
        try {
            // Buscamos usando el parámetro 'q' que configuramos en el backend
            const response = await axios.get(`http://localhost:8080/api/libros/buscar?q=${textoBusqueda}`);
            setLibros(response.data);
        } catch (error) {
            console.error("Error al buscar:", error);
        }
    };

    const tusGeneros = ["Ficción", "Misterio", "Ciencia Ficción", "Romance"];
    const todosLosGeneros = [
        "Arte", "Autoayuda", "Biografía", "Ciencia ficción", "Clásicos", 
        "Crimen", "Fantasía", "Historia", "Comedia", "Infantil", 
        "Misterio", "Novela", "Paranormal", "Poesía", "Romance", 
        "Suspense", "Terror", "Thriller"
    ];

    return (
        <div style={estiloPagina}>
            {/* --- SIDEBAR IZQUIERDO --- */}
            <aside style={estiloSidebar}>
                <h3 style={estiloTituloSeccion}>Tus géneros</h3>
                <div style={estiloLinea} />
                <ul style={estiloLista}>
                    {tusGeneros.map(g => <li key={g} style={estiloItem}>{g}</li>)}
                </ul>

                <h3 style={{...estiloTituloSeccion, marginTop: '20px'}}>Todos los géneros</h3>
                <div style={estiloLinea} />
                <ul style={estiloLista}>
                    {todosLosGeneros.map(g => <li key={g} style={estiloItem}>{g}</li>)}
                </ul>
            </aside>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <main style={{ flex: 1 }}>
                
                {/* BUSCADOR (Sin el dropdown de autor, más limpio) */}
                <div style={estiloContenedorBuscador}>
                    <form onSubmit={ejecutarBusqueda} style={estiloForm}>
                        <div style={estiloIcono}>🔍</div>
                        <input 
                            type="text" 
                            placeholder="Busca por título, autor o género..." 
                            value={textoBusqueda}
                            onChange={(e) => setTextoBusqueda(e.target.value)}
                            style={estiloInput}
                        />
                        <button 
                            type="submit" 
                            style={estiloBoton}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#b57668'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#C88B7D'}
                        >
                            Buscar
                        </button>
                    </form>
                </div>

                {/* ORDENAR POR */}
                <div style={{textAlign: 'right', marginBottom: '20px'}}>
                    <span style={{color: '#666', marginRight: '10px'}}>Ordenar por:</span>
                    <select style={estiloSelect}>
                        <option>Valoración</option>
                        <option>Título</option>
                    </select>
                </div>

                {/* GRID DE RESULTADOS */}
                <div style={estiloGrid}>
                    {libros.length > 0 ? (
                        libros.map((libro, index) => (
                            <div 
                                key={index} 
                                style={estiloCard}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={estiloContenedorImagen}>
                                    <img 
                                        src={libro.portada || 'https://via.placeholder.com/100x150?text=Sin+Portada'} 
                                        alt="Portada" 
                                        style={estiloImagen} 
                                    />
                                </div>
                                <div style={estiloEstrellas}>★★★★☆</div>
                                <h4 style={estiloTituloLibro}>{libro.titulo}</h4>
                                <p style={estiloAutorLibro}>{libro.autor}</p>
                            </div>
                        ))
                    ) : (
                        <p style={{textAlign: 'center', gridColumn: '1/-1', color: '#666', marginTop: '50px'}}>
                            Usa el buscador para encontrar tus libros favoritos.
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
};

// --- ESTILOS ---
const estiloPagina = { display: 'flex', padding: '40px', gap: '30px', backgroundColor: '#E0F9EE', minHeight: '100vh', fontFamily: 'sans-serif' };

const estiloSidebar = { width: '220px', backgroundColor: '#A8CBBF', padding: '20px', borderRadius: '15px', color: '#444', height: 'fit-content' };
const estiloTituloSeccion = { fontSize: '1.1rem', marginBottom: '5px', textAlign: 'center' };
const estiloLinea = { height: '1px', backgroundColor: '#888', marginBottom: '10px' };
const estiloLista = { listStyle: 'none', padding: 0, margin: 0, textAlign: 'center' };
const estiloItem = { padding: '5px 0', fontSize: '0.9rem', cursor: 'pointer' };

const estiloContenedorBuscador = { backgroundColor: '#A8CBBF', padding: '15px 40px', borderRadius: '50px', marginBottom: '30px', display: 'flex', justifyContent: 'center' };
const estiloForm = { display: 'flex', width: '100%', maxWidth: '650px', backgroundColor: 'white', borderRadius: '30px', overflow: 'hidden' };
const estiloIcono = { padding: '0 15px', display: 'flex', alignItems: 'center', color: '#888' };
const estiloInput = { flex: 1, border: 'none', padding: '12px 10px', fontSize: '1rem', outline: 'none' };
const estiloBoton = { backgroundColor: '#C88B7D', color: 'white', border: 'none', padding: '0 30px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' };

const estiloSelect = { padding: '5px 10px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: 'white' };

const estiloGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '25px' };
const estiloCard = { backgroundColor: '#A8CBBF', padding: '15px', borderRadius: '15px', textAlign: 'center', transition: '0.3s', cursor: 'pointer' };
const estiloContenedorImagen = { backgroundColor: 'white', padding: '15px', borderRadius: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'center' };
const estiloImagen = { width: '100%', height: '180px', objectFit: 'contain' };
const estiloEstrellas = { color: '#FFCC66', marginBottom: '5px', fontSize: '1.1rem' };
const estiloTituloLibro = { fontSize: '0.95rem', margin: '5px 0', fontWeight: 'bold', color: '#333' };
const estiloAutorLibro = { fontSize: '0.85rem', color: '#555' };

export default BuscadorLibros;