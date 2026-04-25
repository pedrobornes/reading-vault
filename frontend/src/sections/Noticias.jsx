import NoticiaCard from "../components/NoticiaCard";

export default function Noticias() {
    const libroDestacado = {
        titulo: "El nombre del viento",
        portada: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1472067101i/18607805.jpg",
        sinopsis: "En una posada remota, un hombre se dispone a relatar por primera vez la verdadera historia de su vida. Una historia que solo él conoce..."
    };
    return(
        
        <section className="noticias">
            <div className="noticias__bienvenida">
                <h3 className="bienvenida__titulo">Bienvenido a ReadingVault</h3>
                <p className="bienvenida__texto">Encuentra tus libros favoritos, únete a una comunidad y gestiona tu biblioteca personal</p>
            </div>
            <h1 className="noticias__titulo">NOTICIAS</h1>
            {/* aqui iria una card por cada seccion de noticias */}
            <NoticiaCard libro={libroDestacado} />
        </section>
    )
}