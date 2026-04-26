

export function SidebarUsuario({ user }) {
    // URL del monigote por defecto
    const FOTO_DEFAULT = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    return (
        <aside className="sidebar-perfil">
            {/* Foto Circular con lógica de imagen por defecto */}
            <div className="text-center mb-4">
                <img 
                    src={user.fotoPerfil || FOTO_DEFAULT} 
                    className="foto-perfil-circulo" 
                    alt="Perfil" 
                />
            </div>

            {/* Bloques de Resumen */}
            <div className="perfil-card text-center">
                <h5 className="sidebar-titulo">Resumen</h5>
                <div className="row">
                    <div className="col-6 border-end mb-3">
                        <p className="small mb-0 text-muted">Leídos</p>
                        <span className="fw-bold text-dark">2578</span>
                    </div>
                    <div className="col-6 mb-3">
                        <p className="small mb-0 text-muted">Reseñas</p>
                        <span className="fw-bold text-dark">92</span>
                    </div>
                    <div className="col-6 border-end">
                        <p className="small mb-0 text-muted">Siguiendo</p>
                        <span className="fw-bold text-dark">142</span>
                    </div>
                    <div className="col-6">
                        <p className="small mb-0 text-muted">Seguidores</p>
                        <span className="fw-bold text-dark">89</span>
                    </div>
                </div>
            </div>

            {/* Reto Anual */}
            <div className="perfil-card">
                <h5 className="sidebar-titulo">RETO ANUAL</h5>
                <p className="small text-center mb-2">Has leído <strong>17</strong> de 20 libros</p>
                <div className="progress mb-3" style={{ height: '12px', backgroundColor: '#e9ecef', borderRadius: '10px' }}>
                    <div 
                        className="progress-bar" 
                        role="progressbar" 
                        style={{ 
                            width: '85%', 
                            backgroundColor: 'var(--color-amarillo)',
                            borderRadius: '10px'
                        }}
                    ></div>
                </div>
                <button className="btn btn-vault w-100">Ver mi reto</button>
            </div>
        </aside>
    );
}