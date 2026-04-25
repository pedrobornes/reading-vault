export default function NoticiaCard( { libro }){


    if(!libro) return null;

    return(
        <div className="card">
            <h3 className="card__titulo">Noticias </h3>
            <div className="card__descripcion">
                <picture className="card__picture">
                    <img 
                        src={libro.portada || 'https://via.placeholder.com/150x200?text=Sin+Portada'} 
                        alt={libro.titulo} 
                        className="card__img"
                    />
                </picture>
                {/* sinopsis q viene de libro */}
                <p className="card__sinopsis">
                    {libro.sinopsis || "Este libro aún no tiene una descripción disponible."}
                </p>
            </div>
        </div>
    )
}