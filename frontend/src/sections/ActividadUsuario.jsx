export default function ActividadUsuario({ user }) {
    return (
        <div className="perfil-card">
            <h3 className="mb-4" style={{fontSize: '1.5rem'}}>Actividad reciente</h3>
            
            <div className="row g-3 mb-5">
                {/* Datos falsos temporales para que no de error */}
                <div className="col-md-4">
                    <div className="p-3 text-center bg-light rounded">Libro 1</div>
                </div>
                <div className="col-md-4">
                    <div className="p-3 text-center bg-light rounded">Libro 2</div>
                </div>
                <div className="col-md-4">
                    <div className="p-3 text-center bg-light rounded">Libro 3</div>
                </div>
            </div>

            <div className="list-group list-group-flush">
                <div className="list-group-item d-flex justify-content-between align-items-center py-3 px-0 border-top">
                    <div>
                        <strong style={{color: 'var(--color-verde-oscuro)'}}>Nacidos de la Bruma: El Imperio Final</strong>
                        <p className="small mb-0 text-muted mt-1">Terminé este libro hace unos días...</p>
                    </div>
                    <span className="small text-muted">11-03-2025</span>
                </div>
            </div>

            <div className="text-center mt-4">
                <button className="btn" style={{ backgroundColor: 'var(--color-amarillo)', borderRadius: '20px', padding: '5px 30px' }}> 
                    Ver más 
                </button>
            </div>
        </div>
    );
}